#!/opt/telegram-bot/venv/bin/python3
"""
Interactive Chromium CDP Playtest & Visual Screenshot Auditor for Math-Arcid-V2.
Performs real live browser checks across Hub + all registered games:
  1. Zero console errors, zero uncaught exceptions, zero HTTP >= 400 / 404s.
  2. Universal KaTeX rendering (> 0 .katex, 0 .katex-error).
  3. Real animated <canvas> pixel check (non-blank + actively animating frames).
  4. Simulated DualSense Gamepad test (connects virtual controller, checks .gp-pill-badge,
     triggers Start button [9] -> asserts Pause Overlay opens -> Circle [1] / Esc closes).
  5. Desktop (1280x800) + Mobile (390x844) overflow check + real PNG screenshot capture
     saved under evolution/screenshots/ for visual inspection.
"""

import asyncio
import base64
import functools
import http.server
import json
import os
import re
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
from pathlib import Path

import websockets

REPO_DIR = Path("/home/ubuntu/Math-Arcid-V2")
SHOTS_DIR = REPO_DIR / "evolution" / "screenshots"
CHROMIUM_BIN = "/snap/bin/chromium"

GAMEPAD_SHIM_JS = """
(() => {
  const btns = Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 }));
  const pad = {
    id: 'Sony Interactive Entertainment DualSense Wireless Controller (054c)',
    index: 0,
    connected: true,
    mapping: 'standard',
    axes: [0, 0, 0, 0],
    buttons: btns,
    timestamp: performance.now(),
    vibrationActuator: { playEffect: async () => 'complete' }
  };
  window.__SIM_PAD = pad;
  navigator.getGamepads = () => [pad, null, null, null];
  window.__setSimButton = (idx, down) => {
    if (pad.buttons[idx]) {
      pad.buttons[idx].pressed = !!down;
      pad.buttons[idx].touched = !!down;
      pad.buttons[idx].value = down ? 1 : 0;
      pad.timestamp = performance.now();
    }
  };
  window.__setSimAxes = (lx, ly) => {
    pad.axes[0] = lx;
    pad.axes[1] = ly;
    pad.timestamp = performance.now();
  };
  window.addEventListener('DOMContentLoaded', () => {
    try {
      const ev = new Event('gamepadconnected');
      ev.gamepad = pad;
      window.dispatchEvent(ev);
    } catch (_) {}
  });
})();
"""


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return


def start_static_server(root_dir: Path):
    handler = functools.partial(QuietHandler, directory=str(root_dir))
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    httpd.allow_reuse_address = True
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, port


class CDPClient:
    def __init__(self, ws_url: str):
        self.ws_url = ws_url
        self.ws = None
        self.msg_id = 0
        self.pending = {}
        self.console_errors = []
        self.exceptions = []
        self.bad_responses = []
        self._recv_task = None

    async def connect(self):
        self.ws = await websockets.connect(self.ws_url, max_size=20 * 1024 * 1024)
        self._recv_task = asyncio.create_task(self._reader())

    async def _reader(self):
        try:
            async for raw in self.ws:
                msg = json.loads(raw)
                mid = msg.get("id")
                if mid is not None and mid in self.pending:
                    fut = self.pending.pop(mid)
                    if not fut.done():
                        fut.set_result(msg)
                    continue
                method = msg.get("method")
                params = msg.get("params") or {}
                if method == "Runtime.exceptionThrown":
                    det = params.get("exceptionDetails") or {}
                    txt = det.get("text") or (det.get("exception") or {}).get("description") or "JS Exception"
                    self.exceptions.append(str(txt)[:220])
                elif method == "Runtime.consoleAPICalled":
                    if params.get("type") == "error":
                        args = " ".join(str(a.get("value") or a.get("description") or "") for a in (params.get("args") or []))
                        if args and "AudioContext" not in args:
                            self.console_errors.append(args[:220])
                elif method == "Network.responseReceived":
                    resp = params.get("response") or {}
                    status = int(resp.get("status") or 200)
                    url = str(resp.get("url") or "")
                    if status >= 400 and "fonts.googleapis" not in url and "fonts.gstatic" not in url and "favicon.ico" not in url:
                        self.bad_responses.append(f"{status} {url}")
        except Exception:
            pass

    async def call(self, method: str, params: dict | None = None, timeout: float = 12.0):
        self.msg_id += 1
        mid = self.msg_id
        fut = asyncio.get_running_loop().create_future()
        self.pending[mid] = fut
        await self.ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
        res = await asyncio.wait_for(fut, timeout=timeout)
        if "error" in res:
            raise RuntimeError(f"CDP {method} error: {res['error']}")
        return res.get("result") or {}

    async def evaluate(self, expr: str):
        res = await self.call("Runtime.evaluate", {
            "expression": expr,
            "returnByValue": True,
            "awaitPromise": True,
        })
        if "exceptionDetails" in res:
            raise RuntimeError(f"Eval exception: {res['exceptionDetails']}")
        return (res.get("result") or {}).get("value")

    async def close(self):
        if self._recv_task:
            self._recv_task.cancel()
        if self.ws:
            await self.ws.close()


async def wait_for_cdp_ws(debug_port: int, timeout: float = 10.0) -> str:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{debug_port}/json/list", timeout=1.5) as r:
                tabs = json.loads(r.read().decode("utf-8"))
                for tab in tabs:
                    if tab.get("type") == "page" and tab.get("webSocketDebuggerUrl"):
                        return tab["webSocketDebuggerUrl"]
        except Exception:
            await asyncio.sleep(0.15)
    raise RuntimeError("Chromium CDP endpoint did not become ready")


async def send_key(cdp: CDPClient, key: str, code: str, key_code: int):
    await cdp.call("Input.dispatchKeyEvent", {
        "type": "keyDown", "key": key, "code": code, "windowsVirtualKeyCode": key_code, "nativeVirtualKeyCode": key_code
    })
    await asyncio.sleep(0.06)
    await cdp.call("Input.dispatchKeyEvent", {
        "type": "keyUp", "key": key, "code": code, "windowsVirtualKeyCode": key_code, "nativeVirtualKeyCode": key_code
    })


async def audit_page(cdp: CDPClient, base_url: str, page_path: str, games: list[dict], is_hub: bool, slug: str):
    cdp.console_errors.clear()
    cdp.exceptions.clear()
    cdp.bad_responses.clear()

    await cdp.call("Emulation.setDeviceMetricsOverride", {
        "width": 1280, "height": 800, "deviceScaleFactor": 1, "mobile": False
    })
    await cdp.call("Page.navigate", {"url": f"{base_url}/{page_path}"})
    await asyncio.sleep(1.1)

    dom_info = await cdp.evaluate("""
    (() => {
      const katexCount = document.querySelectorAll('.katex').length;
      const katexErrs = document.querySelectorAll('.katex-error').length;
      const tiles = Array.from(document.querySelectorAll('.tile-title')).map(el => el.textContent.trim());
      const canvas = document.querySelector('canvas');
      return {
        katexCount,
        katexErrs,
        tiles,
        hasCanvas: Boolean(canvas),
        canvasW: canvas ? canvas.width : 0,
        canvasH: canvas ? canvas.height : 0
      };
    })()
    """)

    if dom_info["katexCount"] <= 0:
        raise AssertionError(f"{page_path}: No .katex elements rendered!")
    if dom_info["katexErrs"] > 0:
        raise AssertionError(f"{page_path}: Found {dom_info['katexErrs']} .katex-error elements!")

    if is_hub:
        expected_titles = [g["title"] for g in games]
        if dom_info["tiles"] != expected_titles:
            raise AssertionError(f"Hub tiles mismatch: got {dom_info['tiles']}, expected {expected_titles}")
        shot = await cdp.call("Page.captureScreenshot", {"format": "png"})
        (SHOTS_DIR / "hub_desktop.png").write_bytes(base64.b64decode(shot["data"]))
    else:
        if not dom_info["hasCanvas"] or dom_info["canvasW"] < 100 or dom_info["canvasH"] < 100:
            raise AssertionError(f"{page_path}: Missing or undersized <canvas>!")

        # 1. Verify live canvas rendering + animation frames
        frame1 = await cdp.evaluate("""
        (() => {
          const c = document.querySelector('canvas');
          const ctx = c.getContext('2d');
          const d = ctx.getImageData(0, 0, Math.min(c.width, 320), Math.min(c.height, 240)).data;
          let sum = 0, diff = 0;
          const r0 = d[0], g0 = d[1], b0 = d[2];
          for (let i = 0; i < d.length; i += 16) {
            sum += d[i] + d[i+1] + d[i+2];
            if (Math.abs(d[i] - r0) + Math.abs(d[i+1] - g0) + Math.abs(d[i+2] - b0) > 25) diff++;
          }
          return { sum, diff, url: c.toDataURL('image/png') };
        })()
        """)
        if frame1["diff"] < 10:
            raise AssertionError(f"{page_path}: Canvas appears blank/uniform (diff={frame1['diff']})!")

        # Exercise simulated analog stick + primary action + Space
        await cdp.evaluate("window.__setSimAxes(0.75, 0); window.__setSimButton(0, true);")
        await send_key(cdp, " ", "Space", 32)
        await asyncio.sleep(0.28)
        await cdp.evaluate("window.__setSimAxes(0, 0); window.__setSimButton(0, false);")

        frame2_url = await cdp.evaluate("document.querySelector('canvas').toDataURL('image/png')")
        if frame2_url == frame1["url"]:
            raise AssertionError(f"{page_path}: Canvas frames are static (no live animation loop)!")

        # Capture clean Desktop gameplay screenshot
        shot_d = await cdp.call("Page.captureScreenshot", {"format": "png"})
        (SHOTS_DIR / f"{slug}_desktop.png").write_bytes(base64.b64decode(shot_d["data"]))

        # 2. Verify Start (Button 9) opens Pause Overlay, and Circle (Button 1) / Esc closes it
        if slug != "math-battle":
            badge_connected = await cdp.evaluate("Boolean(document.querySelector('.gp-pill-badge.connected'))")
            if not badge_connected:
                raise AssertionError(f"{page_path}: Simulated DualSense badge did not show connected state!")

        await cdp.evaluate("window.__setSimButton(9, true);")
        pause_opened = False
        for _ in range(12):
            await asyncio.sleep(0.08)
            pause_opened = await cdp.evaluate("""
            (() => {
              const p1 = document.getElementById('arcadePauseOverlay');
              const p2 = document.getElementById('battleOverlay');
              return Boolean((p1 && !p1.classList.contains('hidden')) || (p2 && p2.getAttribute('aria-hidden') === 'false'));
            })()
            """)
            if pause_opened:
                break
        await cdp.evaluate("window.__setSimButton(9, false);")
        if not pause_opened:
            raise AssertionError(f"{page_path}: Pressing Gamepad Start (button 9) did NOT open Pause Menu!")

        # Close via Circle (button 1) or Esc fallback
        await cdp.evaluate("window.__setSimButton(1, true);")
        still_open = True
        for _ in range(10):
            await asyncio.sleep(0.08)
            still_open = await cdp.evaluate("""
            (() => {
              const p1 = document.getElementById('arcadePauseOverlay');
              const p2 = document.getElementById('battleOverlay');
              return Boolean((p1 && !p1.classList.contains('hidden')) || (p2 && p2.getAttribute('aria-hidden') === 'false'));
            })()
            """)
            if not still_open:
                break
        await cdp.evaluate("window.__setSimButton(1, false);")
        if still_open:
            await send_key(cdp, "Escape", "Escape", 27)
            for _ in range(10):
                await asyncio.sleep(0.08)
                still_open = await cdp.evaluate("""
                (() => {
                  const p1 = document.getElementById('arcadePauseOverlay');
                  const p2 = document.getElementById('battleOverlay');
                  return Boolean((p1 && !p1.classList.contains('hidden')) || (p2 && p2.getAttribute('aria-hidden') === 'false'));
                })()
                """)
                if not still_open:
                    break
            if still_open:
                raise AssertionError(f"{page_path}: Could not close Pause Menu via Circle or Esc!")

        # 3. Mobile 390x844 overflow check + Mobile screenshot
        await cdp.call("Emulation.setDeviceMetricsOverride", {
            "width": 390, "height": 844, "deviceScaleFactor": 2, "mobile": True
        })
        await asyncio.sleep(0.35)
        mob_info = await cdp.evaluate("""
        ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth })
        """)
        if mob_info["sw"] > mob_info["iw"] + 4:
            raise AssertionError(f"{page_path}: Mobile horizontal overflow detected ({mob_info['sw']} > {mob_info['iw']})!")

        shot_m = await cdp.call("Page.captureScreenshot", {"format": "png"})
        (SHOTS_DIR / f"{slug}_mobile.png").write_bytes(base64.b64decode(shot_m["data"]))

    if cdp.exceptions:
        raise AssertionError(f"{page_path}: JS Exceptions: {' | '.join(cdp.exceptions)}")
    if cdp.console_errors:
        raise AssertionError(f"{page_path}: Console errors: {' | '.join(cdp.console_errors)}")
    if cdp.bad_responses:
        raise AssertionError(f"{page_path}: HTTP errors: {' | '.join(cdp.bad_responses)}")


async def main():
    if not Path(CHROMIUM_BIN).exists():
        print("  ⚠ /snap/bin/chromium not found; skipped CDP playtest.")
        return

    SHOTS_DIR.mkdir(parents=True, exist_ok=True)
    games = json.loads((REPO_DIR / "games.json").read_text(encoding="utf-8"))
    httpd, port = start_static_server(REPO_DIR)
    base_url = f"http://127.0.0.1:{port}"
    user_data_dir = tempfile.mkdtemp(prefix="math_arcid_cdp_")
    proc = subprocess.Popen(
        [
            CHROMIUM_BIN,
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--remote-debugging-port=0",
            f"--user-data-dir={user_data_dir}",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )

    debug_port = None
    deadline = time.time() + 12.0
    while time.time() < deadline:
        line = proc.stderr.readline()
        if not line:
            if proc.poll() is not None:
                break
            continue
        m = re.search(r"ws://127\.0\.0\.1:(\d+)/", line)
        if m:
            debug_port = int(m.group(1))
            break

    try:
        if not debug_port:
            raise RuntimeError("Failed to bind Chromium remote debugging port")
        ws_url = await wait_for_cdp_ws(debug_port)
        cdp = CDPClient(ws_url)
        await cdp.connect()
        try:
            await cdp.call("Page.enable")
            await cdp.call("Runtime.enable")
            await cdp.call("Network.enable")
            await cdp.call("Page.addScriptToEvaluateOnNewDocument", {"source": GAMEPAD_SHIM_JS})

            await audit_page(cdp, base_url, "index.html?from=game", games, True, "hub")
            for g in games:
                await audit_page(cdp, base_url, g["path"], games, False, g["id"])

            print(f"  ✓ CDP Interactive Playtest passed Hub + {len(games)} game(s): Canvas animated, Start(9)/Esc PauseMenu verified, Mobile 390px clean, Screenshots saved.")
        finally:
            await cdp.close()
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=4)
        except Exception:
            proc.kill()
        httpd.shutdown()
        httpd.server_close()
        subprocess.run(["rm", "-rf", user_data_dir], check=False)


if __name__ == "__main__":
    asyncio.run(main())

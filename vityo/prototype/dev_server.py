#!/usr/bin/env python3
from __future__ import annotations

import json
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
WORKSPACE = ROOT / "workspace"
HOST = "127.0.0.1"
PORT = 4173


def read_workspace() -> dict[str, str]:
    data: dict[str, str] = {}
    for path in sorted(WORKSPACE.glob("*.styio")):
        data[path.name] = path.read_text(encoding="utf-8")
    return data


class PrototypeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def end_json(self, payload: dict, status: int = HTTPStatus.OK) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/api/workspace":
            self.end_json({"files": read_workspace()})
            return

        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)

        if not parsed.path.startswith("/api/workspace/"):
            self.end_json({"error": "unknown endpoint"}, HTTPStatus.NOT_FOUND)
            return

        file_name = unquote(parsed.path.removeprefix("/api/workspace/")).strip()
        if not file_name.endswith(".styio") or "/" in file_name or "\\" in file_name or not file_name:
            self.end_json({"error": "invalid file name"}, HTTPStatus.BAD_REQUEST)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.end_json({"error": "invalid content length"}, HTTPStatus.BAD_REQUEST)
            return

        body = self.rfile.read(length)

        try:
            payload = json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            self.end_json({"error": "invalid json"}, HTTPStatus.BAD_REQUEST)
            return

        content = payload.get("content")
        if not isinstance(content, str):
            self.end_json({"error": "content must be a string"}, HTTPStatus.BAD_REQUEST)
            return

        target = WORKSPACE / file_name
        target.write_text(content, encoding="utf-8")
        self.end_json(
            {
                "ok": True,
                "file": file_name,
                "bytes": len(content.encode("utf-8")),
                "path": str(target),
            }
        )


def main() -> None:
    WORKSPACE.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer((HOST, PORT), PrototypeHandler)
    print(f"styio-view dev server listening on http://{HOST}:{PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

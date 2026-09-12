#!/usr/bin/env python3
"""Local static server with HTTP byte-range support for seekable MP4 playback."""

from __future__ import annotations

import argparse
import os
import re
import shutil
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


class RangeRequestHandler(SimpleHTTPRequestHandler):
    range: tuple[int, int] | None = None

    def end_headers(self) -> None:
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    def send_head(self):
        self.range = None
        path = self.translate_path(self.path)

        if os.path.isdir(path):
            return super().send_head()

        try:
            file_obj = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        try:
            stat = os.fstat(file_obj.fileno())
            size = stat.st_size
            start, end = 0, max(size - 1, 0)
            range_header = self.headers.get("Range")

            if range_header:
                match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())
                if not match:
                    self.send_error(416, "Invalid byte range")
                    file_obj.close()
                    return None

                first, last = match.groups()
                if first == "" and last == "":
                    self.send_error(416, "Invalid byte range")
                    file_obj.close()
                    return None

                if first == "":
                    suffix_length = int(last)
                    if suffix_length <= 0:
                        self.send_error(416, "Invalid byte range")
                        file_obj.close()
                        return None
                    start = max(size - suffix_length, 0)
                else:
                    start = int(first)
                    if last:
                        end = min(int(last), end)

                if start >= size or start > end:
                    self.send_response(416)
                    self.send_header("Content-Range", f"bytes */{size}")
                    self.end_headers()
                    file_obj.close()
                    return None

                self.range = (start, end)
                self.send_response(206)
                self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
                self.send_header("Content-Length", str(end - start + 1))
            else:
                self.send_response(200)
                self.send_header("Content-Length", str(size))

            self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Last-Modified", self.date_time_string(stat.st_mtime))
            self.end_headers()
            return file_obj
        except Exception:
            file_obj.close()
            raise

    def copyfile(self, source, outputfile) -> None:
        if self.range is None:
            shutil.copyfileobj(source, outputfile)
            return

        start, end = self.range
        source.seek(start)
        remaining = end - start + 1
        block_size = 64 * 1024
        while remaining > 0:
            chunk = source.read(min(block_size, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve the portfolio with byte-range support.")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--bind", default="127.0.0.1")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    os.chdir(root)
    server = ThreadingHTTPServer((args.bind, args.port), RangeRequestHandler)
    print(f"Portfolio available at http://{args.bind}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

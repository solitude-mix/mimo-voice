from __future__ import annotations

import json
import logging
import mimetypes
import pathlib
import time
import urllib.request
from typing import Optional

from ..core.config import Settings


logger = logging.getLogger(__name__)


class TelegramClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    def send_voice(self, chat_id: str, voice_path: pathlib.Path, reply_to_message_id: Optional[str] = None) -> dict:
        started = time.perf_counter()
        url = f"{self.settings.channel.telegram.api_base}/bot{self.settings.channel.telegram.bot_token}/sendVoice"
        fields = {"chat_id": chat_id}
        if reply_to_message_id:
            fields["reply_to_message_id"] = reply_to_message_id
        logger.info("Telegram sendVoice start chat_id=%s file=%s size=%s", chat_id, voice_path.name, voice_path.stat().st_size)
        boundary, data = encode_multipart(fields, {"voice": voice_path})
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8", errors="replace")
        obj = json.loads(body)
        if not obj.get("ok"):
            raise RuntimeError(f"Telegram sendVoice failed: {body}")
        elapsed = time.perf_counter() - started
        logger.info("Telegram sendVoice done message_id=%s elapsed=%.2fs", obj.get("result", {}).get("message_id"), elapsed)
        return obj


def encode_multipart(fields: dict, files: dict):
    boundary = f"----OpenClawBoundary{int(time.time()*1000)}"
    body = bytearray()

    def add_line(line: bytes):
        body.extend(line + b"\r\n")

    for key, value in fields.items():
        add_line(f"--{boundary}".encode())
        add_line(f'Content-Disposition: form-data; name="{key}"'.encode())
        add_line(b"")
        add_line(str(value).encode("utf-8"))

    for field_name, path in files.items():
        filename = path.name
        content_type = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        add_line(f"--{boundary}".encode())
        add_line(f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"'.encode())
        add_line(f"Content-Type: {content_type}".encode())
        add_line(b"")
        body.extend(path.read_bytes())
        body.extend(b"\r\n")

    add_line(f"--{boundary}--".encode())
    return boundary, bytes(body)

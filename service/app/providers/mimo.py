from __future__ import annotations

import base64
import json
import logging
import time
import urllib.request
from typing import Optional

from ..core.config import Settings


logger = logging.getLogger(__name__)


class MimoClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    def synthesize(self, text: str, voice: Optional[str] = None, user_prompt: Optional[str] = None) -> bytes:
        started = time.perf_counter()
        selected_voice = voice or self.settings.provider.default_voice
        messages = []
        if user_prompt and user_prompt.strip():
            messages.append({"role": "user", "content": user_prompt.strip()})
        messages.append({"role": "assistant", "content": text.strip()})

        payload = {
            "model": self.settings.mimo_model,
            "messages": messages,
            "audio": {
                "format": self.settings.mimo_audio_format,
                "voice": selected_voice,
            },
        }
        logger.info(
            "MiMo synth start voice=%s chars=%s user_prompt=%s",
            selected_voice,
            len(text.strip()),
            bool(user_prompt and user_prompt.strip()),
        )
        req = urllib.request.Request(
            self.settings.mimo_api_url,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "api-key": self.settings.mimo_api_key,
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8", errors="replace")

        obj = json.loads(body)
        try:
            audio = base64.b64decode(obj["choices"][0]["message"]["audio"]["data"])
        except Exception as exc:
            raise RuntimeError(f"MiMo response missing audio data: {json.dumps(obj, ensure_ascii=False)[:800]}") from exc
        elapsed = time.perf_counter() - started
        logger.info("MiMo synth done bytes=%s elapsed=%.2fs", len(audio), elapsed)
        return audio


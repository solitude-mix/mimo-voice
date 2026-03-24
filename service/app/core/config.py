from __future__ import annotations

import os
import pathlib
import re
from dataclasses import dataclass
from functools import lru_cache
from typing import Optional


ENV_PATH = pathlib.Path.home() / ".openclaw" / ".env"


class ConfigError(RuntimeError):
    pass


def load_env_value(name: str) -> Optional[str]:
    value = os.environ.get(name)
    if value and value.strip():
        return value.strip()

    if ENV_PATH.exists():
        txt = ENV_PATH.read_text(encoding="utf-8", errors="ignore")
        match = re.search(rf"^\s*{re.escape(name)}\s*=\s*(.+?)\s*$", txt, re.M)
        if match:
            return match.group(1).strip().strip('"').strip("'")
    return None


@dataclass(frozen=True)
class Settings:
    mimo_api_url: str = "https://api.xiaomimimo.com/v1/chat/completions"
    mimo_model: str = "mimo-v2-tts"
    mimo_default_voice: str = "default_zh"
    mimo_audio_format: str = "wav"
    telegram_api_base: str = "https://api.telegram.org"
    data_dir: pathlib.Path = pathlib.Path(__file__).resolve().parents[1] / "data"
    audio_keep_dir: pathlib.Path = pathlib.Path(__file__).resolve().parents[1] / "data" / "outbox"
    raw_tts_dir: pathlib.Path = pathlib.Path(__file__).resolve().parents[1] / "data" / "tts"

    @property
    def mimo_api_key(self) -> str:
        value = load_env_value("MIMO_API_KEY")
        if not value:
            raise ConfigError("Missing MIMO_API_KEY. Set it in env or ~/.openclaw/.env")
        return value

    @property
    def telegram_bot_token(self) -> str:
        value = load_env_value("TELEGRAM_BOT_TOKEN")
        if not value:
            raise ConfigError("Missing TELEGRAM_BOT_TOKEN. Set it in env or ~/.openclaw/.env")
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    settings.audio_keep_dir.mkdir(parents=True, exist_ok=True)
    settings.raw_tts_dir.mkdir(parents=True, exist_ok=True)
    return settings

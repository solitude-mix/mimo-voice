from __future__ import annotations

import os
import pathlib
import re
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Optional


ENV_PATH = pathlib.Path.home() / ".openclaw" / ".env"
APP_DIR = pathlib.Path(__file__).resolve().parents[1]
DATA_DIR = APP_DIR / "data"


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
class ProviderSettings:
    kind: str = "mimo"
    base_url: str = "https://api.xiaomimimo.com/v1/chat/completions"
    model: str = "mimo-v2-tts"
    default_voice: str = "default_zh"
    audio_format: str = "wav"

    @property
    def api_key(self) -> str:
        value = load_env_value("MIMO_API_KEY")
        if not value:
            raise ConfigError("Missing MIMO_API_KEY. Set it in env or ~/.openclaw/.env")
        return value


@dataclass(frozen=True)
class ChannelTelegramSettings:
    api_base: str = "https://api.telegram.org"

    @property
    def bot_token(self) -> str:
        value = load_env_value("TELEGRAM_BOT_TOKEN")
        if not value:
            raise ConfigError("Missing TELEGRAM_BOT_TOKEN. Set it in env or ~/.openclaw/.env")
        return value


@dataclass(frozen=True)
class ChannelSettings:
    kind: str = "telegram"
    telegram: ChannelTelegramSettings = field(default_factory=ChannelTelegramSettings)


@dataclass(frozen=True)
class AudioSettings:
    raw_tts_dir: pathlib.Path = DATA_DIR / "tts"
    audio_keep_dir: pathlib.Path = DATA_DIR / "outbox"


@dataclass(frozen=True)
class RuntimeSettings:
    data_dir: pathlib.Path = DATA_DIR


@dataclass(frozen=True)
class Settings:
    provider: ProviderSettings = field(default_factory=ProviderSettings)
    channel: ChannelSettings = field(default_factory=ChannelSettings)
    audio: AudioSettings = field(default_factory=AudioSettings)
    runtime: RuntimeSettings = field(default_factory=RuntimeSettings)

    # Compatibility accessors for current alpha code.
    @property
    def mimo_api_url(self) -> str:
        return self.provider.base_url

    @property
    def mimo_model(self) -> str:
        return self.provider.model

    @property
    def mimo_default_voice(self) -> str:
        return self.provider.default_voice

    @property
    def mimo_audio_format(self) -> str:
        return self.provider.audio_format

    @property
    def mimo_api_key(self) -> str:
        return self.provider.api_key

    @property
    def telegram_api_base(self) -> str:
        return self.channel.telegram.api_base

    @property
    def telegram_bot_token(self) -> str:
        return self.channel.telegram.bot_token

    @property
    def data_dir(self) -> pathlib.Path:
        return self.runtime.data_dir

    @property
    def audio_keep_dir(self) -> pathlib.Path:
        return self.audio.audio_keep_dir

    @property
    def raw_tts_dir(self) -> pathlib.Path:
        return self.audio.raw_tts_dir


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.runtime.data_dir.mkdir(parents=True, exist_ok=True)
    settings.audio.audio_keep_dir.mkdir(parents=True, exist_ok=True)
    settings.audio.raw_tts_dir.mkdir(parents=True, exist_ok=True)
    return settings

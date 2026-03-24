from __future__ import annotations

import json
import os
import pathlib
import re
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Any, Optional


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


def load_env_value_or_default(name: str, default: str) -> str:
    value = load_env_value(name)
    return value if value else default


def _ensure_dict(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ConfigError(f"{label} must be an object/dict")
    return value


def _first_present(mapping: dict[str, Any], keys: list[str]) -> Any:
    for key in keys:
        if key in mapping and mapping[key] not in (None, ""):
            return mapping[key]
    return None


def _load_structured_config(path_str: str) -> dict[str, Any]:
    cfg_path = pathlib.Path(path_str).expanduser()
    if not cfg_path.exists():
        raise ConfigError(f"mini-vico config file not found: {cfg_path}")

    raw = cfg_path.read_text(encoding="utf-8", errors="ignore")
    suffix = cfg_path.suffix.lower()

    if suffix == ".json":
        try:
            return _ensure_dict(json.loads(raw), f"mini-vico config {cfg_path}")
        except json.JSONDecodeError as exc:
            raise ConfigError(f"mini-vico JSON config is invalid: {exc}") from exc

    if suffix in {".yaml", ".yml"}:
        try:
            import yaml  # type: ignore
        except Exception as exc:
            raise ConfigError(
                "mini-vico YAML config requires PyYAML, but it is not installed. "
                "Use JSON config for now or add PyYAML to the environment."
            ) from exc
        loaded = yaml.safe_load(raw)
        return _ensure_dict(loaded, f"mini-vico config {cfg_path}")

    raise ConfigError(
        f"Unsupported mini-vico config format: {cfg_path.suffix or '<no suffix>'}. "
        "Supported formats today: .json, .yaml, .yml"
    )


def _resolve_profile_block(data: dict[str, Any], profile: str) -> dict[str, Any]:
    if isinstance(data.get("profiles"), dict):
        profiles = _ensure_dict(data["profiles"], "mini-vico profiles")
        if profile in profiles:
            return _ensure_dict(profiles[profile], f"mini-vico profile '{profile}'")

    for container_key in ["mini_vico", "mini-vico", "provider", "mimo"]:
        container = data.get(container_key)
        if isinstance(container, dict):
            if isinstance(container.get("profiles"), dict) and profile in container["profiles"]:
                return _ensure_dict(container["profiles"][profile], f"mini-vico profile '{profile}'")
            if profile == "default":
                return _ensure_dict(container, f"mini-vico container '{container_key}'")

    if profile == "default":
        return data

    raise ConfigError(
        f"mini-vico profile '{profile}' not found. "
        "Provide MINI_VICO_CONFIG_PATH with a matching profile or use profile=default."
    )


@dataclass(frozen=True)
class MiniVicoSourceSettings:
    profile: str = field(default_factory=lambda: load_env_value_or_default("MIMO_PROVIDER_PROFILE", "default"))
    config_path: Optional[str] = field(default_factory=lambda: load_env_value("MINI_VICO_CONFIG_PATH"))


@dataclass(frozen=True)
class ProviderSettings:
    kind: str = field(default_factory=lambda: load_env_value_or_default("MIMO_PROVIDER_KIND", "mimo"))
    source: str = field(default_factory=lambda: load_env_value_or_default("MIMO_PROVIDER_SOURCE", "direct"))
    base_url: str = field(default_factory=lambda: load_env_value_or_default("MIMO_API_URL", "https://api.xiaomimimo.com/v1/chat/completions"))
    model: str = field(default_factory=lambda: load_env_value_or_default("MIMO_MODEL", "mimo-v2-tts"))
    default_voice: str = field(default_factory=lambda: load_env_value_or_default("MIMO_DEFAULT_VOICE", "default_zh"))
    audio_format: str = field(default_factory=lambda: load_env_value_or_default("MIMO_AUDIO_FORMAT", "wav"))
    mini_vico: MiniVicoSourceSettings = field(default_factory=MiniVicoSourceSettings)

    @property
    def api_key(self) -> str:
        value = load_env_value("MIMO_API_KEY")
        if not value:
            raise ConfigError("Missing MIMO_API_KEY. Set it in env or ~/.openclaw/.env")
        return value


@dataclass(frozen=True)
class ResolvedProviderSettings:
    kind: str
    source: str
    base_url: str
    model: str
    default_voice: str
    audio_format: str
    api_key: str


def resolve_provider_settings(provider: ProviderSettings) -> ResolvedProviderSettings:
    source = (provider.source or "direct").strip().lower()
    if source == "direct":
        return ResolvedProviderSettings(
            kind=provider.kind,
            source=source,
            base_url=provider.base_url,
            model=provider.model,
            default_voice=provider.default_voice,
            audio_format=provider.audio_format,
            api_key=provider.api_key,
        )

    if source in {"mini-vico", "mini_vico"}:
        config_path = provider.mini_vico.config_path
        if not config_path:
            raise ConfigError(
                "Provider source 'mini-vico' requires MINI_VICO_CONFIG_PATH. "
                "For now, provide a JSON or YAML config file."
            )

        raw_data = _load_structured_config(config_path)
        profile_block = _resolve_profile_block(raw_data, provider.mini_vico.profile)

        base_url = _first_present(profile_block, ["base_url", "api_url", "endpoint", "url"])
        model = _first_present(profile_block, ["model", "model_name"])
        default_voice = _first_present(profile_block, ["voice", "default_voice", "speaker"])
        audio_format = _first_present(profile_block, ["audio_format", "format"]) or "wav"
        api_key = _first_present(profile_block, ["api_key", "token"])

        if not base_url:
            raise ConfigError("mini-vico config did not provide base_url/api_url/endpoint/url")
        if not model:
            raise ConfigError("mini-vico config did not provide model/model_name")
        if not default_voice:
            default_voice = provider.default_voice
        if not api_key:
            api_key = load_env_value("MIMO_API_KEY")
        if not api_key:
            raise ConfigError(
                "mini-vico config did not provide api_key/token, and MIMO_API_KEY is also missing"
            )

        return ResolvedProviderSettings(
            kind=provider.kind,
            source=source,
            base_url=str(base_url),
            model=str(model),
            default_voice=str(default_voice),
            audio_format=str(audio_format),
            api_key=str(api_key),
        )

    raise ConfigError(
        f"Unsupported provider source: {provider.source}. "
        "Supported sources today: direct, mini-vico."
    )


@dataclass(frozen=True)
class ChannelTelegramSettings:
    api_base: str = field(default_factory=lambda: load_env_value_or_default("TELEGRAM_API_BASE", "https://api.telegram.org"))

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

    @property
    def resolved_provider(self) -> ResolvedProviderSettings:
        return resolve_provider_settings(self.provider)

    # Compatibility accessors for current alpha code.
    @property
    def mimo_api_url(self) -> str:
        return self.resolved_provider.base_url

    @property
    def mimo_model(self) -> str:
        return self.resolved_provider.model

    @property
    def mimo_default_voice(self) -> str:
        return self.resolved_provider.default_voice

    @property
    def mimo_audio_format(self) -> str:
        return self.resolved_provider.audio_format

    @property
    def mimo_api_key(self) -> str:
        return self.resolved_provider.api_key

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

# MiMo Voice Service

[中文说明](./SERVICE.zh-CN.md) | [English](./SERVICE.md)

`service/` is the MiMo Voice Python service component.

It provides:
- MiMo TTS
- audio conversion
- Telegram voice sending
- HTTP API
- local CLI

## Requirements

- Python 3.10+
- `python3`
- a working Python `venv` / `pip` environment
- `ffmpeg`
- `MIMO_API_KEY`
- `TELEGRAM_BOT_TOKEN` (only needed for Telegram voice sending)

If you use WSL, prefer `python3` instead of bare `python`.

On Ubuntu / WSL, you will usually also need:

```bash
sudo apt update
sudo apt install -y python3-venv
```

If your system Python is 3.12, also install:

```bash
sudo apt install -y python3.12-venv
```

## Provider configuration entry points

Current practical provider-side environment variables:

```env
MIMO_PROVIDER_KIND=mimo
MIMO_PROVIDER_SOURCE=direct
MIMO_API_KEY=your_mimo_api_key
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2-tts
MIMO_DEFAULT_VOICE=default_zh
MIMO_AUDIO_FORMAT=wav
```

Current practical Telegram-side environment variables:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_API_BASE=https://api.telegram.org
```

Planned source-skeleton environment variables (recognized as skeleton only, not implemented yet):

```env
# MIMO_PROVIDER_SOURCE=mini-vico
# MIMO_PROVIDER_PROFILE=default
# MINI_VICO_CONFIG_PATH=/path/to/mini-vico/config.json
```

Current alpha code reads these values from process env or `~/.openclaw/.env`.

When installed through the OpenClaw CLI with `systemd --user`, the generated unit reads both:
- `~/.openclaw/.env`
- `service/.env` (optional service-local overrides such as proxy settings)

Current precedence behavior:
- prefer values from `~/.openclaw/.env`
- allow `service/.env` as a service-local override entry point for installer-managed systemd runs
- fall back to inherited process env only when the file path in use does not define that variable
- reject placeholder secret values like `your_telegram_bot_token` and `your_mimo_api_key`

This is the current provider config entry point before a fuller normalized config file is introduced.

Current state:
- `MIMO_PROVIDER_SOURCE=direct` works today
- `MIMO_PROVIDER_SOURCE=mini-vico` works through a minimal JSON/YAML config adapter
- required fields still need to exist in the selected config profile

## Start

```bash
cd service
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
bash scripts/start.sh
```

If `python3 -m pip ...` fails with `No module named pip`, the current system is missing a complete `venv` / `ensurepip` setup, or the existing `.venv` is broken. A common fix is:

```bash
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

Default address:
- `http://127.0.0.1:8091`

Background start / status / stop:

```bash
bash scripts/start-bg.sh
bash scripts/status.sh
bash scripts/stop-bg.sh
```

Installer-managed runtime note:
- the current installer tries to install a `systemd --user` service for MiMo
- before enabling the unit, the installer attempts to stop stale local listeners already occupying port `8091`
- if `systemctl --user` is unavailable, it falls back to `start-bg.sh`
- if Telegram or provider requests need a proxy under systemd, add `HTTP_PROXY` / `HTTPS_PROXY` / `ALL_PROXY` to `service/.env` or `~/.openclaw/.env`

Runtime behavior notes:
- `start-bg.sh` removes a stale pid file automatically before starting
- `start-bg.sh` exits early if the service is already running
- `stop-bg.sh` removes a stale pid file instead of failing hard
- runtime log path: `service/.runtime/service.log`

## API examples

### Health check

```bash
curl http://127.0.0.1:8091/health
```

### Output WAV

```bash
curl -X POST http://127.0.0.1:8091/tts/raw \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello from MiMo Voice.",
    "voice": "default_zh",
    "dialect": "粤语",
    "style": "开心"
  }' \
  --output /tmp/mimo.wav
```

Notes:
- `/tts` and `/tts/raw` now accept `style`, `emotion`, `dialect`, and `no_style_tag`
- if the text already starts with an inline performance prefix such as `（小声）...`, the service will avoid auto-prepending another `<style>...</style>` tag
- a small conservative Cantonese rewrite is applied only for short `粤语/广东话` requests; it is intentionally limited and does not attempt full translation

### Send Telegram voice

```bash
curl -X POST http://127.0.0.1:8091/telegram/send-voice \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Hello from MiMo Voice.",
    "chat_id": "<your-chat-id>",
    "voice": "default_zh",
    "style": "happy"
  }'
```

## CLI examples

```bash
bash scripts/cli.sh health
bash scripts/cli.sh tts "Hello from MiMo Voice." --save-file
bash scripts/cli.sh send-telegram-voice "Hello from MiMo Voice." --chat-id <your-chat-id>
```

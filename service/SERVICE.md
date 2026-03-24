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

Current alpha code reads these values from process env or `~/.openclaw/.env`.

This is the current provider config entry point before a fuller normalized config file is introduced.

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
    "voice": "default_zh"
  }' \
  --output /tmp/mimo.wav
```

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

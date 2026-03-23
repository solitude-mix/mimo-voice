# MiMo Voice Service

This folder contains the packaged Python service used by `mimo-voice-openclaw-cli`.

The service provides:
- MiMo TTS
- audio conversion
- Telegram voice sending
- HTTP API
- local CLI

## Requirements

- Python 3.10+
- `python3`
- `ffmpeg`
- `MIMO_API_KEY`
- `TELEGRAM_BOT_TOKEN` (only needed for Telegram voice sending)

## Start

```bash
cd service
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
bash scripts/start.sh
```

## Health check

```bash
curl http://127.0.0.1:8091/health
```

## CLI examples

```bash
bash scripts/cli.sh health
bash scripts/cli.sh tts "你好，我是小音。" --save-file
bash scripts/cli.sh send-telegram-voice "你好，我是小音。" --chat-id <your-chat-id>
```

## Notes

- The CLI outputs JSON.
- Long text is split automatically when needed.
- In WSL environments, use `python3` rather than bare `python`.

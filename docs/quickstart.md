# MiMo Voice Quick Start

This is the shortest practical path for getting MiMo Voice working with OpenClaw and Telegram.

If you are new, follow these steps in order.

---

## 1. What you need before starting

You need all of these:

- Linux / WSL / macOS
- `openclaw`
- `python3`
- `ffmpeg`
- `node` / `npm`
- a working TTS backend or API
- a Telegram bot token
- a Telegram chat id for testing

---

## 2. Install system dependencies

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install -y ffmpeg python3-venv
```

If your Python is 3.12:

```bash
sudo apt install -y python3.12-venv
```

macOS:

```bash
brew install ffmpeg
```

---

## 3. Install the CLI

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.5
```

---

## 4. Run doctor and install

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

---

## 5. Set provider and Telegram credentials

Copy or adapt these values into your environment or `~/.openclaw/.env`:

```env
MIMO_API_KEY=your_mimo_api_key
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2-tts
MIMO_DEFAULT_VOICE=default_zh
MIMO_AUDIO_FORMAT=wav
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_API_BASE=https://api.telegram.org
```

See:

- `../service/.env.example`

Important:

- `MIMO_API_KEY` is provider-side config
- `TELEGRAM_BOT_TOKEN` is channel-side config
- these are not the same thing as OpenClaw plugin config

---

## 6. Write OpenClaw plugin config

Basic configure flow:

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/projects/mimo-voice/service
```

If you want to preview first:

```bash
mimo-voice-openclaw configure --dry-run
```

Example plugin config shape:

```jsonc
{
  "plugins": {
    "entries": {
      "mimo-voice-openclaw": {
        "enabled": true,
        "config": {
          "serviceBaseUrl": "http://127.0.0.1:8091",
          "serviceDir": "/path/to/projects/mimo-voice/service",
          "defaultChatId": "123456789",
          "defaultChannel": "telegram",
          "preferCli": false
        }
      }
    }
  }
}
```

See also:

- `../plugin/example-config.jsonc`

---

## 7. Verify the plugin and service

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear yet, restart the gateway and verify again.

---

## 8. Test speech generation

Recommended command:

```bash
openclaw mimo-voice generate-speech "你好，这是一条测试语音"
```

Compatibility command still available:

```bash
openclaw mimo-voice tts "你好，这是一条测试语音"
```

---

## 9. Test Telegram delivery

Recommended command:

```bash
openclaw mimo-voice deliver-voice "你好，这是一条测试语音" --chat-id 123456789
```

Compatibility command still available:

```bash
openclaw mimo-voice send-telegram-voice "你好，这是一条测试语音" --chat-id 123456789
```

---

## 10. If it still does not work

Check these in order:

1. Is `openclaw` installed and working?
2. Did `mimo-voice-openclaw install` complete successfully?
3. Does `openclaw plugins info mimo-voice-openclaw` show the plugin?
4. Is the service reachable at `http://127.0.0.1:8091/health`?
5. Is `MIMO_API_KEY` correct?
6. Is `TELEGRAM_BOT_TOKEN` correct?
7. Are you sending to the right Telegram chat id?
8. Did you restart the gateway if commands did not appear?

---

## 11. Read next

- `../README.md`
- `../README.zh-CN.md`
- `../docs/configuration.md`
- `../docs/openclaw-integration.md`
- `../plugin/PLUGIN.md`
- `../cli/README.md`

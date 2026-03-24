# MiMo Voice Quick Start

This is the shortest practical path for getting MiMo Voice working with OpenClaw and Telegram.

**Current model scope:** this project currently targets **Xiaomi MiMo-V2-TTS** on the Xiaomi platform. If more models are added later, they are still expected to stay within the Xiaomi platform family rather than becoming a generic multi-vendor TTS aggregator.

If you are new, follow these steps in order.

---

## 1. What you need before starting

You need all of these:

- Linux / WSL / macOS
- `openclaw`
- `python3`
- `ffmpeg`
- `node` / `npm`
- access to Xiaomi MiMo-V2-TTS
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
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.7
```

---

## 4. Run doctor and install

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

---

## 5. Know which files you actually need to edit

For a first-time setup, the important files are:

1. **`~/.openclaw/.env`**
   - provider source selection
   - Xiaomi MiMo / mini-vico related credentials
   - Telegram bot token

2. **mini-vico config file** (only if you choose `MIMO_PROVIDER_SOURCE=mini-vico`)
   - for example: `~/.openclaw/mini-vico.json`

3. **OpenClaw plugin config**
   - usually written through `mimo-voice-openclaw configure`

---

## 6. Set provider and Telegram credentials

Copy or adapt these values into `~/.openclaw/.env`:

```env
MIMO_PROVIDER_SOURCE=direct
MIMO_API_KEY=your_mimo_api_key
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2-tts
MIMO_DEFAULT_VOICE=default_zh
MIMO_AUDIO_FORMAT=wav
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_API_BASE=https://api.telegram.org
```

If you want to use the mini-vico source adapter instead:

```env
MIMO_PROVIDER_SOURCE=mini-vico
MIMO_PROVIDER_PROFILE=default
MINI_VICO_CONFIG_PATH=/home/zhoutiansheng/.openclaw/mini-vico.json
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

See:

- `../service/.env.example`
- `../examples/mini-vico.example.json`

Important:

- `MIMO_API_KEY` is provider-side config
- `TELEGRAM_BOT_TOKEN` is channel-side config
- these are not the same thing as OpenClaw plugin config

---

## 7. Write OpenClaw plugin config

Basic configure flow:

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /absolute/path/to/mimo-voice/service \
  --default-channel telegram
```

What `--service-dir` means:

- it is the absolute path to this repository's `service/` directory
- it is not the OpenClaw installation directory
- it is not an arbitrary new folder named `service`

Example:

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /home/zhoutiansheng/.openclaw/workspace-main/projects/mimo-voice/service \
  --default-channel telegram
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

## 8. Verify the plugin and service

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear yet, restart the gateway and verify again.

---

## 9. Test speech generation

Recommended command:

```bash
openclaw mimo-voice generate-speech "你好，这是一条测试语音"
```

Compatibility command still available:

```bash
openclaw mimo-voice tts "你好，这是一条测试语音"
```

---

## 10. Test Telegram delivery

Recommended command:

```bash
openclaw mimo-voice deliver-voice "你好，这是一条测试语音" --chat-id 123456789
```

Compatibility command still available:

```bash
openclaw mimo-voice send-telegram-voice "你好，这是一条测试语音" --chat-id 123456789
```

---

## 11. If it still does not work

Check these in order:

1. Is `openclaw` installed and working?
2. Did `mimo-voice-openclaw install` complete successfully?
3. Does `openclaw plugins info mimo-voice-openclaw` show the plugin?
4. Is the service reachable at `http://127.0.0.1:8091/health`?
5. Is `MIMO_API_KEY` correct, or does your mini-vico config provide a valid `api_key`?
6. Is `TELEGRAM_BOT_TOKEN` correct?
7. Are you sending to the right Telegram chat id?
8. Did you restart the gateway if commands did not appear?

---

## 12. Read next

- `../README.md`
- `../README.zh-CN.md`
- `../docs/configuration.md`
- `../docs/openclaw-integration.md`
- `../plugin/PLUGIN.md`
- `../cli/README.md`

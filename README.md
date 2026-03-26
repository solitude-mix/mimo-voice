# MiMo Voice

[![npm version](https://img.shields.io/npm/v/mimo-voice-openclaw-cli?color=cb3837&label=npm)](https://www.npmjs.com/package/mimo-voice-openclaw-cli)
[![GitHub release](https://img.shields.io/github/v/release/solitude-mix/mimo-voice?display_name=tag)](https://github.com/solitude-mix/mimo-voice/releases)
[![License](https://img.shields.io/github/license/solitude-mix/mimo-voice)](./cli/LICENSE)

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice is a voice-delivery project for **OpenClaw + Telegram**.

## Current support scope

- **Model platform:** Xiaomi only
- **Current model:** **MiMo-V2-TTS**
- **Current delivery channel:** **Telegram voice**
- **Current integration path:** **OpenClaw plugin + CLI**

If more models are added later, they are still expected to stay within the **Xiaomi platform** rather than turning this project into a generic multi-vendor TTS aggregator.

---

## What you actually need to edit

If you are new, focus on **2 files**.

### 1. `~/.openclaw/.env`

This is the main config file.

### 2. `~/.openclaw/mini-vico.json`

Only needed if you use:

```env
MIMO_PROVIDER_SOURCE=mini-vico
```

### What does `MIMO_PROVIDER_SOURCE` mean?

It tells MiMo Voice **where to read model/provider configuration from**.

Today there are only two values:

- `direct`: read `MIMO_API_URL`, `MIMO_MODEL`, `MIMO_API_KEY`, etc. directly from `~/.openclaw/.env`
- `mini-vico`: read model/provider settings from `mini-vico.json`

---

## Shortest path: just follow these steps

### Step 1: install system dependencies

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

### Step 2: install the CLI

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.8
```

---

### Step 3: write `~/.openclaw/.env`

#### Option A: direct MiMo config (simplest)

Write this into:

```bash
~/.openclaw/.env
```

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

#### Option B: read from mini-vico config

Set `~/.openclaw/.env` to:

```env
MIMO_PROVIDER_SOURCE=mini-vico
MIMO_PROVIDER_PROFILE=default
MINI_VICO_CONFIG_PATH=/home/zhoutiansheng/.openclaw/mini-vico.json
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_API_BASE=https://api.telegram.org
```

Then create:

```bash
~/.openclaw/mini-vico.json
```

```json
{
  "profiles": {
    "default": {
      "base_url": "https://api.xiaomimimo.com/v1/chat/completions",
      "api_key": "your_api_key",
      "model": "mimo-v2-tts",
      "voice": "default_zh",
      "audio_format": "wav"
    }
  }
}
```

If you do not want to keep `api_key` in `mini-vico.json`, you can instead keep it in `~/.openclaw/.env`:

```env
MIMO_API_KEY=your_mimo_api_key
```

---

### Step 4: run doctor and install

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

What changed in the current alpha:

- `doctor` rejects placeholder secrets like `your_telegram_bot_token` instead of treating them as valid
- the service runtime prefers `~/.openclaw/.env` over inherited outer environment values
- `install` tries to install a `systemd --user` service for MiMo when available, with background-script fallback when it is not

---

### Step 5: connect OpenClaw to the service

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /absolute/path/to/mimo-voice/service \
  --default-channel telegram
```

### What `--service-dir` means

It is:

- the absolute path to this repository's `service/` directory
- not the OpenClaw installation directory
- not an arbitrary new folder named `service`

Example:

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /home/zhoutiansheng/.openclaw/workspace-main/projects/mimo-voice/service \
  --default-channel telegram
```

If you only want to preview changes first:

```bash
mimo-voice-openclaw configure --dry-run
```

What `configure` now also does:

- writes `plugins.entries.mimo-voice-openclaw.config`
- keeps `mimo-voice-openclaw` in `plugins.allow`
- automatically adds `mimo_voice` to the compatible OpenClaw tools allowlist (prefers `tools.alsoAllow` when present)

This matters on newer OpenClaw versions, where plugin tools can exist but still be blocked unless explicitly allowed.

If you also set `defaultChatId`, the current alpha plugin can additionally try a first Telegram DM auto-voice path for:

- explicit prefixes such as `语音：你好`, `tts: hello`, `发语音：晚点回你`
- simple natural-language requests such as `请用粤语语音回复我一句：你好，我是小音。`

Current scope is still intentionally conservative:
- it extracts only basic `dialect` / `emotion` / `style` hints
- short `粤语/广东话` requests may get a small built-in rewrite pass for more natural phrasing
- it is still not a full general-purpose NLU or translation pipeline

---

### Step 6: verify plugin and service

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear yet, restart the gateway and try again.

---

### Step 7: test speech generation

```bash
openclaw mimo-voice generate-speech "Hello, this is a test voice message"
```

Compatibility command:

```bash
openclaw mimo-voice tts "Hello, this is a test voice message"
```

---

### Step 8: test Telegram delivery

```bash
openclaw mimo-voice deliver-voice "Hello, this is a test voice message" --chat-id 123456789
```

Compatibility command:

```bash
openclaw mimo-voice send-telegram-voice "Hello, this is a test voice message" --chat-id 123456789
```

---

## If you only remember the critical values

At minimum, know these 4 values:

- `MIMO_API_KEY`
- `MIMO_API_URL`
- `MIMO_MODEL`
- `TELEGRAM_BOT_TOKEN`

If you use mini-vico source, also know:

- `MINI_VICO_CONFIG_PATH`
- `MIMO_PROVIDER_PROFILE`

---

## FAQ

### Which files do I actually edit?

Usually just these:

- `~/.openclaw/.env`
- `~/.openclaw/mini-vico.json` (if using mini-vico source)

### What is `service-dir`?

It is the absolute path to this repository's `service/` directory.

### Which model is supported right now?

Currently the supported model path is:

- **Xiaomi MiMo-V2-TTS**

### Which delivery channel is supported right now?

The main supported path today is:

- **Telegram voice**

---

## Read next only if needed

- [CLI install guide](./cli/README.md)
- [Service details](./service/SERVICE.md)
- [Plugin details](./plugin/PLUGIN.md)
- [Alpha notes](./ALPHA_NOTES.md)

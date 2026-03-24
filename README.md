# MiMo Voice

[![npm version](https://img.shields.io/npm/v/mimo-voice-openclaw-cli?color=cb3837&label=npm)](https://www.npmjs.com/package/mimo-voice-openclaw-cli)
[![GitHub release](https://img.shields.io/github/v/release/solitude-mix/mimo-voice?display_name=tag)](https://github.com/solitude-mix/mimo-voice/releases)
[![License](https://img.shields.io/github/license/solitude-mix/mimo-voice)](./cli/LICENSE)

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice is a voice-delivery project for the OpenClaw ecosystem.

Its goal is not just to be a text-to-speech script. The long-term direction is to connect these pieces into one reusable capability:

- read voice-model configuration
- call a TTS model or API
- generate playable audio
- send that audio as a voice message through a channel
- expose the whole flow as an OpenClaw integration

The current alpha focuses on:

- **Telegram voice sending**
- **OpenClaw integration**
- **CLI installation and maintenance**
- **a practical provider-config path via env / `~/.openclaw/.env`**
- **a practical path for MiMo / mini-vico style model configuration**

More delivery channels may be added later, including Feishu and WeChat.

---

## What is this for?

This project is for you if one or more of these are true:

- you already use **OpenClaw**
- you want OpenClaw to send **Telegram voice messages**
- you already have a working **TTS model / API**
- you want one reusable layer for both model calls and channel delivery

If you only want to test whether a single TTS model can produce audio, this repository can still help. But its long-term purpose is broader: it aims to become an installable voice-delivery component for OpenClaw.

---

## What works today

### Existing pieces

- MiMo Voice Python service
- audio generation and conversion
- Telegram voice sending
- OpenClaw plugin
- install / configure / verify CLI

### Alpha-stage reality

This is still an **alpha** project, so expect active changes:

- the configuration model will continue to evolve
- the documentation and repository layout will continue to improve
- the most newcomer-friendly path today is Telegram + OpenClaw first
- multi-channel support is planned, but not fully expanded yet

---

## 5-minute first run

If you are new, do not start with architecture details. Start here.

### Step 1: make sure you have these prerequisites

You will need at least:

- Linux / WSL / macOS
- `openclaw`
- `python3`
- `ffmpeg`
- `node` / `npm`
- a working **TTS model API**
- a working **Telegram bot**

If you are not sure whether your machine is ready, go straight to:

- [CLI install guide](./cli/README.md)
- [CLI 安装与使用说明（中文）](./cli/README.zh-CN.md)

---

### Step 2: install system dependencies

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install -y ffmpeg python3-venv
```

If your system Python is 3.12, also install:

```bash
sudo apt install -y python3.12-venv
```

macOS (Homebrew):

```bash
brew install ffmpeg
```

---

### Step 3: install the CLI

Current recommended package version:

- `mimo-voice-openclaw-cli@0.1.0-alpha.4`

Global install:

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
```

Then run:

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

---

### Step 4: connect OpenClaw to the service

Basic configure example:

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/service
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the OpenClaw gateway and try again.

---

## The biggest practical question: how do I configure the model and API?

This is the part the README must explain clearly.

### You need to know at least 4 things

No matter whether the backend is MiMo, mini-vico, or another compatible provider later, you need to know at least:

1. **API base URL**
   - for example: `http://127.0.0.1:8000/v1`
   - or a remote provider endpoint

2. **API key**
   - required if your model service uses authentication

3. **Model name**
   - a concrete TTS model identifier exposed by your backend

4. **Voice / output format settings**
   - such as voice name, output format, and sample rate

---

### A simple way to think about configuration

The exact structure may continue to evolve during alpha, but the easiest way to reason about it is as three layers:

#### 1. Provider config: how audio is generated

This is where you tell the project:

- where the model service lives
- which API key to use
- which model to call
- which default voice to use

#### 2. Channel config: how audio is delivered

This is where you tell the project:

- which channel to send through
- which Telegram bot token to use
- which default chat id to use

#### 3. Integration config: how OpenClaw connects to it

This is where you tell the project:

- which service URL OpenClaw should call
- whether a default chat id exists
- how the plugin is wired into OpenClaw commands and tools

---

### A conceptual minimal config example

> Note: this example is here to explain the shape of the config. Exact field names may still change during alpha. For current command behavior, follow the CLI docs and later configuration docs.

```yaml
provider:
  kind: mimo
  base_url: http://127.0.0.1:8000/v1
  api_key: your_api_key
  model: your_tts_model
  voice: default

channel:
  kind: telegram
  telegram:
    bot_token: 123456:abcde
    default_chat_id: 123456789

audio:
  format: ogg_opus
  sample_rate: 24000

integration:
  openclaw:
    service_base_url: http://127.0.0.1:8091
```

If your long-term goal is to reuse **mini-vico** configuration directly, the ideal end state is:

- declare where model settings are sourced from
- avoid making users enter the same provider settings twice

For now, the practical rule is simple:

**MiMo Voice must know how to generate audio and how to deliver it.**

---

## What does the OpenClaw integration do?

The purpose of the OpenClaw integration is to let OpenClaw:

- call the MiMo Voice service
- convert text into voice
- send the resulting audio to the target channel

The clearest path today is:

1. install the Python service with the CLI
2. deploy the OpenClaw plugin with the CLI
3. write the required OpenClaw config with `configure`
4. call the `mimo-voice` capability from OpenClaw

If you are trying this for the first time, get the **Telegram path** working first before making the config more sophisticated.

---

## Repository contents

The repository currently has three main parts:

### 1. `service/`
The Python voice service. It is responsible for:

- calling TTS backends
- converting audio
- exposing service APIs
- executing send logic

### 2. `plugin/`
The OpenClaw plugin. It is responsible for:

- connecting OpenClaw commands / tools to the service
- managing the OpenClaw-side integration

### 3. `cli/`
The install and maintenance tool. It is responsible for:

- `doctor`
- `install`
- `configure`
- `uninstall`
- `upgrade`

This repository layout reflects the current alpha implementation. It is not necessarily the final architecture. If the project expands toward Feishu, WeChat, and multiple providers, the module boundaries will likely be refactored further.

---

## Common beginner questions

### What do I actually need to configure?

At minimum, you usually need:

- a TTS service URL
- an API key, if required
- a model name
- a Telegram bot token
- a default chat id, if you want one
- the OpenClaw service base URL

### I do not know what to put in `model`

That value does not come from MiMo Voice itself. It comes from the backend model service you are calling.

So first confirm:

- that your TTS service is running
- which model names it exposes
- which request format it expects

### Where should `api_key` go?

In principle, it belongs in provider configuration, not scattered across multiple scripts.

If the current config entry points still feel unclear, start with:

- [CLI install guide](./cli/README.md)
- [Service details](./service/SERVICE.md)

### Why does the README still not explain model config deeply enough?

Because the project is still in alpha and earlier docs were more release-oriented than newcomer-oriented.

Fixing that is one of the current priorities.

---

## Recommended reading order

If this is your first time here, read in this order:

1. **this README**: understand what the project is for
2. [CLI install guide](./cli/README.md): get the environment running
3. [Service details](./service/SERVICE.md): understand the service layer
4. [Plugin details](./plugin/PLUGIN.md): understand the OpenClaw integration
5. [Alpha notes](./ALPHA_NOTES.md): understand current limitations

---

## Current recommended version

- `mimo-voice-openclaw-cli@0.1.0-alpha.4`

---

## More documentation

### For users

- [CLI install guide](./cli/README.md)
- [CLI 安装与使用说明（中文）](./cli/README.zh-CN.md)
- [Quick start](./docs/quickstart.md)
- [Configuration guide](./docs/configuration.md)
- [OpenClaw integration guide](./docs/openclaw-integration.md)
- [Example config](./examples/config.example.yaml)
- [Service details](./service/SERVICE.md)
- [Plugin details](./plugin/PLUGIN.md)
- [Alpha notes](./ALPHA_NOTES.md)

---

## A note for alpha users

The docs are now moving toward a more newcomer-friendly structure, but the project itself is still alpha.

The realistic expectation today is:

- first make Telegram + OpenClaw work
- then normalize model configuration
- then continue toward a cleaner multi-channel architecture

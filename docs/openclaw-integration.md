# MiMo Voice OpenClaw Integration Guide

This document explains how MiMo Voice connects to OpenClaw today, and how that integration should evolve.

---

## 1. What the OpenClaw integration is supposed to do

The OpenClaw side of MiMo Voice exists so that OpenClaw can:

- call the local MiMo Voice service
- generate speech from text
- send that speech to a delivery channel
- expose those actions through plugin methods, CLI commands, and tools

At the current alpha stage, the main supported delivery path is Telegram.

---

## 2. The current pieces involved

Today the OpenClaw integration is made of three parts:

### A. Python service

Location:

- `service/`

Responsibility:

- generate audio
- convert audio
- send Telegram voice
- expose local HTTP API

Default service URL:

- `http://127.0.0.1:8091`

### B. OpenClaw plugin

Location:

- `plugin/`

Responsibility:

- connect OpenClaw commands and tool calls to the local service
- provide the plugin-facing config surface

Current documented plugin config fields:

- `serviceBaseUrl`
- `serviceDir`
- `defaultChatId`
- `preferCli`

### C. Install/configure CLI

Location:

- `cli/`

Responsibility:

- install the service and plugin
- help write common OpenClaw config
- verify the integration path

---

## 3. The current install path

A practical current path looks like this:

### Step 1: install the CLI

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.7
```

### Step 2: check prerequisites

```bash
mimo-voice-openclaw doctor
```

### Step 3: install service + plugin

```bash
mimo-voice-openclaw install
```

### Step 4: write plugin config

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/projects/mimo-voice/service
```

### Step 5: verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately, restart the OpenClaw gateway and verify again.

---

## 4. Current plugin config shape

Current example:

```jsonc
{
  "plugins": {
    "entries": {
      "mimo-voice-openclaw": {
        "enabled": true,
        "config": {
          "serviceBaseUrl": "http://127.0.0.1:8091",
          "serviceDir": "/path/to/projects/mimo-voice/service",
          "preferCli": false
        }
      }
    }
  }
}
```

### What these fields mean

- `serviceBaseUrl`: where the plugin should call the MiMo Voice service
- `serviceDir`: local path to the service directory when needed by install or fallback paths
- `preferCli`: whether CLI-based behavior should be preferred over service-first behavior
- `defaultChatId`: optional default Telegram destination

---

## 5. Where beginners usually get confused

The biggest confusion is that users often think “OpenClaw integration config” is the same thing as “model config”.

It is not.

### OpenClaw integration config answers:

- how does OpenClaw reach MiMo Voice?
- which local service URL should it call?
- which plugin defaults should be used?

### It does not answer:

- which model backend to use
- what API key the provider needs
- what the provider `model` name is

Those belong to provider configuration, not plugin configuration.

---

## 6. Current service-side config that still matters

Today, the service `.env` example contains:

```env
MIMO_API_KEY=your_mimo_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

That means that even after OpenClaw is wired up, the voice flow still depends on service-side credentials.

This is why installation success does not automatically mean end-to-end voice delivery success.

You still need:

- a working provider API setup
- working Telegram credentials

---

## 7. Recommended mental model

Think of the OpenClaw integration as a translator layer.

It should:

- accept OpenClaw-side requests
- translate them into normalized MiMo Voice operations
- call the service/core logic
- return results in an OpenClaw-friendly way

It should not:

- become the only place that knows provider secrets
- hard-code Telegram assumptions into every public method forever
- absorb config responsibilities that belong elsewhere

---

## 8. Recommended future API direction

Today, the plugin already exposes both generic and compatibility methods.

Recommended methods:

- `mimoVoice.status`
- `mimoVoice.generateSpeech`
- `mimoVoice.deliverVoice`

Compatibility methods still available:

- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`

This is much better than the earliest alpha shape, but the long-term direction still matters.

### Better long-term shape

The integration should gradually move toward a more generic API such as:

- `mimoVoice.status`
- `mimoVoice.generateSpeech`
- `mimoVoice.sendVoice`
- `mimoVoice.deliverVoice`

### Why this is better

Because future channels should be expressed as parameters, not as separate hard-coded methods.

For example, instead of adding:

- `sendFeishuVoice`
- `sendWechatVoice`

prefer a unified request like:

```json
{
  "channel": "telegram",
  "text": "Hello",
  "chatId": "123456789"
}
```

That makes the OpenClaw integration more stable as the project grows.

---

## 9. Recommended future config mapping

The long-term design should map config like this:

### Provider config

- backend URL
- API key
- model
- voice defaults

### Audio config

- output format
- sample rate

### Channel config

- Telegram / Feishu / WeChat credentials
- default destination

### Integration config

- service URL for OpenClaw
- OpenClaw-specific defaults
- compatibility and fallback settings

This keeps OpenClaw integration focused on integration, not on owning every config field itself.

---

## 10. mini-vico config reuse in the OpenClaw world

A likely future need is to reuse model settings already defined in mini-vico.

The clean way to support that is:

- OpenClaw integration points to normalized MiMo Voice config
- MiMo Voice config may resolve provider values from a `mini-vico` config source
- the plugin itself does not need to parse mini-vico files directly

This matters because it keeps boundaries clean:

- OpenClaw plugin handles integration
- config source adapters handle config sourcing
- provider logic handles generation

---

## 11. Verification checklist

If the OpenClaw integration is not behaving as expected, verify these in order:

1. `openclaw` is installed and working
2. the plugin is installed
3. `openclaw plugins info mimo-voice-openclaw` returns expected info
4. the MiMo Voice service is reachable at `serviceBaseUrl`
5. provider credentials are configured correctly
6. Telegram credentials are configured correctly
7. gateway restart has been performed if commands do not show up yet

---

## 12. Related docs

- `../README.md`
- `../README.zh-CN.md`
- `../docs/configuration.md`
- `../plugin/PLUGIN.md`
- `../service/SERVICE.md`
- `../cli/README.md`

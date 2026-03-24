# MiMo Voice Configuration Guide

This document explains the recommended configuration model for MiMo Voice.

At the current alpha stage, the implementation is still evolving. So this guide does two things at once:

1. explains the config users already need to think about today
2. defines the cleaner target config shape the project should converge toward

If you only remember one thing, remember this:

**Do not think of MiMo Voice config as one flat pile of fields. Think of it as four layers:**

- provider config
- audio config
- channel config
- integration config

---

## 1. Why this matters

Most beginner confusion comes from mixing up three different questions:

- how is audio generated?
- how is audio delivered?
- how does OpenClaw call into this project?

Those are not the same concern, so they should not share one undifferentiated config surface.

---

## 2. Recommended config layers

## 2.1 Provider config

Provider config answers:

- which TTS backend do we use?
- where is it?
- how do we authenticate?
- which model do we call?
- which default voice do we use?

Example:

```yaml
provider:
  kind: mimo
  source: direct
  base_url: http://127.0.0.1:8000/v1
  api_key: your_api_key
  model: your_tts_model
  voice: default_zh
  extra:
    style: calm
```

### Common fields

- `kind`: provider type, such as `mimo`
- `source`: where provider settings come from, such as `direct` or future `mini-vico`
- `base_url`: TTS API base URL
- `api_key`: API credential if required
- `model`: exact model name exposed by the backend
- `voice`: default voice preset or speaker
- `extra`: provider-specific parameters

### Important rule

`model` is not invented by MiMo Voice. It must match the actual backend model service you are calling.

---

## 2.2 Audio config

Audio config answers:

- what output format should be generated?
- what sample rate should be used?
- should intermediate files be kept?

Example:

```yaml
audio:
  format: ogg_opus
  sample_rate: 24000
  save_intermediate: false
```

### Common fields

- `format`: output format, such as `ogg_opus`, `wav`, or `mp3`
- `sample_rate`: audio sample rate
- `save_intermediate`: whether to keep intermediate audio artifacts for debugging

---

## 2.3 Channel config

Channel config answers:

- where should the generated audio be sent?
- which channel adapter is active?
- what credentials does that channel need?

Example:

```yaml
channel:
  kind: telegram
  telegram:
    bot_token: 123456:replace_me
    default_chat_id: 123456789
```

### Common fields

- `kind`: active delivery channel, such as `telegram`
- `telegram.bot_token`: Telegram bot token
- `telegram.default_chat_id`: optional default destination

### Design rule

Channel config should not contain model config.
For example, `bot_token` belongs here, but `model` and `api_key` do not.

---

## 2.4 Integration config

Integration config answers:

- how does an external system call MiMo Voice?
- what service URL should OpenClaw use?
- what compatibility settings are needed?

Example:

```yaml
integration:
  openclaw:
    service_base_url: http://127.0.0.1:8091
    service_dir: /path/to/projects/mimo-voice/service
    prefer_cli: false
    default_channel: telegram
```

### Common fields

- `service_base_url`: service endpoint used by OpenClaw/plugin
- `service_dir`: local service directory when needed by install/configure flows
- `prefer_cli`: whether CLI fallback is preferred
- `default_channel`: default channel name for unified delivery flows

### Design rule

Integration config should translate external systems into MiMo Voice behavior.
It should not become the place where provider internals are hard-coded.

---

## 3. A complete conceptual example

```yaml
provider:
  kind: mimo
  source: direct
  base_url: http://127.0.0.1:8000/v1
  api_key: your_api_key
  model: your_tts_model
  voice: default_zh
  extra:
    style: calm

audio:
  format: ogg_opus
  sample_rate: 24000
  save_intermediate: false

channel:
  kind: telegram
  telegram:
    bot_token: 123456:replace_me
    default_chat_id: 123456789

integration:
  openclaw:
    service_base_url: http://127.0.0.1:8091
    service_dir: /path/to/projects/mimo-voice/service
    prefer_cli: false
    default_channel: telegram
```

See also:

- `../examples/config.example.yaml`

---

## 4. Current implementation vs target model

Today, the alpha repository exposes config from multiple places:

- service environment variables
- plugin config
- CLI configure flags
- local runtime/service paths

That works, but it is not yet the clean final model.

### Current visible config sources

#### Service `.env` example

```env
MIMO_API_KEY=your_mimo_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

#### Plugin example config

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

### What should happen over time

These multiple current surfaces should gradually map into the four-layer model described above.

In other words:

- service env vars should map into provider/channel config
- plugin config should map into integration config
- CLI configure should become a guided way to write valid integration config

---

## 5. mini-vico config reuse

This is an important future requirement.

The key design idea is:

**Reusing mini-vico config should be treated as a config-source problem, not as a provider-logic hack.**

That means the future model should support something like:

```yaml
provider:
  kind: mimo
  source: mini-vico
  mini_vico:
    profile: default
    config_path: /path/to/mini-vico/config.yaml
```

Then MiMo Voice would resolve that source into normalized provider fields such as:

- `base_url`
- `api_key`
- `model`
- `voice`

This keeps responsibilities clean:

- provider code generates audio
- channel code sends audio
- config source adapters resolve where provider settings came from

---

## 6. Common mistakes to avoid

### Mistake 1: putting Telegram settings into provider config

Wrong mental model:

- `bot_token` next to `model`

Why it is bad:

- delivery credentials and model credentials are different concerns

### Mistake 2: putting model config into OpenClaw plugin config

Wrong mental model:

- plugin config becomes the only place that knows `base_url`, `api_key`, and `model`

Why it is bad:

- the OpenClaw plugin becomes tightly coupled to provider internals

### Mistake 3: mixing config source with business logic

Wrong mental model:

- `if mini-vico then read a different file here inside send logic`

Why it is bad:

- config loading leaks into the wrong module boundaries

---

## 7. What a beginner needs to know first

If you are just trying to make the project work, confirm these values first:

1. your TTS service base URL
2. your API key, if required
3. the exact model name exposed by your backend
4. your Telegram bot token
5. your target chat id, if needed
6. the service URL OpenClaw should call

If those six are unclear, no installer or plugin doc will make the project feel easy.

---

## 8. Related docs

- `../README.md`
- `../README.zh-CN.md`
- `../docs/openclaw-integration.md`
- `../service/SERVICE.md`
- `../plugin/PLUGIN.md`

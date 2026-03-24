# MiMo Voice OpenClaw Plugin

[中文说明](./PLUGIN.zh-CN.md) | [English](./PLUGIN.md)

`plugin/` is the MiMo Voice OpenClaw plugin component.

It connects OpenClaw commands and tool calls to the local voice service.

## Available features

### Gateway methods

Current recommended methods:
- `mimoVoice.status`
- `mimoVoice.generateSpeech`
- `mimoVoice.deliverVoice`

Compatibility methods still available in the current alpha:
- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`

### CLI commands

Recommended:
- `openclaw mimo-voice status`
- `openclaw mimo-voice generate-speech <text>`
- `openclaw mimo-voice deliver-voice <text> --chat-id <id>`

Compatibility commands still available:
- `openclaw mimo-voice tts <text>`
- `openclaw mimo-voice send-telegram-voice <text> --chat-id <id>`

### Agent tool
- `mimo_voice`
  - recommended actions: `status`, `generate_speech`, `deliver_voice`
  - compatibility actions: `tts`, `send_telegram_voice`

## Recommended usage

- In OpenClaw automation flows, prefer `generateSpeech` and `deliverVoice`
- In a shell, prefer `openclaw mimo-voice generate-speech ...` and `openclaw mimo-voice deliver-voice ...`
- For low-level troubleshooting, go back to `service/`

## Plugin configuration

Common config fields:
- `serviceBaseUrl`
- `serviceDir`
- `defaultChatId`
- `defaultChannel`
- `preferCli`

Use the installer CLI `configure` command instead of editing the config manually when possible.

## Verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the gateway and try again.

# MiMo Voice OpenClaw Plugin

[中文说明](./PLUGIN.zh-CN.md) | [English](./PLUGIN.md)

`plugin/` is the MiMo Voice OpenClaw plugin component.

It connects OpenClaw commands and tool calls to the local voice service.

## Available features

### Gateway methods
- `mimoVoice.status`
- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`

### CLI commands
- `openclaw mimo-voice status`
- `openclaw mimo-voice tts <text>`
- `openclaw mimo-voice send-telegram-voice <text> --chat-id <id>`

### Agent tool
- `mimo_voice`

## Recommended usage

- In OpenClaw automation flows, prefer Gateway methods or tool calls
- In a shell, prefer `openclaw mimo-voice ...`
- For low-level troubleshooting, go back to `service/`

## Plugin configuration

Common config fields:
- `serviceBaseUrl`
- `serviceDir`
- `defaultChatId`
- `preferCli`

Use the installer CLI `configure` command instead of editing the config manually when possible.

## Verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the gateway and try again.

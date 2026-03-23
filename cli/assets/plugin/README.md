# MiMo Voice OpenClaw Plugin

This folder contains the packaged OpenClaw plugin used by `mimo-voice-openclaw-cli`.

It provides:
- Gateway methods
- OpenClaw CLI commands
- Agent tool integration for MiMo Voice

## Commands

```bash
openclaw mimo-voice status
openclaw mimo-voice tts <text>
openclaw mimo-voice send-telegram-voice <text> --chat-id <id>
```

## Verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the gateway and try again.

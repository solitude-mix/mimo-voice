# MiMo Voice Alpha Notes

[中文说明](./ALPHA_NOTES.zh-CN.md) | [English](./ALPHA_NOTES.md)

Recommended version:
- `mimo-voice-openclaw-cli@0.1.0-alpha.8`

This file is for people who want to try the current alpha release.

## What works in this alpha

The current alpha covers:
- `doctor`
- `install`
- `configure`
- `uninstall`
- `upgrade`
- OpenClaw plugin deployment
- TTS
- Telegram voice sending

## Recommended flow

The most reliable path is to install the CLI globally first:

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.7
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the gateway and verify again.

## Current alpha notes

- `doctor` now rejects placeholder secrets like `your_telegram_bot_token` instead of treating them as valid config
- the service runtime now prefers `~/.openclaw/.env` over inherited outer environment values
- `install` now tries to install a `systemd --user` MiMo service and falls back to the background script when user systemd is unavailable
- `install` / `configure` now add `mimo_voice` to `tools.allow`
- the plugin now includes a first B1 explicit-trigger auto-voice path for Telegram DM prefixes like `语音：...`, `tts: ...`, and `发语音：...`
- some npm / npx versions may fail to expose the CLI bin during one-shot remote execution
- for that reason, global install is the recommended usage path
- `upgrade` currently behaves like a refresh install
- `uninstall` keeps the Python service directory and virtual environment by default
- `configure` rewrites JSON formatting
- some environments may use a local extension-directory deployment path during plugin installation

## WSL note

If you use WSL:
- use `python3`
- do not rely on bare `python`

## What to include in bug reports

If something fails, these outputs are useful:
- `mimo-voice-openclaw doctor`
- `openclaw plugins info mimo-voice-openclaw`
- whether you restarted the gateway

## Maintainer-only references

These are useful for maintainers, not typical end users:
- `docs/release-privacy-checklist.md`
- `ARCHITECTURE_PLAN.zh-CN.md`
- `RELEASE_ALPHA_0.1.0-alpha.8.md`
- `GITHUB_RELEASE_0.1.0-alpha.8.md`

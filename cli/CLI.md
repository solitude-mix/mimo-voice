# MiMo Voice CLI

[中文说明](./CLI.zh-CN.md) | [English](./CLI.md)

`cli/` is the MiMo Voice install and maintenance CLI.

## Current version

- `0.1.0-alpha.10`

## Recommended usage

The most reliable path is:

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.10
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
```

After global install you can use these commands directly:

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
mimo-voice-openclaw uninstall
mimo-voice-openclaw upgrade
```

## About one-shot `npx`

Some npm / npx versions do not reliably expose the package bin for this CLI during one-shot remote execution.
Because of that, global install is the recommended path for normal use.

For local development, running the source checkout directly is also fine:

```bash
node src/index.js doctor
node src/index.js install
node src/index.js configure
```

## Typical use cases

- check local prerequisites
- install or refresh the MiMo Voice service and OpenClaw plugin
- write common plugin settings
- uninstall or redeploy the alpha version

## Notes

- In WSL, use `python3`
- Restart the gateway after installation when needed
- `doctor` tolerates a missing `service/.venv` when `service_health` is already OK
- `doctor` rejects placeholder secrets like `your_telegram_bot_token`
- the service runtime prefers `~/.openclaw/.env` over inherited outer environment values
- `install` tries to install a `systemd --user` MiMo service, with background fallback when unavailable
- `configure` also adds `mimo_voice` to the compatible top-level OpenClaw tools allowlist (prefers `tools.alsoAllow` when present)
- `upgrade` currently behaves like a refresh install
- `uninstall` keeps the Python service directory and venv by default to avoid accidental data loss

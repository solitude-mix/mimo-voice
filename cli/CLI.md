# MiMo Voice CLI

[中文说明](./CLI.zh-CN.md) | [English](./CLI.md)

`cli/` is the MiMo Voice install and maintenance CLI.

If you have not installed the CLI globally, start with:

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

Only after running:

```bash
npm install -g mimo-voice-openclaw-cli
```

can you use these commands directly:

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
mimo-voice-openclaw uninstall
mimo-voice-openclaw upgrade
```

## Typical use cases

- check local prerequisites
- install or refresh the MiMo Voice service and OpenClaw plugin
- write common plugin settings
- uninstall or redeploy the alpha version

## Current version

- `0.1.0-alpha.2`

## Recommended order

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 configure
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## Notes

- In WSL, use `python3`
- Restart the gateway after installation when needed
- `upgrade` currently behaves like a refresh install
- `uninstall` keeps the Python service directory and venv by default to avoid accidental data loss

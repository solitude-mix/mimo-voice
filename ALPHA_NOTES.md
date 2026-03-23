# MiMo Voice Alpha Notes

Recommended version:
- `mimo-voice-openclaw-cli@0.1.0-alpha.1`

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

```bash
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

## Known limitations

- `upgrade` currently behaves like a refresh install
- `uninstall` keeps the Python service directory and virtual environment by default
- `configure` rewrites JSON formatting
- Some environments may use a local extension-directory deployment path during plugin installation

## WSL note

If you use WSL:
- use `python3`
- do not rely on bare `python`

## What to include in bug reports

If something fails, these outputs are useful:
- `mimo-voice-openclaw doctor`
- `openclaw plugins info mimo-voice-openclaw`
- whether you restarted the gateway

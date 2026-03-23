# GitHub Release Draft — v0.1.0-alpha.1

## Title

MiMo Voice v0.1.0-alpha.1

## Release notes

`mimo-voice-openclaw-cli@0.1.0-alpha.1` is now available.

This is the first public alpha release of MiMo Voice.

### What is included

- `doctor` for environment checks
- `install` for service and plugin setup
- `configure` for common OpenClaw plugin settings
- basic `uninstall` and `upgrade`
- OpenClaw plugin deployment
- MiMo TTS workflow
- Telegram voice sending workflow

### Quick start

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 install
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

### Notes

This is still an alpha release.

Please verify it in your own environment before using it heavily.
After installation, restart the gateway if plugin commands do not appear immediately.

### Known limitations

- `upgrade` currently behaves like a refresh install
- `uninstall` keeps the Python service directory and virtual environment by default
- `configure` rewrites JSON formatting
- Some environments may use a local extension-directory deployment path during installation

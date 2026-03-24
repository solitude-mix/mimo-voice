# Changelog

## 0.1.0-alpha.3

Installer reliability and documentation update.

### Included in this release
- add clearer Ubuntu / WSL prerequisites for `python3-venv` and `python3.12-venv`
- document `ensurepip` / missing `pip` failure mode in root, CLI, and service docs
- extend `doctor` to check `python3 -m ensurepip`
- extend `doctor` to check `pip` availability inside an existing `.venv`
- teach `install` to repair an existing broken `.venv` that is missing `pip`
- improve installer error hints for broken virtual environments

### Notes
- `upgrade` currently behaves like a refresh install
- `configure` rewrites JSON formatting
- Some environments may use a local extension-directory deployment path during installation

## 0.1.0-alpha.2

First public alpha release of the MiMo Voice installer CLI.

### Included in this release
- npm package for `mimo-voice-openclaw-cli`
- alpha-ready install, configure, uninstall, and upgrade commands
- OpenClaw plugin deployment
- TTS and Telegram voice main workflow
- GitHub Actions workflow for alpha npm publishing

### Notes
- `upgrade` currently behaves like a refresh install
- `configure` rewrites JSON formatting
- Some environments may use a local extension-directory deployment path during installation

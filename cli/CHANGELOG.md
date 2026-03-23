# Changelog

## 0.1.0-alpha.1

First alpha release candidate for the unified MiMo Voice installer CLI.

### Added
- Alpha-facing npm README
- Safer `configure` flow with backup, dry-run, and `--clear-default-chat-id`
- Real install verification through doctor + service health checks
- Plugin reinstall fallback for local/global OpenClaw extension deployment
- Initial alpha release documentation

### Changed
- Unified project structure awareness (`projects/mimo-voice/...`)
- WSL-safe Python execution (`python3` / `.venv/bin/python3` instead of bare `python`)
- CLI help text and release-target wording updated to alpha
- Install flow now records local plugin install provenance in config during fallback installs

### Improved
- `openclaw mimo-voice status` error handling is less brittle when the service is unavailable
- `uninstall` now removes plugin config/install state and cleans the installed plugin directory
- `upgrade` now performs a refresh-style reinstall instead of being a pure placeholder

### Known limitations
- `configure` still rewrites JSON formatting
- `upgrade` is still a refresh flow, not a differential updater
- Fallback local plugin deployment may still behave differently from native `openclaw plugins install`

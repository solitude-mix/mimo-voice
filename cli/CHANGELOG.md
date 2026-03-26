# Changelog

## Unreleased

- fix installer config writes so `mimo_voice` prefers `tools.alsoAllow` when present and no longer creates invalid `tools.allow` + `tools.alsoAllow` combinations
- stop stale local MiMo/uvicorn listeners on port `8091` before enabling `mimo-voice.service`
- let the generated `systemd --user` unit read both `~/.openclaw/.env` and optional service-local `.env` overrides, and document proxy settings for Telegram delivery
- add a first natural-language auto-voice intent parser for Telegram DM flows and pass extracted `style` / `emotion` / `dialect` hints through the plugin TTS path

## 0.1.0-alpha.9

- align CLI-facing docs with the alpha.8 runtime and install behavior changes
- document placeholder-secret rejection and `~/.openclaw/.env` precedence more explicitly in CLI docs
- document `systemd --user` install behavior and automatic `tools.allow` wiring in CLI docs
- align Chinese alpha/plugin/service docs with the current alpha behavior

## 0.1.0-alpha.8

- prefer `~/.openclaw/.env` over inherited outer environment values for MiMo service runtime config
- reject placeholder credentials like `your_telegram_bot_token` in doctor/runtime checks instead of treating them as valid config
- add `systemd --user` service installation for MiMo Python service with background-script fallback
- make `install` / `configure` automatically add `mimo_voice` to `tools.allow`
- add a first B1 auto-voice path in the plugin for Telegram DM prefix triggers such as `语音：...`, `tts: ...`, and `发语音：...`

## 0.1.0-alpha.7

- rewrite README files for direct newcomer onboarding
- clarify Xiaomi MiMo-V2-TTS positioning
- clarify the meaning of `MIMO_PROVIDER_SOURCE`

## 0.1.0-alpha.6

- include post-alpha.5 follow-up fixes and doc cleanup
- clean duplicated README lines after release
- refine mini-vico/source diagnostics and final doc wording

## 0.1.0-alpha.5

- sync packaged service/plugin assets with the current repo state
- add provider source support and minimal mini-vico adapter
- expand doctor with provider source, mini-vico content, connectivity, and service runtime diagnostics
- refine docs, privacy checks, and user/maintainer document boundaries

## 0.1.0-alpha.4

Doctor and CLI usage polish release.

### Included in this release
- treat a missing `service/.venv` as tolerated when `service_health` is already OK
- keep `doctor` strict for real prerequisites while avoiding false negatives on healthy running services
- update CLI docs to recommend global install as the most reliable path
- document that one-shot `npx` execution may fail on some npm / npx versions even when the package is published correctly
- update examples to use `mimo-voice-openclaw ...` after global install or `node src/index.js ...` for local development

### Notes
- `upgrade` currently behaves like a refresh install
- `configure` rewrites JSON formatting
- Some environments may use a local extension-directory deployment path during installation

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

# MiMo Voice

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice is a voice project that brings together MiMo TTS, Telegram voice sending, and OpenClaw integration.

If you want to install and use it, start here:

- `cli/README.md`

## What is included

This repository contains three parts:

1. **Service**
   - Python voice service
   - MiMo TTS
   - audio conversion
   - Telegram voice sending
   - HTTP API and local CLI

2. **Plugin**
   - OpenClaw plugin that connects commands and tools to the service

3. **CLI**
   - installer and maintenance CLI
   - `doctor`
   - `install`
   - `configure`
   - `uninstall`
   - `upgrade`

## Repository layout

```text
service/   Python service
plugin/    OpenClaw plugin
cli/       Installer CLI
```

## Recommended version

Current recommended package version:

- `mimo-voice-openclaw-cli@0.1.0-alpha.1`

This is an **alpha** release.

## Documentation

- Install and use: `cli/README.md`
- Alpha notes: `ALPHA_NOTES.md`
- Release steps: `RELEASE_ALPHA_0.1.0-alpha.1.md`
- Service details: `service/SERVICE.md`
- Plugin details: `plugin/PLUGIN.md`
- CLI details: `cli/CLI.md`

## GitHub Actions

This repository includes:

- `.github/workflows/npm-alpha.yml`

It can publish alpha npm versions when an alpha tag is pushed.

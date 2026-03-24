# MiMo Voice

[![npm version](https://img.shields.io/npm/v/mimo-voice-openclaw-cli?color=cb3837&label=npm)](https://www.npmjs.com/package/mimo-voice-openclaw-cli)
[![GitHub release](https://img.shields.io/github/v/release/solitude-mix/mimo-voice?display_name=tag)](https://github.com/solitude-mix/mimo-voice/releases)
[![License](https://img.shields.io/github/license/solitude-mix/mimo-voice)](./cli/LICENSE)

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice is a voice project that brings together MiMo TTS, Telegram voice sending, and OpenClaw integration.

## Start here

If you are new, start with:

- [Install and use guide](./cli/README.md)
- [中文安装说明](./cli/README.zh-CN.md)

Current recommended package version:

- `mimo-voice-openclaw-cli@0.1.0-alpha.4`

## Quick start

### 1. Install system dependencies first

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install -y ffmpeg python3-venv
```

If your system Python is 3.12, also install:

```bash
sudo apt install -y python3.12-venv
```

macOS (Homebrew):

```bash
brew install ffmpeg
```

### 2. Install the CLI globally

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
```

### 3. Run doctor and install

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

### 4. Verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## Current alpha notes

- `doctor` checks `python3 -m ensurepip` and pip availability inside an existing `.venv`
- `install` can repair an existing broken `.venv` that is missing `pip`
- if `service_health` is already OK, a missing `service/.venv` is tolerated instead of making the whole doctor run fail
- global install is the recommended path for normal use
- one-shot `npx` execution may fail on some npm / npx versions even when the package is published correctly

## Repository contents

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

## More documentation

- [Alpha notes](./ALPHA_NOTES.md)
- [发布说明（中文）](./ALPHA_NOTES.zh-CN.md)
- [Release steps for alpha.4](./RELEASE_ALPHA_0.1.0-alpha.4.md)
- [alpha.4 发布步骤](./RELEASE_ALPHA_0.1.0-alpha.4.zh-CN.md)
- [GitHub release draft for alpha.4](./GITHUB_RELEASE_0.1.0-alpha.4.md)
- [Service details](./service/SERVICE.md)
- [Service 说明（中文）](./service/SERVICE.zh-CN.md)
- [Plugin details](./plugin/PLUGIN.md)
- [Plugin 说明（中文）](./plugin/PLUGIN.zh-CN.md)
- [CLI details](./cli/CLI.md)
- [CLI 说明（中文）](./cli/CLI.zh-CN.md)

## GitHub Actions

This repository includes:

- `.github/workflows/npm-alpha.yml`

It can publish alpha npm versions when an alpha tag is pushed.

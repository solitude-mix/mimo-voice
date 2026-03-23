# MiMo Voice

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice is a voice project that brings together MiMo TTS, Telegram voice sending, and OpenClaw integration.

## Start here

If you are new, start with:

- [Install and use guide](./cli/README.md)
- [中文安装说明](./cli/README.zh-CN.md)

Current recommended package version:

- `mimo-voice-openclaw-cli@0.1.0-alpha.1`

## Quick start

### 1. Install ffmpeg

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install -y ffmpeg
```

macOS (Homebrew):

```bash
brew install ffmpeg
```

### 2. Check your environment

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
```

### 3. Install

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 install
```

### 4. Verify

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

If commands do not appear immediately after installation, restart the gateway and try again.

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

## More documentation

- [Alpha notes](./ALPHA_NOTES.md)
- [发布说明（中文）](./ALPHA_NOTES.zh-CN.md)
- [Release steps](./RELEASE_ALPHA_0.1.0-alpha.1.md)
- [发布步骤（中文）](./RELEASE_ALPHA_0.1.0-alpha.1.zh-CN.md)
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

# GitHub Release Draft — v0.1.0-alpha.1

## Title

MiMo Voice v0.1.0-alpha.1

## Release notes

`mimo-voice-openclaw-cli@0.1.0-alpha.1` is now available.

This is the first public alpha release of MiMo Voice.

## Before you start

Install `ffmpeg` first.

Ubuntu / WSL:

```bash
sudo apt update
sudo apt install -y ffmpeg
```

macOS (Homebrew):

```bash
brew install ffmpeg
```

## Quick start

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 install
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## What is included

- `doctor` for environment checks
- `install` for service and plugin setup
- `configure` for common OpenClaw plugin settings
- basic `uninstall` and `upgrade`
- OpenClaw plugin deployment
- MiMo TTS workflow
- Telegram voice sending workflow

## 中文说明

`mimo-voice-openclaw-cli@0.1.0-alpha.1` 已发布。

这是 MiMo Voice 的首个公开 alpha 版本。

### 开始前请先安装 ffmpeg

Ubuntu / WSL：

```bash
sudo apt update
sudo apt install -y ffmpeg
```

macOS（Homebrew）：

```bash
brew install ffmpeg
```

### 快速开始

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.1 install
```

然后验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

### 说明

当前仍是 alpha 版本。
如安装后命令没有立即出现，请先重启 gateway 再验证。

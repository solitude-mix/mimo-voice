# MiMo Voice

[![npm version](https://img.shields.io/npm/v/mimo-voice-openclaw-cli?color=cb3837&label=npm)](https://www.npmjs.com/package/mimo-voice-openclaw-cli)
[![GitHub release](https://img.shields.io/github/v/release/solitude-mix/mimo-voice?display_name=tag)](https://github.com/solitude-mix/mimo-voice/releases)
[![License](https://img.shields.io/github/license/solitude-mix/mimo-voice)](./cli/LICENSE)

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice 是一个语音项目，用来把 MiMo TTS、Telegram voice 发送，以及 OpenClaw 接入整合到一起。

## 从这里开始

如果你第一次使用，请先看：

- [安装与使用说明](./cli/README.zh-CN.md)
- [Install and use guide](./cli/README.md)

当前推荐包版本：

- `mimo-voice-openclaw-cli@0.1.0-alpha.2`

## 快速开始

### 1. 安装 ffmpeg

Ubuntu / WSL：

```bash
sudo apt update
sudo apt install -y ffmpeg
```

macOS（Homebrew）：

```bash
brew install ffmpeg
```

### 2. 检查环境

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
```

### 3. 安装

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

### 4. 验证

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装后命令没有立即出现，建议先重启 gateway 再验证。

## 常见问题

### 需要自己安装 ffmpeg 吗？
需要。

这个项目依赖 `ffmpeg` 做音频转换，所以请先安装，再运行 `doctor`。

### 不全局安装也能用吗？
可以。

直接使用：

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

### 什么时候才能直接用 `mimo-voice-openclaw ...`？
只有在你全局安装 CLI 之后：

```bash
npm install -g mimo-voice-openclaw-cli
```

### 为什么第一次 `doctor` 可能会报 `service_health` 失败？
通常是因为服务还没启动。
先运行 `install`，再运行一次 `doctor` 就行。

### 为什么建议重启 gateway？
插件安装后，OpenClaw 有时需要重启一次，命令显示才会更稳定。

## 仓库包含什么

这个仓库包含三个部分：

1. **Service**
   - Python 语音服务
   - MiMo TTS
   - 音频转换
   - Telegram voice 发送
   - HTTP API 与本地 CLI

2. **Plugin**
   - OpenClaw 插件，用来把命令和工具调用接到语音服务

3. **CLI**
   - 安装与维护命令行工具
   - `doctor`
   - `install`
   - `configure`
   - `uninstall`
   - `upgrade`

## 目录

```text
service/   Python service
plugin/    OpenClaw plugin
cli/       Installer CLI
```

## 更多文档

- [Alpha 版本说明](./ALPHA_NOTES.zh-CN.md)
- [Alpha notes](./ALPHA_NOTES.md)
- [发布步骤](./RELEASE_ALPHA_0.1.0-alpha.2.zh-CN.md)
- [Release steps](./RELEASE_ALPHA_0.1.0-alpha.2.md)
- [Service 说明](./service/SERVICE.zh-CN.md)
- [Service details](./service/SERVICE.md)
- [Plugin 说明](./plugin/PLUGIN.zh-CN.md)
- [Plugin details](./plugin/PLUGIN.md)
- [CLI 说明](./cli/CLI.zh-CN.md)
- [CLI details](./cli/CLI.md)

## GitHub Actions

仓库包含：

- `.github/workflows/npm-alpha.yml`

当推送 alpha tag 时，可以自动发布 npm alpha 版本。

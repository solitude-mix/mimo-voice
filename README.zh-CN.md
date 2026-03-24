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

- `mimo-voice-openclaw-cli@0.1.0-alpha.4`

## 快速开始

### 1. 先安装系统依赖

Ubuntu / WSL：

```bash
sudo apt update
sudo apt install -y ffmpeg python3-venv
```

如果你的系统 Python 是 3.12，建议额外安装：

```bash
sudo apt install -y python3.12-venv
```

macOS（Homebrew）：

```bash
brew install ffmpeg
```

### 2. 全局安装 CLI

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
```

### 3. 执行 doctor 和 install

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

### 4. 验证

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## 当前 alpha 说明

- `doctor` 会检查 `python3 -m ensurepip` 以及已存在 `.venv` 里的 pip 可用性
- `install` 可以自动修复缺少 `pip` 的旧 `.venv`
- 如果 `service_health` 已经正常，缺失的 `service/.venv` 不会再导致整个 doctor 失败
- 当前普通使用场景下，更推荐全局安装路径
- 某些 npm / npx 版本下一次性 `npx` 执行可能失败，即使包本身已正确发布

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
- [alpha.4 发布步骤](./RELEASE_ALPHA_0.1.0-alpha.4.zh-CN.md)
- [Release steps for alpha.4](./RELEASE_ALPHA_0.1.0-alpha.4.md)
- [alpha.4 GitHub Release 草稿](./GITHUB_RELEASE_0.1.0-alpha.4.md)
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

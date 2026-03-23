# MiMo Voice

MiMo Voice 是一个语音项目，用来把 MiMo TTS、Telegram voice 发送，以及 OpenClaw 接入整合到一起。

如果你想安装和使用，请先看：

- [安装与使用说明](./cli/README.zh-CN.md)

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

## 当前推荐版本

当前推荐包版本：

- `mimo-voice-openclaw-cli@0.1.0-alpha.1`

这是一个 **alpha** 版本。

## 文档

- [安装与使用](./cli/README.zh-CN.md)
- [Alpha 版本说明](./ALPHA_NOTES.zh-CN.md)
- [发布步骤](./RELEASE_ALPHA_0.1.0-alpha.1.zh-CN.md)
- [Service 说明](./service/SERVICE.zh-CN.md)
- [Plugin 说明](./plugin/PLUGIN.zh-CN.md)
- [CLI 说明](./cli/CLI.zh-CN.md)
- [English README](./README.md)

## GitHub Actions

仓库包含：

- `.github/workflows/npm-alpha.yml`

当推送 alpha tag 时，可以自动发布 npm alpha 版本。

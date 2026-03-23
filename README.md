# MiMo Voice

MiMo Voice 是一个统一的语音项目，用来把 MiMo TTS、Telegram voice 发送，以及 OpenClaw 接入整合到一起。

如果你只是想安装和使用，优先看：

- `projects/mimo-voice/cli/README.md`

## 项目包含什么

这个项目包含三个部分：

1. **Service** — Python 语音服务
   - MiMo TTS
   - 音频处理与转码
   - Telegram voice 发送
   - HTTP API 与本地 CLI

2. **Plugin** — OpenClaw 插件
   - 把 OpenClaw 命令、Gateway 方法和工具调用接到语音服务

3. **CLI** — 安装与分发命令行工具
   - `doctor`
   - `install`
   - `configure`
   - `uninstall`
   - `upgrade`

## 目录

```text
projects/mimo-voice/service/   Python service
projects/mimo-voice/plugin/    OpenClaw plugin
projects/mimo-voice/cli/       Installer CLI
```

## 适合谁

适合以下场景：

- 你想把 MiMo TTS 作为本地服务跑起来
- 你想把文本转成 Telegram voice
- 你想把语音能力接进 OpenClaw
- 你想通过一个 CLI 完成检查、安装和配置

## 当前发布状态

当前推荐使用的是：

- `mimo-voice-openclaw-cli@0.1.0-alpha.1`

这是一个 **alpha** 版本。

它已经覆盖：
- 安装前检查
- 本地服务启动
- OpenClaw 插件部署
- 基本配置写入
- TTS 与 Telegram voice 主链路

但仍建议按 alpha 方式使用：
- 先在自己的环境里验证
- 安装/启用后做一次 gateway 重启
- 对升级/卸载保持谨慎

## 文档

- 用户安装与使用：`projects/mimo-voice/cli/README.md`
- Alpha 版本说明：`projects/mimo-voice/ALPHA_NOTES.md`
- 发布步骤：`projects/mimo-voice/RELEASE_ALPHA_0.1.0-alpha.1.md`
- Service 说明：`projects/mimo-voice/service/SERVICE.md`
- Plugin 说明：`projects/mimo-voice/plugin/PLUGIN.md`
- CLI 说明：`projects/mimo-voice/cli/CLI.md`

## GitHub Actions

仓库包含一个示例 workflow：

- `.github/workflows/npm-alpha.yml`

它用于在 push alpha tag 时自动发布 npm alpha 版本。

## 隐私与配置

对外发布时应避免：

- 暴露个人绝对路径
- 硬编码私人 chat id
- 泄露个人环境细节

建议通过环境变量或显式参数提供本地配置。 

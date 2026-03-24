# MiMo Voice OpenClaw Plugin

[中文说明](./PLUGIN.zh-CN.md) | [English](./PLUGIN.md)

`plugin/` 是 MiMo Voice 的 OpenClaw 插件部分。

它负责把 OpenClaw 的命令、gateway method 和工具调用接到本地语音服务。

## 可用能力

### Gateway methods

当前推荐方法：
- `mimoVoice.status`
- `mimoVoice.generateSpeech`
- `mimoVoice.deliverVoice`

当前 alpha 仍保留的兼容方法：
- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`

### CLI 命令

推荐命令：
- `openclaw mimo-voice status`
- `openclaw mimo-voice generate-speech <text>`
- `openclaw mimo-voice deliver-voice <text> --chat-id <id>`

当前仍保留的兼容命令：
- `openclaw mimo-voice tts <text>`
- `openclaw mimo-voice send-telegram-voice <text> --chat-id <id>`

### Agent tool
- `mimo_voice`
  - 推荐 action：`status`、`generate_speech`、`deliver_voice`
  - 兼容 action：`tts`、`send_telegram_voice`

## 推荐用法

- 在 OpenClaw 自动化流程里，优先使用 `generateSpeech` 和 `deliverVoice`
- 在 shell 里，优先使用 `openclaw mimo-voice generate-speech ...` 和 `openclaw mimo-voice deliver-voice ...`
- 如果要排查更底层的问题，再回到 `service/`

## 插件配置

常见配置项：
- `serviceBaseUrl`
- `serviceDir`
- `defaultChatId`
- `defaultChannel`
- `preferCli`

在可能的情况下，优先使用安装 CLI 的 `configure` 命令来写配置，而不是手动编辑。

## 验证

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装后命令没有马上出现，先重启 gateway 再验证。

# MiMo Voice OpenClaw Plugin

`projects/mimo-voice/plugin/` 是 MiMo Voice 的 OpenClaw 插件部分。

它负责把 OpenClaw 的调用接到本地语音服务。

## 提供的能力

### Gateway 方法

- `mimoVoice.status`
- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`

### CLI 命令

- `openclaw mimo-voice status`
- `openclaw mimo-voice tts <text>`
- `openclaw mimo-voice send-telegram-voice <text> --chat-id <id>`

### Agent tool

- `mimo_voice`

## 使用建议

- 在 OpenClaw 自动化场景里，优先用 Gateway 方法或工具调用
- 在命令行里，优先用 `openclaw mimo-voice ...`
- 如果要排查底层问题，回到 `projects/mimo-voice/service/`

## 插件配置

常见配置项：

- `serviceBaseUrl`
- `serviceDir`
- `defaultChatId`
- `preferCli`

推荐通过安装 CLI 的 `configure` 命令写入配置，而不是手动修改。

## 验证

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装后命令没有立即出现，建议先重启 gateway 再验证。 

# MiMo Voice OpenClaw Integration

第 2 期的最小 OpenClaw 集成层。

当前提供：

- Gateway 方法：
  - `mimoVoice.status`
  - `mimoVoice.tts`
  - `mimoVoice.sendTelegramVoice`
- CLI 命令：
  - `openclaw mimo-voice status`
  - `openclaw mimo-voice tts <text>`
  - `openclaw mimo-voice send-telegram-voice <text> --chat-id <id>`
- 文本命令：
  - `/mimo-status`
- Agent tool（可选）：
  - `mimo_voice`

## 当前推荐调用路径

- **OpenClaw 内部联调 / 自动化**：优先用 Gateway 方法
  - `mimoVoice.status`
  - `mimoVoice.tts`
  - `mimoVoice.sendTelegramVoice`
- **手动命令行操作**：优先用 `openclaw mimo-voice ...`
- **排查底层服务本身**：再回到 `projects/mimo-voice/service` 的 CLI / HTTP

设计目标：

- 不把 MiMo 逻辑塞进 OpenClaw 插件里
- 插件只做“薄接入层”
- 主实现仍然留在 `projects/mimo-voice/service`

## Agent tool 说明

当前插件已注册可选工具 `mimo_voice`，因此它不会自动暴露给所有智能体。
后续需要在工具 allowlist 中显式启用，才会成为模型可调用能力。

支持的 action：

- `status`
- `tts`
- `send_telegram_voice`

第 2 期已验证通过的核心能力：

- `openclaw mimo-voice status`
- `mimoVoice.status`
- `mimoVoice.tts`
- `mimoVoice.sendTelegramVoice`
- `voicebot` 已放行可选工具 `mimo_voice`
- `voicebot` 的真实 Telegram 语音回复链路已人工验证通过

后续第 2 期可继续补：

- 更自然的会话内语音发送命令
- 插件安装/启用文档
- agent tool 使用体验验证与收口
- 配置接入 `plugins.entries.mimo-voice-openclaw.config`

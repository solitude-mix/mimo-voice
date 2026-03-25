# GitHub Release Draft — v0.1.0-alpha.8

## Title

MiMo Voice v0.1.0-alpha.8

## Release notes

`mimo-voice-openclaw-cli@0.1.0-alpha.8` is now available.

This update focuses on making the current alpha line more deployable as a real OpenClaw + Telegram voice delivery path.

## Highlights

- prefer `~/.openclaw/.env` over inherited outer environment values for MiMo service runtime config
- reject placeholder credentials like `your_telegram_bot_token` instead of silently treating them as valid settings
- install a `systemd --user` MiMo service when available, with background-script fallback if user systemd is unavailable
- automatically add `mimo_voice` to `tools.allow` during install/configure
- add an initial B1 Telegram auto-voice path for explicit prefix triggers like `语音：...`, `tts: ...`, and `发语音：...`

## Recommended usage

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.8
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure --service-base-url http://127.0.0.1:8091 --service-dir /absolute/path/to/service
```

Then verify:

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

## 中文说明

`mimo-voice-openclaw-cli@0.1.0-alpha.8` 已发布。

这一版主要补强了当前 alpha 线的可部署性，让它更接近一个真正可交付的 OpenClaw + Telegram 语音投递链路。

### 重点更新

- MiMo service 运行时优先读取 `~/.openclaw/.env`，避免继承外层错误环境变量
- 对 `your_telegram_bot_token` 这类占位值改为显式报错，不再把它当作有效配置
- 在可用时安装 `systemd --user` 的 MiMo 服务；若不可用则回退到后台脚本启动
- `install` / `configure` 期间自动把 `mimo_voice` 写入 `tools.allow`
- 增加首个 B1 自动语音路径：Telegram 私聊中使用 `语音：...`、`tts: ...`、`发语音：...` 等前缀时可直接触发语音发送

### 推荐用法

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.8
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure --service-base-url http://127.0.0.1:8091 --service-dir /absolute/path/to/service
```

然后验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

# GitHub Release Draft — v0.1.0-alpha.10

## Title

MiMo Voice v0.1.0-alpha.10

## Release notes

`mimo-voice-openclaw-cli@0.1.0-alpha.10` is now available.

This update fixes the concrete installer/upgrade breakage reported in issue #1 and brings the first practical round of auto-voice and `/tts` capability improvements.

## Highlights

- fix invalid OpenClaw tools config writes by preferring `tools.alsoAllow` when present and avoiding `tools.allow` + `tools.alsoAllow` conflicts
- stop stale local Python/uvicorn listeners on port `8091` before enabling `mimo-voice.service`
- let the generated `systemd --user` unit read both `~/.openclaw/.env` and optional service-local `.env` overrides for proxy-sensitive setups
- add a first natural-language Telegram DM auto-voice intent parser and extract basic `dialect` / `emotion` / `style` hints
- make `/tts` and `/tts/raw` actually apply style/dialect processing end-to-end
- protect inline performance-prefixed text such as `（小声）...` from getting an extra prepended `<style>...</style>` tag
- add a conservative short-text Cantonese rewrite path for `粤语/广东话` requests
- add regression documentation and zero-dependency unit tests for the new text-processing behavior
- release automation now promotes npm `latest` together with the new alpha publish

## Recommended usage

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.10
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
```

## 中文说明

`mimo-voice-openclaw-cli@0.1.0-alpha.10` 已发布。

这一版主要修复了 issue #1 中暴露的安装/升级故障，并补齐了首轮自动语音与 `/tts` 能力缺口。

### 重点更新

- 修复 OpenClaw tools 配置写入冲突：优先复用 `tools.alsoAllow`，避免同时写出 `tools.allow` 与 `tools.alsoAllow`
- 在启用 `mimo-voice.service` 前，自动清理占用 `8091` 端口的旧 Python/uvicorn 进程
- 生成的 `systemd --user` service 现在会同时读取 `~/.openclaw/.env` 与可选的 `service/.env`，更适合需要代理的环境
- 增加首版 Telegram 私聊自然语言自动语音意图识别，并提取基础 `dialect` / `emotion` / `style` 提示
- `/tts` 与 `/tts/raw` 现在会真正端到端应用 style/dialect 处理
- 保护 `（小声）...` 这类内联表演标签，避免被额外重复包裹 `<style>...</style>`
- 为 `粤语/广东话` 短句请求增加首轮保守改写
- 补充回归文档与零依赖单元测试
- 发版流程现在会在发布 alpha 时同步推进 npm `latest`

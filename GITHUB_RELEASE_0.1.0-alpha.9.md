# GitHub Release Draft — v0.1.0-alpha.9

## Title

MiMo Voice v0.1.0-alpha.9

## Release notes

`mimo-voice-openclaw-cli@0.1.0-alpha.9` is now available.

This update mainly aligns the distributed CLI documentation with the current alpha runtime behavior introduced in the previous release.

## Highlights

- align packaged CLI docs with the current alpha runtime behavior
- document placeholder-secret rejection more clearly
- document `~/.openclaw/.env` precedence more clearly
- document `systemd --user` install behavior and fallback path
- document automatic `tools.allow` wiring and the current explicit-trigger B1 auto-voice behavior more consistently

## Recommended usage

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.9
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
```

## 中文说明

`mimo-voice-openclaw-cli@0.1.0-alpha.9` 已发布。

这一版主要是把 npm 包内分发出去的 CLI 文档，补齐到与当前 alpha 运行时行为一致。

### 重点更新

- 对齐当前 alpha 的 CLI 文档说明
- 更明确地说明占位 secret 会被拒绝
- 更明确地说明 `~/.openclaw/.env` 的优先级
- 更明确地说明 `systemd --user` 安装行为与回退路径
- 更一致地记录自动 `tools.allow` 接线和当前显式触发型 B1 自动语音行为

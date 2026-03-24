# MiMo Voice Alpha 版本说明

[中文说明](./ALPHA_NOTES.zh-CN.md) | [English](./ALPHA_NOTES.md)

当前推荐版本：
- `mimo-voice-openclaw-cli@0.1.0-alpha.4`

这份说明面向想试用当前 alpha 版本的用户。

## 这个 alpha 版本包含什么

当前 alpha 版本已经覆盖：
- `doctor`
- `install`
- `configure`
- `uninstall`
- `upgrade`
- OpenClaw plugin 部署
- TTS
- Telegram voice 发送

## 推荐流程

目前最稳的方式，是先全局安装 CLI：

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.4
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
```

然后验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装后命令没有立即出现，建议先重启 gateway 再验证。

## 当前 alpha 说明

- 当 `service_health` 已经正常时，`doctor` 会容忍缺失的 `service/.venv`
- 某些 npm / npx 版本在一次性远程执行时，可能不会稳定暴露 CLI 的 bin 命令
- 因此当前推荐使用全局安装路径
- `upgrade` 目前更像刷新安装，而不是差异升级
- `uninstall` 默认会保留 Python service 目录和虚拟环境
- `configure` 会改写 JSON 格式
- 某些环境下 plugin 安装可能会回退到本地扩展目录部署

## WSL 说明

如果你在 Windows 的 WSL 中使用：
- 请使用 `python3`
- 不要依赖 bare `python`

## 反馈问题时建议附带

如果你遇到问题，建议附上这些输出：
- `mimo-voice-openclaw doctor`
- `openclaw plugins info mimo-voice-openclaw`
- 是否执行过 gateway 重启

## 仅维护者参考

这些更适合维护者，而不是普通用户：
- `docs/release-privacy-checklist.md`
- `ARCHITECTURE_PLAN.zh-CN.md`
- `RELEASE_ALPHA_0.1.0-alpha.4.md`
- `GITHUB_RELEASE_0.1.0-alpha.4.md`

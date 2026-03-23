# MiMo Voice Alpha Notes

当前推荐版本：
- `mimo-voice-openclaw-cli@0.1.0-alpha.1`

这份说明面向准备试用 alpha 版本的用户。

## 这个 alpha 版本包含什么

当前 alpha 版本已经覆盖：

- `doctor` 依赖检查
- `install` 安装与刷新
- `configure` 常用插件配置写入
- `uninstall` 基本卸载
- `upgrade` refresh 风格升级
- OpenClaw plugin 部署
- TTS 主链路
- Telegram voice 主链路

## 推荐使用方式

建议按下面的顺序使用：

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
```

然后验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装或启用插件后命令没有立即生效，建议先重启 gateway 再验证。

## 这个 alpha 版本适合谁

适合：
- 想提前试用 MiMo Voice 安装流程的人
- 想把 MiMo TTS 与 Telegram voice 接入 OpenClaw 的用户
- 能接受 alpha 版本行为仍在继续优化中的使用者

不适合：
- 需要完全稳定、完全无手动确认流程的生产环境
- 需要复杂升级/回滚策略的正式运维场景

## 已知限制

当前 alpha 版本仍有这些限制：

- `upgrade` 目前是 refresh 风格，不是差异升级器
- `uninstall` 默认不会删除 Python service 目录和 venv
- `configure` 会重写 JSON 格式，不保留原注释
- 某些环境下 plugin 安装可能回退到本地扩展目录部署

## WSL 说明

如果你在 Windows 的 WSL 中使用：

- 请优先使用 `python3`
- 不要依赖 bare `python`

## 反馈建议

如果你在 alpha 版本中遇到问题，建议反馈这些信息：

- 操作系统 / 是否 WSL
- `mimo-voice-openclaw doctor` 输出
- `openclaw plugins info mimo-voice-openclaw` 输出
- 是否执行过 gateway 重启

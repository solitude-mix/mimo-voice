# MiMo Voice CLI

`cli/` 是 MiMo Voice 的安装与分发命令行工具。

当前命令：

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
mimo-voice-openclaw uninstall
mimo-voice-openclaw upgrade
```

## 适合的场景

- 检查本地依赖是否齐全
- 安装或刷新 MiMo Voice service 与 OpenClaw plugin
- 写入常用 OpenClaw 插件配置
- 卸载或重新部署 alpha 版本

## 当前版本

- `0.1.0-alpha.1`

## 建议顺序

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

## 注意

- 在 WSL 环境中请使用 `python3`
- 安装或启用插件后，建议做一次 gateway 重启
- `upgrade` 当前是刷新安装，不是差异升级
- `uninstall` 默认保留 Python service 目录和 venv，以避免误删用户数据

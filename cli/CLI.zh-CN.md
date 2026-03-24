# MiMo Voice CLI

[中文说明](./CLI.zh-CN.md) | [English](./CLI.md)

`cli/` 是 MiMo Voice 的安装与维护命令行工具。

## 当前版本

- `0.1.0-alpha.5`

## 推荐用法

目前最稳的方式是：

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.5
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
```

全局安装后，可以直接使用这些命令：

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
mimo-voice-openclaw uninstall
mimo-voice-openclaw upgrade
```

## 关于一次性 `npx`

某些 npm / npx 版本在一次性远程执行时，不会稳定暴露这个包的 bin 命令。
因此当前普通使用场景下，更推荐全局安装路径。

如果你在本地开发，也可以直接运行源码：

```bash
node src/index.js doctor
node src/index.js install
node src/index.js configure
```

## 适合的场景

- 检查本地依赖是否齐全
- 安装或刷新 MiMo Voice service 与 OpenClaw plugin
- 写入常用 OpenClaw 插件配置
- 卸载或重新部署 alpha 版本

## 注意

- 在 WSL 环境中请使用 `python3`
- 安装或启用插件后，建议做一次 gateway 重启
- 当 `service_health` 已经正常时，`doctor` 会容忍缺失的 `service/.venv`
- `upgrade` 当前是刷新安装，不是差异升级
- `uninstall` 默认保留 Python service 目录和 venv，以避免误删用户数据

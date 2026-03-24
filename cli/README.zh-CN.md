# mimo-voice-openclaw-cli

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice 的 alpha 安装 CLI。

这个 CLI 用来安装、配置和验证：
- MiMo Voice Python service
- MiMo Voice OpenClaw plugin
- OpenClaw 中与该插件相关的常见设置

当前版本：
- `0.1.0-alpha.2`

## 环境要求

- Linux 或 WSL
- `python3`
- `ffmpeg`
- `openclaw`
- 可用的 Python `venv` / `pip` 环境

如果你使用 WSL，请优先使用 `python3`，不要依赖 bare `python`。

## 先安装系统依赖

Ubuntu / WSL：

```bash
sudo apt update
sudo apt install -y ffmpeg python3-venv
```

如果你的系统 Python 是 3.12，建议额外安装：

```bash
sudo apt install -y python3.12-venv
```

macOS（Homebrew）：

```bash
brew install ffmpeg
```

> 注意：`python3 -m venv --help` 可用，并不代表新创建的虚拟环境一定带有可用的 `pip`。
> 某些 Ubuntu / WSL 环境缺少完整的 `ensurepip`/`venv` 组件时，会出现 `.venv` 创建成功但 `pip` 不可用的情况。

## 新手最简单的用法

如果你没有全局安装这个 CLI，请直接用：

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

## 如果你想先全局安装

```bash
npm install -g mimo-voice-openclaw-cli
```

安装后可直接使用：

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
mimo-voice-openclaw uninstall
mimo-voice-openclaw upgrade
```

## 推荐使用流程

### 1. 检查依赖

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 doctor
```

`doctor` 会检查：
- `python3`
- `ffmpeg`
- `openclaw`
- `python3 -m venv`
- `python3 -m ensurepip`
- service 路径
- plugin 路径
- 如果 `.venv` 已存在，检查其中的 `pip` 是否可用
- service 健康状态

### 2. 安装或刷新

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

安装流程会：
- 准备 service 资源
- 检查或创建 venv
- 如果已有 `.venv` 缺少 `pip`，尝试自动删除并重建一次
- 安装 Python 依赖
- 部署 plugin
- 验证 service 健康状态

### 3. 写入插件配置

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/service
```

如果你只想预览配置变更：

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 configure --dry-run
```

如果你要清掉默认 Telegram chat id：

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 configure --clear-default-chat-id
```

### 4. 验证

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装后命令没有立即出现，建议先重启 gateway 再验证。

## 常见问题

### 需要自己安装 ffmpeg 吗？
需要。

这个包依赖 `ffmpeg` 做音频转换。

### 不全局安装也能用吗？
可以。

第一次使用直接走 `npx` 就行。

### 什么时候才能直接用 `mimo-voice-openclaw ...`？
只有在你执行过：

```bash
npm install -g mimo-voice-openclaw-cli
```

之后，才能直接使用。

### 为什么第一次 `doctor` 可能会报 `service_health` 失败？
通常是因为服务还没启动。
先运行 `install`，再运行一次 `doctor` 即可。

### 为什么 `install` 会报 `No module named pip`？
这通常说明当前机器上的 Python 虚拟环境不完整，或者历史残留的 `.venv` 已损坏。

常见现象：

```bash
/home/xxx/.venv/bin/python3: No module named pip
```

处理步骤：

1. 先安装系统依赖（Ubuntu / WSL）：

```bash
sudo apt update
sudo apt install -y python3-venv
```

如果你的系统使用 Python 3.12，再执行：

```bash
sudo apt install -y python3.12-venv
```

2. 删除旧的虚拟环境：

```bash
rm -rf /home/zhouts/.openclaw/mimo-voice-openclaw/service/.venv
```

3. 重新执行安装：

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.2 install
```

原因是当前安装流程在发现 `.venv` 已存在时会优先复用；
如果这个 `.venv` 本身缺少 `pip`，后续安装就会失败。

### 为什么建议重启 gateway？
插件安装后，OpenClaw 有时需要重启一次，命令显示才会更稳定。

## 各命令说明

### `doctor`
检查：
- `python3`
- `ffmpeg`
- `openclaw`
- `python3 -m venv`
- `python3 -m ensurepip`
- service 路径
- plugin 路径
- 已存在 `.venv` 的 pip 可用性
- service 健康状态

### `install`
执行：
- service 资源准备
- venv 检查或创建
- 缺失 pip 的旧 `.venv` 自动修复
- Python 依赖安装
- plugin 部署
- service 健康验证

### `configure`
把插件配置写入 OpenClaw。
支持：
- 写入前自动备份
- `--dry-run`
- `--clear-default-chat-id`

### `uninstall`
移除：
- plugin 配置
- 安装记录
- 全局插件目录

默认不会删除 Python service 目录和虚拟环境。

### `upgrade`
当前会通过重新执行 install 流程来刷新安装。

## Alpha 版本说明

- 建议先在自己的环境里验证
- 安装后如有需要请重启 gateway
- `upgrade` 目前不是差异升级
- 某些环境下安装 plugin 时可能会回退到本地扩展目录部署

另见：
- [Alpha 版本说明](../ALPHA_NOTES.zh-CN.md)
- [English README](./README.md)

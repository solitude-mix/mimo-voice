# mimo-voice-openclaw-cli

MiMo Voice 的 alpha 安装 CLI。

这个 CLI 用来安装、配置和验证：
- MiMo Voice Python service
- MiMo Voice OpenClaw plugin
- OpenClaw 中与该插件相关的常见设置

当前版本：
- `0.1.0-alpha.1`

## 环境要求

- Linux 或 WSL
- `python3`
- `ffmpeg`
- `openclaw`

如果你使用 WSL，请优先使用 `python3`，不要依赖 bare `python`。

## 命令

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
mimo-voice-openclaw doctor
```

### 2. 安装或刷新

```bash
mimo-voice-openclaw install
```

### 3. 写入插件配置

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/service
```

如果你只想预览配置变更：

```bash
mimo-voice-openclaw configure --dry-run
```

如果你要清掉默认 Telegram chat id：

```bash
mimo-voice-openclaw configure --clear-default-chat-id
```

### 4. 验证

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装后命令没有立即出现，建议先重启 gateway 再验证。

## 各命令说明

### `doctor`
检查：
- `python3`
- `ffmpeg`
- `openclaw`
- service 路径
- plugin 路径
- service 健康状态

### `install`
执行：
- service 资源准备
- venv 检查或创建
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

# mimo-voice-openclaw-cli

Alpha installer CLI for MiMo Voice.

这个 CLI 用来安装、配置和验证以下组件：
- MiMo Voice Python service
- MiMo Voice OpenClaw plugin
- OpenClaw 中与该插件相关的常见配置

当前版本：
- `0.1.0-alpha.1`

## 适用环境

- Linux 或 WSL
- `python3`
- `ffmpeg`
- `openclaw`

如果你在 WSL 中运行，请不要依赖 bare `python`，优先使用 `python3`。

## 命令

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
mimo-voice-openclaw configure
mimo-voice-openclaw uninstall
mimo-voice-openclaw upgrade
```

## 推荐安装流程

### 1. 检查依赖

```bash
mimo-voice-openclaw doctor
```

### 2. 安装 / 刷新

```bash
mimo-voice-openclaw install
```

### 3. 写入插件配置

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/projects/mimo-voice/service
```

如果你只想预览变更：

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

如果安装后命令没有立即生效，建议先重启 gateway 再验证。

## 命令说明

### `doctor`
检查：
- `python3`
- `ffmpeg`
- `openclaw`
- service 路径
- plugin 路径
- health 状态

### `install`
执行：
- service 资源准备
- venv 检查/创建
- Python 依赖安装
- plugin 部署
- service 健康检查

### `configure`
执行：
- 写入 `plugins.entries.mimo-voice-openclaw`
- 支持 dry-run
- 写入前创建备份

### `uninstall`
执行：
- 清理 plugin 配置与安装记录
- 删除全局插件目录

默认不会删除 service 目录和 venv。

### `upgrade`
当前会走 refresh 流程，相当于重新执行一次 install。

## 限制说明

这是 alpha 版本，请按 alpha 方式使用：

- 建议先在自己的环境验证
- 安装后建议做一次 gateway 重启
- `upgrade` 不是差异升级
- `uninstall` 默认偏保守
- 某些环境下 plugin 安装可能会回退到本地扩展目录部署

更完整的 alpha 说明见：
- `projects/mimo-voice/ALPHA_NOTES.md`

# mimo-voice-openclaw-cli

[中文说明](./README.zh-CN.md) | [English](./README.md)

这是 MiMo Voice 的 alpha 安装与接入 CLI。

它的职责不是生成语音本身，而是帮你把下面这些东西装起来、接起来、验证起来：

- MiMo Voice Python service
- MiMo Voice OpenClaw plugin
- OpenClaw 侧需要的常见配置

如果你是第一次使用这个项目，这份文档就是你应该看的第一份“操作手册”。

当前版本：

- `0.1.0-alpha.5`

---

## 先说清楚：这个 CLI 能帮你做什么？

它主要解决三个问题：

1. **环境检查**
   - 你的机器上有没有 `python3`、`ffmpeg`、`openclaw`
   - 你的 Python `venv` / `pip` 是否可用

2. **安装和修复**
   - 准备 service 目录
   - 创建或修复 `.venv`
   - 安装 Python 依赖
   - 部署 OpenClaw plugin

3. **写入 OpenClaw 接入配置**
   - 让 OpenClaw 知道要调哪个 service
   - 让 plugin 知道默认配置该怎么接

这意味着：

- 它能帮你把“OpenClaw 接入链路”装起来
- **它不会替你凭空提供一个 TTS 模型服务**
- 你仍然需要准备好自己的模型 API / provider 配置

---

## 你在开始前至少要准备什么？

### 必备环境

- Linux 或 WSL
- `python3`
- `ffmpeg`
- `openclaw`
- `node` / `npm`
- 可用的 Python `venv` / `pip` 环境

如果你在 WSL 下，建议始终显式使用 `python3`，不要依赖裸 `python`。

### 你还需要准备的业务配置

这部分是过去文档里最容易让新手困惑的地方，这里直接说人话：

如果你想最终做到“OpenClaw 在 Telegram 里发送语音”，你至少还得自己准备：

- 一个可用的 **TTS 模型 / API 服务**
- 这个服务的：
  - `base_url`
  - `api_key`（如果需要）
  - `model` 名称
  - 默认 `voice` / 输出格式相关参数
- 一个可用的 **Telegram bot token**
- 一个目标 **chat id**（如果你想默认发到固定会话）

换句话说，这个 CLI 解决的是“装和接”的问题；
**模型怎么调用、用哪个 API、model 名称填什么，仍然需要你自己明确。**

---

## 最短成功路径：按这个顺序做

### 第 1 步：安装系统依赖

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

> 注意：`python3 -m venv --help` 能执行，并不代表新创建的虚拟环境一定会带着可用的 `pip`。
> 某些 Ubuntu / WSL 环境会出现 `.venv` 创建成功，但后续 `pip` 不可用的情况。

---

### 第 2 步：全局安装 CLI

目前最稳的方式是全局安装：

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.5
```

安装后，你就可以直接运行：

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

---

### 第 3 步：先跑 `doctor`

```bash
mimo-voice-openclaw doctor
```

`doctor` 会检查：

- `python3`
- `ffmpeg`
- `openclaw`
- `python3 -m venv`
- `python3 -m ensurepip`
- service 路径
- plugin 路径
- provider source 选择（`MIMO_PROVIDER_SOURCE`）
- 当 source=`mini-vico` 时，mini-vico 配置路径是否存在
- 当 source=`mini-vico` 时，mini-vico 配置内容是否可解析且字段齐全
- provider 配置是否存在（`MIMO_API_KEY`）
- provider 配置覆盖 / 默认值（`MIMO_API_URL`、`MIMO_MODEL`、`MIMO_DEFAULT_VOICE`、`MIMO_AUDIO_FORMAT`）
- Telegram 配置是否存在（`TELEGRAM_BOT_TOKEN`）
- Telegram API 覆盖 / 默认值（`TELEGRAM_API_BASE`）
- provider endpoint 是否可达
- Telegram API 是否可达
- service 状态脚本输出
- 已存在 `.venv` 中的 `pip` 是否可用
- service 健康状态

如果 `service_health` 已经正常，那么缺失的 `service/.venv` 会被视为“可容忍”，不会强制让整个检查失败。

---

### 第 4 步：执行安装

```bash
mimo-voice-openclaw install
```

安装流程会做这些事：

- 准备 service 资源
- 检查或创建 venv
- 如果已有 `.venv` 缺少 `pip`，尝试自动修复
- 安装 Python 依赖
- 部署 plugin
- 验证 service 健康状态

---

### 第 5 步：写入 OpenClaw 配置

最基础的配置命令示例：

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /path/to/service \
  --default-channel telegram
```

如果你只想先看会改什么：

```bash
mimo-voice-openclaw configure --dry-run
```

如果你想清掉默认 Telegram chat id：

```bash
mimo-voice-openclaw configure --clear-default-chat-id
```

---

### 第 6 步：验证接入成功

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果命令没有马上出现，先重启 gateway 再检查。

---

## 新手最容易卡住的点：模型和 API 配置

这部分非常关键。

即使 CLI 安装成功，也不代表你已经把“语音生成链路”配好了。

### 你需要确认这些问题

#### 1. 你的 TTS 服务真的在运行吗？

先确认：

- 服务是否已启动
- 地址是否可访问
- 端口是否正确

#### 2. 你知道 `base_url` 是什么吗？

这是你的模型 API 地址，例如：

```text
http://127.0.0.1:8000/v1
```

#### 3. 你知道 `model` 应该填什么吗？

这个值不是 CLI 替你生成的。
它是你的底层服务实际支持的模型名。

#### 4. 你知道 `api_key` 放哪里吗？

如果你的模型服务需要鉴权，就必须有 API key。
从设计上说，这类信息应该属于 **provider 配置**，而不是 Telegram 配置，也不是 OpenClaw 插件配置。

#### 5. Telegram 配置是否准备好了？

你至少需要：

- bot token
- 目标 chat id（如果需要默认发送目标）

---

## 推荐你怎么理解配置分层

虽然当前 alpha 版本里配置入口还在持续整理，但你可以先按这个逻辑理解：

### A. provider 配置
负责：

- `base_url`
- `api_key`
- `model`
- `voice`
- 输出格式相关默认项

### B. channel 配置
负责：

- Telegram bot token
- 默认 chat id
- 渠道发送参数

### C. OpenClaw integration 配置
负责：

- `service_base_url`
- OpenClaw 怎么调 service
- plugin 怎么接入命令和工具

这样理解后，你就不容易把“模型配置”和“Telegram 发送配置”混在一起。

---

## 关于 `npx`

某些 npm / npx 版本在一次性远程执行时，不能稳定暴露这个包的 bin 命令。
所以这类写法在部分机器上可能失败：

```bash
npx mimo-voice-openclaw-cli@0.1.0-alpha.5 doctor
```

如果你要稳定、可复现的体验，优先使用全局安装：

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.5
```

---

## 常见问题

### 需要自己安装 ffmpeg 吗？
需要。

这个项目依赖 `ffmpeg` 做音频转换。

### 不全局安装也能用吗？
可以，但当前最稳的方式仍然是全局安装。

如果你在开发环境里调试，也可以直接运行本地源码：

```bash
node src/index.js doctor
node src/index.js install
```

### 为什么第一次 `doctor` 可能报 `service_health` 失败？
通常是因为服务还没启动。
先执行 `install`，再重新运行一次 `doctor`。

### 为什么 `install` 会报 `No module named pip`？
这通常意味着：

- 系统缺少完整的 Python venv / ensurepip 组件
- 或者历史残留的 `.venv` 本身已经坏了

典型报错：

```bash
/home/xxx/.venv/bin/python3: No module named pip
```

建议处理方式：

1. 安装系统依赖（Ubuntu / WSL）：

```bash
sudo apt update
sudo apt install -y python3-venv
```

如果是 Python 3.12：

```bash
sudo apt install -y python3.12-venv
```

2. 删除旧的虚拟环境：

```bash
rm -rf /home/zhouts/.openclaw/mimo-voice-openclaw/service/.venv
```

3. 重新执行安装：

```bash
mimo-voice-openclaw install
```

### 为什么安装完还建议重启 gateway？
因为 OpenClaw 在插件安装后，有时需要重启一次，命令和插件状态才会稳定显示。

---

## 各命令做什么

### `doctor`
检查：

- `python3`
- `ffmpeg`
- `openclaw`
- `python3 -m venv`
- `python3 -m ensurepip`
- service 路径
- plugin 路径
- provider 环境变量是否存在以及默认值情况
- Telegram 环境变量是否存在以及默认值情况
- provider endpoint 连通性
- Telegram API 连通性
- service 状态脚本输出
- pid 文件状态（包括 stale pid 检测）
- 最近 service 日志尾部
- 已存在 `.venv` 的 `pip` 可用性
- service 健康状态

### `install`
执行：

- service 资源准备
- venv 检查或创建
- 缺失 `pip` 的旧 `.venv` 自动修复
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
- 全局 plugin 目录

默认不会删除 Python service 目录和虚拟环境。

### `upgrade`
当前通过重新执行 install 流程来刷新安装。

---

## 你接下来应该看什么？

如果你已经把 CLI 跑起来了，推荐继续看：

- [快速开始（英文）](../docs/quickstart.md)
- [项目总览 README（中文）](../README.zh-CN.md)
- [配置说明（英文）](../docs/configuration.md)
- [OpenClaw 接入说明（英文）](../docs/openclaw-integration.md)
- [Service 说明](../service/SERVICE.zh-CN.md)
- [Plugin 说明](../plugin/PLUGIN.zh-CN.md)
- [Alpha 版本说明](../ALPHA_NOTES.zh-CN.md)

---

## 给 alpha 用户的实话

当前 CLI 已经能承担“安装、修复、接入”的主流程，但整个项目还没有把“模型配置规范”和“多渠道架构”完全打磨到最终形态。

所以最现实的使用方式是：

- 先把安装链路跑通
- 先确认模型 API 可用
- 先跑通 Telegram + OpenClaw
- 再继续往更完整的配置和多渠道方案演进
law
- 再继续往更完整的配置和多渠道方案演进

- 先跑通 Telegram + OpenClaw
- 再继续往更完整的配置和多渠道方案演进
Telegram + OpenClaw
- 再继续往更完整的配置和多渠道方案演进

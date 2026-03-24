# MiMo Voice

[![npm version](https://img.shields.io/npm/v/mimo-voice-openclaw-cli?color=cb3837&label=npm)](https://www.npmjs.com/package/mimo-voice-openclaw-cli)
[![GitHub release](https://img.shields.io/github/v/release/solitude-mix/mimo-voice?display_name=tag)](https://github.com/solitude-mix/mimo-voice/releases)
[![License](https://img.shields.io/github/license/solitude-mix/mimo-voice)](./cli/LICENSE)

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice 是一个面向 OpenClaw 生态的语音发送项目。

**当前这个项目支持的是小米平台的 `MiMo-V2-TTS` 模型能力。**
如果后续增加新的模型适配，也会继续围绕**小米平台**扩展，而不是把项目做成一个面向所有厂商的通用 TTS 聚合层。

它的目标不是只做一个“文本转语音脚本”，而是把下面几件事串起来：

- 读取语音模型配置
- 调用 TTS 模型生成语音
- 把音频作为 voice 消息发送到渠道
- 为 OpenClaw 提供可接入、可扩展的语音能力

当前 alpha 阶段的重点是：

- **Telegram voice 发送**
- **OpenClaw 接入**
- **CLI 安装与维护**
- **通过 env / `~/.openclaw/.env` 落地的 provider 配置入口**
- **MiMo / mini-vico 一类模型配置的落地路径**

后续计划支持更多发送渠道，例如飞书、微信等。

---

## 这是什么？适合谁用？

如果你满足下面任意一种情况，这个项目就是给你准备的：

- 你已经在使用 **OpenClaw**
- 你想让 OpenClaw 在 **Telegram** 里直接发送语音
- 你已经有可用的 **小米 MiMo-V2-TTS 模型 / API**
- 你希望把“模型调用”和“渠道发送”整合成一个可复用能力

如果你只是想单独测试某个 TTS 模型是否能出音频，这个仓库也能参考；但它的长期目标不是停留在单脚本，而是成为一个可以接入 OpenClaw 的语音发送组件。

---

## 当前支持范围

### 已有能力

- MiMo Voice Python service
- 音频生成与转换
- Telegram voice 发送
- OpenClaw plugin
- 安装 / 配置 / 验证 CLI

### 当前阶段要知道的限制

这是 **alpha 版本**，所以请默认它还在快速演进：

- 配置结构还会继续调整
- README 和目录结构也还会继续优化
- 现在对新手最友好的路径，是先跑通 Telegram + OpenClaw
- 飞书、微信等多渠道能力还没有完全展开

---

## 5 分钟先跑通：给新手的最短路径

如果你是第一次接触这个项目，先不要看太多实现细节，按下面步骤走。

### 第 1 步：准备这些前置条件

你至少需要：

- 一台 Linux / WSL / macOS 机器
- 已安装 `openclaw`
- 已安装 `python3`
- 已安装 `ffmpeg`
- 已安装 `node` / `npm`
- 一个可用的 **TTS 模型 API**
- 一个可用的 **Telegram bot**

如果你现在还不确定自己有没有准备好，直接看：

- [CLI 安装与使用说明（中文）](./cli/README.zh-CN.md)
- [CLI install guide (English)](./cli/README.md)

---

### 第 2 步：先安装系统依赖

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

---

### 第 3 步：安装 CLI

当前推荐版本：

- `mimo-voice-openclaw-cli@0.1.0-alpha.6`

全局安装：

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.6
```

然后执行：

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

---

### 第 4 步：先明确你要改哪些配置文件

如果你是第一次安装，至少要知道这几个地方：

1. **`~/.openclaw/.env`**
   - 填模型和 Telegram 相关配置
   - 至少会涉及：
     - `MIMO_PROVIDER_SOURCE`
     - `MIMO_API_KEY`（或 mini-vico 配置里的 `api_key`）
     - `TELEGRAM_BOT_TOKEN`

2. **mini-vico 配置文件**（如果你用 `MIMO_PROVIDER_SOURCE=mini-vico`）
   - 例如：`/home/zhoutiansheng/.openclaw/mini-vico.json`
   - 里面至少要有：
     - `base_url`
     - `model`
     - `voice`
     - `api_key`（或者改用 `.env` 兜底）

3. **OpenClaw 插件配置**
   - 一般通过 `mimo-voice-openclaw configure` 写入
   - 也就是告诉 OpenClaw：语音 service 在哪、默认渠道是什么、默认 chat id 是什么

### 第 5 步：把 OpenClaw 接上 service

最基础的配置命令示例：

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /absolute/path/to/mimo-voice/service \
  --default-channel telegram
```

这里的 `--service-dir` 指的是：

- **这个仓库里的 `service/` 目录绝对路径**
- 不是 OpenClaw 自己的安装目录
- 也不是随便新建一个叫 service 的目录

例如，如果你的仓库就在当前工作区里，它通常类似：

```bash
/home/zhoutiansheng/.openclaw/workspace-main/projects/mimo-voice/service
```

配置完成后，验证：

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果安装后命令没有立即出现，先重启 OpenClaw gateway 再试一次。

---

## 最重要的现实问题：模型和 API 到底怎么配？

这个问题目前也是 README 最应该讲清楚的地方。

### 你至少要明确 4 个东西

无论你底层接的是 MiMo、mini-vico，还是以后兼容的别的模型，至少都需要明确：

1. **API 地址**
   - 例如：`http://127.0.0.1:8000/v1`
   - 或者某个远程服务地址

2. **API Key**
   - 如果你的模型服务要求鉴权，就必须提供

3. **模型名**
   - 例如某个具体 TTS 模型标识
   - 这一项必须和你的服务端保持一致

4. **输出语音格式 / voice 参数**
   - 例如 voice 名称、输出格式、采样率等

---

### 推荐你先按这套思路理解配置

虽然项目后面还会继续整理配置结构，但你可以先把配置理解成三层：

#### 1. provider 配置：怎么调模型

你要告诉项目：

- 模型服务在哪里
- 用什么 API key
- 用哪个 model
- 默认 voice 是什么

#### 2. channel 配置：怎么发出去

你要告诉项目：

- 用哪个渠道发送
- Telegram bot token 是什么
- 默认 chat id 是什么

#### 3. integration 配置：怎么接到 OpenClaw

你要告诉项目：

- OpenClaw 通过哪个 service URL 调这个服务
- 是否需要默认 chat id
- 插件如何接入命令和工具

---

### 一个“概念上的最小配置”示例

> 注意：下面这段主要是帮助你理解配置结构。实际字段名会随着 alpha 版本演进继续调整，请以 CLI 文档和后续配置说明为准。

```yaml
provider:
  kind: mimo
  base_url: http://127.0.0.1:8000/v1
  api_key: your_api_key
  model: your_tts_model
  voice: default

channel:
  kind: telegram
  telegram:
    bot_token: 123456:abcde
    default_chat_id: 123456789

audio:
  format: ogg_opus
  sample_rate: 24000

integration:
  openclaw:
    service_base_url: http://127.0.0.1:8091
```

如果你后面是希望“直接复用 mini-vico 已有配置”，那最终目标应该是：

- 在 OpenClaw / 项目配置中声明“模型配置从哪里读”
- 尽量避免让用户重复填两套几乎一样的 provider 参数

这部分后面会继续完善，现在请先把它理解成：

**MiMo Voice 需要知道“怎么生成音频”和“怎么把音频发出去”。**

---

## OpenClaw 集成到底是干什么的？

OpenClaw 集成的目标是：

- 让 OpenClaw 能调用 MiMo Voice service
- 把文本转成语音
- 再把语音消息发到指定渠道

当前最清晰的落地路径是：

1. 用 CLI 安装 Python service
2. 用 CLI 部署 OpenClaw plugin
3. 用 `configure` 写入 OpenClaw 所需配置
4. 在 OpenClaw 中调用 `mimo-voice` 相关能力

如果你是第一次接这个项目，请先把 **Telegram 路径跑通**，不要一开始就试图把所有配置做复杂。

---

## 仓库里都有什么？

当前仓库主要有三个部分：

### 1. `service/`
Python 语音服务，负责：

- 调用 TTS
- 做音频转换
- 对外暴露服务接口
- 执行发送逻辑

### 2. `plugin/`
OpenClaw 插件，负责：

- 把 OpenClaw 的命令 / 工具调用接到 service
- 管理和 OpenClaw 的对接

### 3. `cli/`
安装和维护工具，负责：

- `doctor`
- `install`
- `configure`
- `uninstall`
- `upgrade`

当前目录结构是 alpha 阶段的实现结构，不代表最终会一直保持不变。后面如果扩展到飞书、微信、多 provider 配置，目录和模块边界还会继续调整。

---

## 新手最常见的问题

### 1. 我到底要配置哪些信息？

最少要有：

- TTS 服务地址
- API key（如果需要）
- model 名称
- Telegram bot token
- 默认 chat id（如果你希望默认发给固定聊天）
- OpenClaw service base URL

### 2. 我不知道 `model` 应该填什么

这不是 MiMo Voice 自己发明出来的值，而是**你底层模型服务实际支持的模型名**。

也就是说，你应该先确认：

- 你的 TTS 服务有没有启动
- 它暴露的 model 名称是什么
- 它要求什么 API 参数

### 3. `api_key` 填哪里？

原则上应该进入 provider 配置，而不是散落在多个脚本里。

如果你现在还看不清配置入口，先从 CLI 文档和 service 文档入手：

- [CLI 说明（中文）](./cli/README.zh-CN.md)
- [Service 说明（中文）](./service/SERVICE.zh-CN.md)

### 4. 模型配置到底应该看哪里？

如果你要配置模型，不要只盯 README 这一页，直接看这几份：

- [快速开始（英文）](./docs/quickstart.md)
- [配置说明（英文）](./docs/configuration.md)
- [Service 说明](./service/SERVICE.zh-CN.md)
- `service/.env.example`

优先顺序建议是：

1. 先看 `docs/quickstart.md` 知道整体步骤
2. 再看 `service/.env.example` 和 `service/SERVICE.zh-CN.md` 填 provider / Telegram 配置
3. 如果你走 mini-vico source，再看 `docs/configuration.md` 和 `examples/mini-vico.example.json`

---

## 推荐阅读顺序

如果你是第一次接触这个项目，建议按这个顺序看：

1. **这份 README**：先知道项目是干嘛的
2. [CLI 安装与使用说明](./cli/README.zh-CN.md)：先把环境跑通
3. [Service 说明](./service/SERVICE.zh-CN.md)：理解服务层能力
4. [Plugin 说明](./plugin/PLUGIN.zh-CN.md)：理解 OpenClaw 接入
5. [Alpha 版本说明](./ALPHA_NOTES.zh-CN.md)：了解当前限制

---

## 当前推荐版本

- `mimo-voice-openclaw-cli@0.1.0-alpha.6`

---

## 更多文档

### 给用户

- [CLI 安装与使用说明（中文）](./cli/README.zh-CN.md)
- [CLI install guide (English)](./cli/README.md)
- [快速开始（英文）](./docs/quickstart.md)
- [配置说明（英文）](./docs/configuration.md)
- [OpenClaw 接入说明（英文）](./docs/openclaw-integration.md)
- [示例配置](./examples/config.example.yaml)
- [Service 说明](./service/SERVICE.zh-CN.md)
- [Plugin 说明](./plugin/PLUGIN.zh-CN.md)
- [Alpha 版本说明](./ALPHA_NOTES.zh-CN.md)

---

## 给 alpha 用户的提醒

当前这套文档已经开始朝“新手可用”方向重构，但项目本身仍处于 alpha 阶段。

你可以把它理解成：

- **安装路径已经在成型**
- **OpenClaw 接入已经在成型**
- **更合理的配置结构和多渠道架构还会继续演进**

如果你正在评估这个项目，最现实的预期应该是：

- 先跑通 Telegram + OpenClaw
- 再逐步补模型配置规范
- 再继续扩展更多发送渠道
w
- 再逐步补模型配置规范
- 再继续扩展更多发送渠道
l guide (English)](./cli/README.md)
- [快速开始（英文）](./docs/quickstart.md)
- [配置说明（英文）](./docs/configuration.md)
- [OpenClaw 接入说明（英文）](./docs/openclaw-integration.md)
- [示例配置](./examples/config.example.yaml)
- [Service 说明](./service/SERVICE.zh-CN.md)
- [Plugin 说明](./plugin/PLUGIN.zh-CN.md)
- [Alpha 版本说明](./ALPHA_NOTES.zh-CN.md)

---

## 给 alpha 用户的提醒

当前这套文档已经开始朝“新手可用”方向重构，但项目本身仍处于 alpha 阶段。

你可以把它理解成：

- **安装路径已经在成型**
- **OpenClaw 接入已经在成型**
- **更合理的配置结构和多渠道架构还会继续演进**

如果你正在评估这个项目，最现实的预期应该是：

- 先跑通 Telegram + OpenClaw
- 再逐步补模型配置规范
- 再继续扩展更多发送渠道

# MiMo Voice

[![npm version](https://img.shields.io/npm/v/mimo-voice-openclaw-cli?color=cb3837&label=npm)](https://www.npmjs.com/package/mimo-voice-openclaw-cli)
[![GitHub release](https://img.shields.io/github/v/release/solitude-mix/mimo-voice?display_name=tag)](https://github.com/solitude-mix/mimo-voice/releases)
[![License](https://img.shields.io/github/license/solitude-mix/mimo-voice)](./cli/LICENSE)

[中文说明](./README.zh-CN.md) | [English](./README.md)

MiMo Voice 是一个给 **OpenClaw + Telegram** 用的语音发送项目。

## 当前支持范围

- **模型平台**：仅支持 **小米平台**
- **当前模型**：**MiMo-V2-TTS**
- **当前发送渠道**：**Telegram voice**
- **当前接入方式**：**OpenClaw plugin + CLI**

如果后续增加新模型，也会继续围绕**小米平台**扩展，而不是做成通用多厂商 TTS 聚合项目。

---

## 你到底需要改什么

如果你是第一次用，先记住：

你主要只需要关心 **2 个文件**。

### 1. `~/.openclaw/.env`

这是最重要的配置文件。

### 2. `~/.openclaw/mini-vico.json`

只有当你使用：

```env
MIMO_PROVIDER_SOURCE=mini-vico
```

时，才需要这个文件。

### `MIMO_PROVIDER_SOURCE` 是什么意思？

它表示：**MiMo Voice 要从哪里读取模型配置**。

当前就两个值：

- `direct`：直接从 `~/.openclaw/.env` 读取 `MIMO_API_URL`、`MIMO_MODEL`、`MIMO_API_KEY` 等配置
- `mini-vico`：从 `mini-vico.json` 里读取模型配置

---

## 最短路径：直接照着做

### 第 1 步：安装系统依赖

Ubuntu / WSL：

```bash
sudo apt update
sudo apt install -y ffmpeg python3-venv
```

如果你的系统 Python 是 3.12：

```bash
sudo apt install -y python3.12-venv
```

macOS：

```bash
brew install ffmpeg
```

---

### 第 2 步：安装 CLI

```bash
npm install -g mimo-voice-openclaw-cli@0.1.0-alpha.7
```

---

### 第 3 步：写 `~/.openclaw/.env`

#### 方案 A：直接配置 MiMo（最简单）

把下面内容写进：

```bash
~/.openclaw/.env
```

```env
MIMO_PROVIDER_SOURCE=direct
MIMO_API_KEY=your_mimo_api_key
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2-tts
MIMO_DEFAULT_VOICE=default_zh
MIMO_AUDIO_FORMAT=wav
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_API_BASE=https://api.telegram.org
```

#### 方案 B：通过 mini-vico 配置读取

`~/.openclaw/.env` 写成：

```env
MIMO_PROVIDER_SOURCE=mini-vico
MIMO_PROVIDER_PROFILE=default
MINI_VICO_CONFIG_PATH=/home/zhoutiansheng/.openclaw/mini-vico.json
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_API_BASE=https://api.telegram.org
```

然后再写：

```bash
~/.openclaw/mini-vico.json
```

```json
{
  "profiles": {
    "default": {
      "base_url": "https://api.xiaomimimo.com/v1/chat/completions",
      "api_key": "your_api_key",
      "model": "mimo-v2-tts",
      "voice": "default_zh",
      "audio_format": "wav"
    }
  }
}
```

如果你不想把 `api_key` 放进 `mini-vico.json`，也可以把它写回 `~/.openclaw/.env`：

```env
MIMO_API_KEY=your_mimo_api_key
```

---

### 第 4 步：执行安装检查

```bash
mimo-voice-openclaw doctor
mimo-voice-openclaw install
```

---

### 第 5 步：把 OpenClaw 接上 service

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /absolute/path/to/mimo-voice/service \
  --default-channel telegram
```

### `--service-dir` 是什么

它指的是：

- **这个仓库里的 `service/` 目录绝对路径**
- 不是 OpenClaw 的安装目录
- 不是随便新建一个 `service` 目录

例如，如果你的仓库就在当前工作区里：

```bash
/home/zhoutiansheng/.openclaw/workspace-main/projects/mimo-voice/service
```

所以可以直接这样写：

```bash
mimo-voice-openclaw configure \
  --service-base-url http://127.0.0.1:8091 \
  --service-dir /home/zhoutiansheng/.openclaw/workspace-main/projects/mimo-voice/service \
  --default-channel telegram
```

如果你只想先看会改什么：

```bash
mimo-voice-openclaw configure --dry-run
```

---

### 第 6 步：验证 service 和 plugin

```bash
openclaw plugins info mimo-voice-openclaw
openclaw mimo-voice status
```

如果命令没有马上出现，先重启 gateway 再试。

---

### 第 7 步：测试语音生成

```bash
openclaw mimo-voice generate-speech "你好，这是一条测试语音"
```

兼容旧命令：

```bash
openclaw mimo-voice tts "你好，这是一条测试语音"
```

---

### 第 8 步：测试 Telegram 发送

```bash
openclaw mimo-voice deliver-voice "你好，这是一条测试语音" --chat-id 123456789
```

兼容旧命令：

```bash
openclaw mimo-voice send-telegram-voice "你好，这是一条测试语音" --chat-id 123456789
```

---

## 如果你只想知道最关键的事

### 你至少要搞清楚这 4 个值

- `MIMO_API_KEY`
- `MIMO_API_URL`
- `MIMO_MODEL`
- `TELEGRAM_BOT_TOKEN`

如果你走 mini-vico source，则至少要搞清楚：

- `MINI_VICO_CONFIG_PATH`
- `MIMO_PROVIDER_PROFILE`

---

## 常见问题

### 1. 我到底改哪个文件？

先看这两个：

- `~/.openclaw/.env`
- `~/.openclaw/mini-vico.json`（如果走 mini-vico）

### 2. `service-dir` 到底填什么？

填这个仓库里的：

- `service/` 目录绝对路径

### 3. 现在支持哪些模型？

当前只明确支持：

- **小米 MiMo-V2-TTS**

### 4. 现在支持哪些发送渠道？

当前主路径只支持：

- **Telegram voice**

---

## 还需要看什么

如果上面这份 README 还不够，你再看：

- [CLI 安装与使用说明](./cli/README.zh-CN.md)
- [Service 说明](./service/SERVICE.zh-CN.md)
- [Plugin 说明](./plugin/PLUGIN.zh-CN.md)
- [Alpha 版本说明](./ALPHA_NOTES.zh-CN.md)

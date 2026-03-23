# MiMo Voice Service

第一期骨架版：把现有的 MiMo TTS + Telegram voice 发送脚本整理成一个可扩展的 Python 后端项目。

## 当前能力

- `POST /health` / `GET /health`：健康检查
- `POST /tts`：测试文本是否可成功合成（返回元信息）
- `POST /tts/raw`：直接返回 `audio/wav`
- `POST /telegram/send-voice`：文本 -> MiMo -> wav -> ogg/opus -> Telegram voice
- 控制台阶段日志：请求进入、MiMo 合成、ffmpeg 转码、Telegram 上传、总耗时

## 目录结构

```text
projects/mimo-voice/service/
  app/
    audio.py
    cli.py
    config.py
    logging_utils.py
    main.py
    mimo.py
    schemas.py
    service.py
    telegram.py
  scripts/
    cli.sh
    start.sh
    start-bg.sh
    status.sh
    stop-bg.sh
  .env.example
  requirements.txt
  run.py
```

## 依赖

- Python 3.10+
- ffmpeg
- `MIMO_API_KEY`
- `TELEGRAM_BOT_TOKEN`（仅 Telegram 发送接口需要）

环境变量可直接放系统环境里，也可继续沿用 `~/.openclaw/.env`。

## 启动

```bash
cd projects/mimo-voice/service
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
bash scripts/start.sh
```

默认监听：`http://127.0.0.1:8091`

## 后台运行

```bash
cd projects/mimo-voice/service
bash scripts/start-bg.sh
bash scripts/status.sh
tail -f .runtime/service.log
bash scripts/stop-bg.sh
```

可选日志级别：

```bash
export MIMO_VOICE_LOG_LEVEL=INFO   # 默认
export MIMO_VOICE_LOG_LEVEL=DEBUG
```

## 推荐用法

- **你自己日常手动用**：优先用 `bash scripts/cli.sh ...`
- **其他脚本 / 自动化 / 外部系统调用**：优先用 HTTP API
- **只想兼容以前的命令习惯**：继续用 `tools/tg-voice`
- **legacy 脚本**：仅做过渡，不建议再作为新入口依赖

## 调用示例

### 健康检查

```bash
curl http://127.0.0.1:8091/health
```

### 直接拿 wav

```bash
curl -X POST http://127.0.0.1:8091/tts/raw \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "你好，我是小音。",
    "voice": "default_zh"
  }' \
  --output /tmp/mimo.wav
```

说明：`/tts/raw` 返回的是纯 `audio/wav` 二进制流，适合“我只要音频文件”的场景；如果你还想同时拿到 `chunks`、`file_path` 等元信息，请改用 `/tts`。

### 直接发送 Telegram voice

```bash
curl -X POST http://127.0.0.1:8091/telegram/send-voice \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "你好，我是小音。",
    "chat_id": "<your-chat-id>",
    "voice": "default_zh",
    "style": "开心"
  }'
```

### 本地 CLI：健康检查

```bash
bash scripts/cli.sh health
```

### 本地 CLI：输出 wav

```bash
bash scripts/cli.sh tts "你好，我是小音。" --out /tmp/mimo.wav
bash scripts/cli.sh tts "你好，我是小音。" --save-file
```

默认会对长文本自动分段；也可以手动指定：

```bash
bash scripts/cli.sh tts "一大段文本..." --max-chars-per-chunk 100
bash scripts/cli.sh tts "一大段文本..." --no-split-long-text
```

### 本地 CLI：直接发 Telegram voice

```bash
bash scripts/cli.sh send-telegram-voice "你好，我是小音。" \
  --chat-id <your-chat-id> \
  --voice default_zh \
  --style 开心
```

CLI 现在统一输出 JSON，便于后面被脚本或其他系统继续调用。

### 兼容旧入口 `tools/tg-voice`

```bash
tools/tg-voice "你好，我是小音。"
```

该入口现在会转调新项目 CLI，尽量保持旧用法不变。

## Legacy 策略

- `tools/tg-voice`：**保留**，作为兼容入口，但底层只负责转调新 CLI。
- `tools/telegram-mimo-voice-direct.py`：**legacy**，现已瘦身为单纯转发到新 CLI 的 wrapper；短期保留，避免现有依赖突然断掉，后续可退役。
- `projects/mimo-voice/service/*`：**主实现**，后续新增能力都应优先落在这里。

## 当前已补上的整理项

- CLI / HTTP 成功返回结构已基本对齐（统一 `ok`、`chunks`、`file_path`、`local_file` 等字段）
- CLI 输出统一为 JSON
- 自动长文本分段（可关闭，可调整每段字符数）
- 增加文件输出策略：TTS 原始 wav 可保存到 `data/tts/`，Telegram 发送保留文件可保存到 `data/outbox/`
- 旧入口 `tools/tg-voice` 已迁移到底层新 CLI
- 旧脚本 `tools/telegram-mimo-voice-direct.py` 已标记为 legacy

## 当前阶段判断

- **第 1 期（Python 后端项目）**：核心目标已完成
- **第 2 期（OpenClaw 集成）**：已进入可用阶段，核心链路已打通
- **第 3 期（npm 一键安装 CLI）**：尚未开始

## 目前还没做的

- 持久化日志
- 鉴权
- 请求队列 / 限流
- 更聪明的长文本切片与音频拼接质量优化
- 第 2 期剩余体验收口（更自然的调用入口、文档整理、开发态噪音收敛）
- npm 一键安装 CLI

这版的目标只有一个：先把“正式项目骨架 + 可运行 API”立起来；目前这个目标已经达成。

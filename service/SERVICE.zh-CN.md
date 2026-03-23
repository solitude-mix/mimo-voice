# MiMo Voice Service

`service/` 是 MiMo Voice 的 Python 服务部分。

它负责：
- MiMo TTS 调用
- 音频处理与转码
- Telegram voice 发送
- HTTP API
- 本地 CLI

## 依赖

- Python 3.10+
- `python3`
- `ffmpeg`
- `MIMO_API_KEY`
- `TELEGRAM_BOT_TOKEN`（仅 Telegram 发送接口需要）

如果你在 WSL 中运行，请优先使用 `python3`，不要依赖 bare `python`。

## 启动

```bash
cd service
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
bash scripts/start.sh
```

默认地址：
- `http://127.0.0.1:8091`

后台启动：

```bash
bash scripts/start-bg.sh
bash scripts/status.sh
```

## API 示例

### 健康检查

```bash
curl http://127.0.0.1:8091/health
```

### 输出 WAV

```bash
curl -X POST http://127.0.0.1:8091/tts/raw \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "你好，我是小音。",
    "voice": "default_zh"
  }' \
  --output /tmp/mimo.wav
```

### 发送 Telegram voice

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

## CLI 示例

```bash
bash scripts/cli.sh health
bash scripts/cli.sh tts "你好，我是小音。" --save-file
bash scripts/cli.sh send-telegram-voice "你好，我是小音。" --chat-id <your-chat-id>
```

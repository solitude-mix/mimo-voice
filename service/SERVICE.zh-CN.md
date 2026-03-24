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
- 可用的 Python `venv` / `pip` 环境
- `ffmpeg`
- `MIMO_API_KEY`
- `TELEGRAM_BOT_TOKEN`（仅 Telegram 发送接口需要）

如果你在 WSL 中运行，请优先使用 `python3`，不要依赖 bare `python`。

Ubuntu / WSL 通常还需要安装：

```bash
sudo apt update
sudo apt install -y python3-venv
```

如果你的系统 Python 是 3.12，建议额外安装：

```bash
sudo apt install -y python3.12-venv
```

## 启动

```bash
cd service
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
bash scripts/start.sh
```

如果你在 `python3 -m pip ...` 这一步遇到 `No module named pip`，说明当前系统缺少完整的 `venv/ensurepip` 组件，或者现有 `.venv` 已损坏。常见修复方式：

```bash
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
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

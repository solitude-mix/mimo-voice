from __future__ import annotations

import argparse
import json
import pathlib
import sys
import tempfile
import urllib.error
import urllib.request

from .config import get_settings
from .errors import DependencyError, ProviderError, ValidationError
from .response_utils import error_payload, ok_payload
from .service import VoiceService


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="MiMo Voice Service local CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    health = sub.add_parser("health", help="Check local service health")
    health.add_argument("--url", default="http://127.0.0.1:8091/health")

    tts = sub.add_parser("tts", help="Synthesize text to wav locally")
    tts.add_argument("text", help="Text to synthesize")
    tts.add_argument("--voice", default="default_zh")
    tts.add_argument("--user-prompt")
    tts.add_argument("--out", help="Output wav path")
    tts.add_argument("--save-file", action="store_true", help="Save into service-managed data dir if --out is omitted")
    tts.add_argument("--no-split-long-text", action="store_true")
    tts.add_argument("--max-chars-per-chunk", type=int, default=120)

    send = sub.add_parser("send-telegram-voice", help="Synthesize and send Telegram voice locally")
    send.add_argument("text", help="Text to synthesize and send")
    send.add_argument("--chat-id", required=True)
    send.add_argument("--voice", default="default_zh")
    send.add_argument("--user-prompt")
    send.add_argument("--style")
    send.add_argument("--emotion")
    send.add_argument("--dialect")
    send.add_argument("--no-style-tag", action="store_true")
    send.add_argument("--reply-to-message-id")
    send.add_argument("--keep-file", action="store_true")
    send.add_argument("--no-split-long-text", action="store_true")
    send.add_argument("--max-chars-per-chunk", type=int, default=120)

    return parser


def print_json(data: dict) -> None:
    print(json.dumps(data, ensure_ascii=False))


def cmd_health(url: str) -> int:
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            print(resp.read().decode("utf-8", errors="replace"))
    except urllib.error.URLError as exc:
        print_json(error_payload(f"health check failed: {exc}", code="service_unavailable"))
        return 1
    return 0


def cmd_tts(args: argparse.Namespace) -> int:
    settings = get_settings()
    service = VoiceService(settings)
    audio, chunks, saved_path = service.synthesize_to_wav(
        text=args.text,
        voice=args.voice,
        user_prompt=args.user_prompt,
        split_long_text=not args.no_split_long_text,
        max_chars_per_chunk=args.max_chars_per_chunk,
        save_file=args.save_file and not args.out,
    )
    if args.out:
        out_path = pathlib.Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(audio)
        file_path = str(out_path)
    elif saved_path:
        file_path = saved_path
    else:
        out_path = pathlib.Path(tempfile.gettempdir()) / "mimo_cli_output.wav"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(audio)
        file_path = str(out_path)
    print_json(ok_payload(
        file_path=file_path,
        bytes=len(audio),
        chunks=chunks,
        voice=args.voice,
    ))
    return 0


def cmd_send_telegram_voice(args: argparse.Namespace) -> int:
    settings = get_settings()
    service = VoiceService(settings)
    result = service.send_telegram_voice(
        text=args.text,
        chat_id=args.chat_id,
        voice=args.voice,
        user_prompt=args.user_prompt,
        style=args.style,
        emotion=args.emotion,
        dialect=args.dialect,
        no_style_tag=args.no_style_tag,
        reply_to_message_id=args.reply_to_message_id,
        keep_file=args.keep_file,
        split_long_text=not args.no_split_long_text,
        max_chars_per_chunk=args.max_chars_per_chunk,
    )
    print_json(ok_payload(
        chat_id=result.chat_id,
        message_id=result.message_id,
        voice_file_id=result.voice_file_id,
        local_file=result.local_file,
        chunks=result.chunks,
    ))
    return 0


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        if args.command == "health":
            return cmd_health(args.url)
        if args.command == "tts":
            return cmd_tts(args)
        if args.command == "send-telegram-voice":
            return cmd_send_telegram_voice(args)
    except ValidationError as exc:
        print_json(error_payload(str(exc), code="validation_error"))
        return 1
    except DependencyError as exc:
        print_json(error_payload(str(exc), code="dependency_error"))
        return 1
    except ProviderError as exc:
        print_json(error_payload(str(exc), code="provider_error"))
        return 1
    except Exception as exc:
        print_json(error_payload(str(exc), code="runtime_error"))
        return 1

    parser.error(f"Unknown command: {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())

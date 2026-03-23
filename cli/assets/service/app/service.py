from __future__ import annotations

import logging
import pathlib
import tempfile
import time
from dataclasses import dataclass
from typing import Optional

from .audio import ffmpeg_to_ogg
from .config import Settings
from .errors import ValidationError
from .file_utils import build_output_path
from .mimo import MimoClient
from .telegram import TelegramClient
from .text_utils import split_text_for_tts


logger = logging.getLogger(__name__)


@dataclass
class VoiceSendResult:
    chat_id: str
    message_id: Optional[int]
    voice_file_id: Optional[str]
    local_file: Optional[str]
    chunks: int = 1


def normalize_text(text: str, style: Optional[str], no_style_tag: bool) -> str:
    text = text.strip()
    if not text:
        return text
    if no_style_tag or not style or not style.strip() or text.startswith("<style>"):
        return text
    return f"<style>{style.strip()}</style>{text}"


def validate_text(text: str) -> str:
    text = text.strip()
    if not text:
        raise ValidationError("Text must not be empty")
    return text


class VoiceService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.mimo = MimoClient(settings)
        self.telegram = TelegramClient(settings)

    def synthesize_to_wav(
        self,
        text: str,
        voice: str,
        user_prompt: Optional[str] = None,
        split_long_text: bool = True,
        max_chars_per_chunk: int = 120,
        save_file: bool = False,
    ) -> tuple[bytes, int, Optional[str]]:
        text = validate_text(text)
        chunks = split_text_for_tts(text, max_chars=max_chars_per_chunk) if split_long_text else [text]
        logger.info("VoiceService synthesize_to_wav start voice=%s chunks=%s", voice, len(chunks))
        audio_parts: list[bytes] = []
        for idx, chunk in enumerate(chunks, start=1):
            logger.info("VoiceService synthesize chunk=%s/%s chars=%s", idx, len(chunks), len(chunk))
            audio_parts.append(self.mimo.synthesize(text=chunk, voice=voice, user_prompt=user_prompt))
        audio = b"".join(audio_parts)
        saved_path = None
        if save_file:
            out_path = build_output_path(self.settings.raw_tts_dir, "mimo_tts", text, "wav")
            out_path.write_bytes(audio)
            saved_path = str(out_path)
            logger.info("VoiceService saved raw wav path=%s", saved_path)
        logger.info("VoiceService synthesize_to_wav done bytes=%s", len(audio))
        return audio, len(chunks), saved_path

    def send_telegram_voice(
        self,
        text: str,
        chat_id: str,
        voice: str,
        user_prompt: Optional[str] = None,
        style: Optional[str] = None,
        emotion: Optional[str] = None,
        dialect: Optional[str] = None,
        no_style_tag: bool = False,
        reply_to_message_id: Optional[str] = None,
        keep_file: bool = False,
        split_long_text: bool = True,
        max_chars_per_chunk: int = 120,
    ) -> VoiceSendResult:
        request_started = time.perf_counter()
        text = validate_text(text)
        style_parts = [part.strip() for part in [style, emotion, dialect] if part and part.strip()]
        merged_style = " ".join(style_parts) if style_parts else None
        final_text = normalize_text(text, merged_style, no_style_tag)
        logger.info(
            "VoiceService send_telegram_voice start chat_id=%s voice=%s keep_file=%s style=%s",
            chat_id,
            voice,
            keep_file,
            merged_style,
        )

        with tempfile.TemporaryDirectory(prefix="mimo-telegram-") as td:
            td_path = pathlib.Path(td)
            wav_path = td_path / "voice.wav"
            ogg_path = td_path / "voice.ogg"

            t0 = time.perf_counter()
            wav_bytes, chunk_count, _saved_wav = self.synthesize_to_wav(
                final_text,
                voice=voice,
                user_prompt=user_prompt,
                split_long_text=split_long_text,
                max_chars_per_chunk=max_chars_per_chunk,
                save_file=False,
            )
            wav_path.write_bytes(wav_bytes)
            logger.info("VoiceService wav saved path=%s bytes=%s chunks=%s elapsed=%.2fs", wav_path, len(wav_bytes), chunk_count, time.perf_counter() - t0)

            t1 = time.perf_counter()
            logger.info("VoiceService ffmpeg start src=%s", wav_path)
            ffmpeg_to_ogg(wav_path, ogg_path)
            logger.info("VoiceService ffmpeg done dst=%s bytes=%s elapsed=%.2fs", ogg_path, ogg_path.stat().st_size, time.perf_counter() - t1)

            t2 = time.perf_counter()
            result = self.telegram.send_voice(chat_id=chat_id, voice_path=ogg_path, reply_to_message_id=reply_to_message_id)
            logger.info("VoiceService telegram upload done elapsed=%.2fs", time.perf_counter() - t2)

            local_file = None
            if keep_file:
                final_ogg = build_output_path(self.settings.audio_keep_dir, "telegram_mimo", final_text, "ogg")
                final_ogg.write_bytes(ogg_path.read_bytes())
                local_file = str(final_ogg)
                logger.info("VoiceService kept file path=%s", local_file)

        payload = result.get("result", {})
        voice_obj = payload.get("voice", {})
        logger.info("VoiceService send_telegram_voice done total_elapsed=%.2fs", time.perf_counter() - request_started)
        return VoiceSendResult(
            chat_id=chat_id,
            message_id=payload.get("message_id"),
            voice_file_id=voice_obj.get("file_id"),
            local_file=local_file,
            chunks=chunk_count,
        )

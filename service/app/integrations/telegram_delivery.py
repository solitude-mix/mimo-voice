from __future__ import annotations

import logging
import pathlib
import tempfile
import time
from dataclasses import dataclass
from typing import Optional

from ..audio.audio import ffmpeg_to_ogg
from ..channels.telegram import TelegramClient
from ..core.config import Settings
from ..core.file_utils import build_output_path
from ..core.speech import SpeechOrchestrator
from ..core.text_processing import apply_style_tag, merge_style, validate_text


logger = logging.getLogger(__name__)


@dataclass
class TelegramVoiceDeliveryResult:
    chat_id: str
    message_id: Optional[int]
    voice_file_id: Optional[str]
    local_file: Optional[str]
    chunks: int = 1


class TelegramVoiceDelivery:
    def __init__(
        self,
        settings: Settings,
        speech: Optional[SpeechOrchestrator] = None,
        telegram: Optional[TelegramClient] = None,
    ):
        self.settings = settings
        self.speech = speech or SpeechOrchestrator(settings)
        self.telegram = telegram or TelegramClient(settings)

    def send_voice(
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
    ) -> TelegramVoiceDeliveryResult:
        request_started = time.perf_counter()
        text = validate_text(text)
        merged_style = merge_style(style, emotion, dialect)
        final_text = apply_style_tag(text, merged_style, no_style_tag)
        logger.info(
            "TelegramVoiceDelivery send_voice start chat_id=%s voice=%s keep_file=%s style=%s",
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
            wav_bytes, chunk_count, _saved_wav = self.speech.synthesize_to_wav(
                final_text,
                voice=voice,
                user_prompt=user_prompt,
                split_long_text=split_long_text,
                max_chars_per_chunk=max_chars_per_chunk,
                save_file=False,
            )
            wav_path.write_bytes(wav_bytes)
            logger.info(
                "TelegramVoiceDelivery wav saved path=%s bytes=%s chunks=%s elapsed=%.2fs",
                wav_path,
                len(wav_bytes),
                chunk_count,
                time.perf_counter() - t0,
            )

            t1 = time.perf_counter()
            logger.info("TelegramVoiceDelivery ffmpeg start src=%s", wav_path)
            ffmpeg_to_ogg(wav_path, ogg_path)
            logger.info(
                "TelegramVoiceDelivery ffmpeg done dst=%s bytes=%s elapsed=%.2fs",
                ogg_path,
                ogg_path.stat().st_size,
                time.perf_counter() - t1,
            )

            t2 = time.perf_counter()
            result = self.telegram.send_voice(chat_id=chat_id, voice_path=ogg_path, reply_to_message_id=reply_to_message_id)
            logger.info("TelegramVoiceDelivery telegram upload done elapsed=%.2fs", time.perf_counter() - t2)

            local_file = None
            if keep_file:
                final_ogg = build_output_path(self.settings.audio.audio_keep_dir, "telegram_mimo", final_text, "ogg")
                final_ogg.write_bytes(ogg_path.read_bytes())
                local_file = str(final_ogg)
                logger.info("TelegramVoiceDelivery kept file path=%s", local_file)

        payload = result.get("result", {})
        voice_obj = payload.get("voice", {})
        logger.info("TelegramVoiceDelivery send_voice done total_elapsed=%.2fs", time.perf_counter() - request_started)
        return TelegramVoiceDeliveryResult(
            chat_id=chat_id,
            message_id=payload.get("message_id"),
            voice_file_id=voice_obj.get("file_id"),
            local_file=local_file,
            chunks=chunk_count,
        )

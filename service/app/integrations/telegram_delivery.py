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
from ..core.speech import GeneratedSpeech, SpeechOrchestrator
from ..core.text_processing import apply_style_tag, merge_style, validate_text


logger = logging.getLogger(__name__)


@dataclass
class VoiceDeliveryRequest:
    channel: str
    text: str
    voice: str
    user_prompt: Optional[str] = None
    style: Optional[str] = None
    emotion: Optional[str] = None
    dialect: Optional[str] = None
    no_style_tag: bool = False
    keep_file: bool = False
    split_long_text: bool = True
    max_chars_per_chunk: int = 120


@dataclass
class TelegramVoiceRequest:
    chat_id: str
    reply_to_message_id: Optional[str] = None


@dataclass
class VoiceDeliveryResult:
    channel: str
    message_id: Optional[int]
    voice_file_id: Optional[str]
    local_file: Optional[str]
    chunks: int = 1


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

    def generate_speech_for_delivery(self, request: VoiceDeliveryRequest) -> GeneratedSpeech:
        text = validate_text(request.text)
        merged_style = merge_style(request.style, request.emotion, request.dialect)
        final_text = apply_style_tag(text, merged_style, request.no_style_tag)
        return self.speech.generate_speech(
            text=final_text,
            voice=request.voice,
            user_prompt=request.user_prompt,
            split_long_text=request.split_long_text,
            max_chars_per_chunk=request.max_chars_per_chunk,
            save_file=False,
        )

    def send_voice(self, audio: GeneratedSpeech, request: TelegramVoiceRequest, source_text: str, keep_file: bool = False) -> TelegramVoiceDeliveryResult:
        request_started = time.perf_counter()
        logger.info(
            "TelegramVoiceDelivery send_voice start chat_id=%s keep_file=%s chunks=%s",
            request.chat_id,
            keep_file,
            audio.chunks,
        )

        with tempfile.TemporaryDirectory(prefix="mimo-telegram-") as td:
            td_path = pathlib.Path(td)
            wav_path = td_path / "voice.wav"
            ogg_path = td_path / "voice.ogg"

            t0 = time.perf_counter()
            wav_path.write_bytes(audio.audio)
            logger.info(
                "TelegramVoiceDelivery wav saved path=%s bytes=%s chunks=%s elapsed=%.2fs",
                wav_path,
                len(audio.audio),
                audio.chunks,
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
            result = self.telegram.send_voice(
                chat_id=request.chat_id,
                voice_path=ogg_path,
                reply_to_message_id=request.reply_to_message_id,
            )
            logger.info("TelegramVoiceDelivery telegram upload done elapsed=%.2fs", time.perf_counter() - t2)

            local_file = None
            if keep_file:
                final_ogg = build_output_path(self.settings.audio.audio_keep_dir, "telegram_mimo", source_text, "ogg")
                final_ogg.write_bytes(ogg_path.read_bytes())
                local_file = str(final_ogg)
                logger.info("TelegramVoiceDelivery kept file path=%s", local_file)

        payload = result.get("result", {})
        voice_obj = payload.get("voice", {})
        logger.info("TelegramVoiceDelivery send_voice done total_elapsed=%.2fs", time.perf_counter() - request_started)
        return TelegramVoiceDeliveryResult(
            chat_id=request.chat_id,
            message_id=payload.get("message_id"),
            voice_file_id=voice_obj.get("file_id"),
            local_file=local_file,
            chunks=audio.chunks,
        )

    def deliver_voice(self, delivery: VoiceDeliveryRequest, telegram_request: TelegramVoiceRequest) -> VoiceDeliveryResult:
        generated = self.generate_speech_for_delivery(delivery)
        telegram_result = self.send_voice(
            audio=generated,
            request=telegram_request,
            source_text=delivery.text,
            keep_file=delivery.keep_file,
        )
        return VoiceDeliveryResult(
            channel=delivery.channel,
            message_id=telegram_result.message_id,
            voice_file_id=telegram_result.voice_file_id,
            local_file=telegram_result.local_file,
            chunks=telegram_result.chunks,
        )

    def send_text_as_voice(
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
        delivery = VoiceDeliveryRequest(
            channel="telegram",
            text=text,
            voice=voice,
            user_prompt=user_prompt,
            style=style,
            emotion=emotion,
            dialect=dialect,
            no_style_tag=no_style_tag,
            keep_file=keep_file,
            split_long_text=split_long_text,
            max_chars_per_chunk=max_chars_per_chunk,
        )
        telegram_request = TelegramVoiceRequest(
            chat_id=chat_id,
            reply_to_message_id=reply_to_message_id,
        )
        result = self.deliver_voice(delivery, telegram_request)
        return TelegramVoiceDeliveryResult(
            chat_id=chat_id,
            message_id=result.message_id,
            voice_file_id=result.voice_file_id,
            local_file=result.local_file,
            chunks=result.chunks,
        )

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .config import Settings
from .speech import GeneratedSpeech, SpeechOrchestrator
from ..integrations.telegram_delivery import TelegramVoiceDelivery, TelegramVoiceRequest, VoiceDeliveryRequest


@dataclass
class VoiceSendResult:
    chat_id: str
    message_id: Optional[int]
    voice_file_id: Optional[str]
    local_file: Optional[str]
    chunks: int = 1


class VoiceService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.speech = SpeechOrchestrator(settings)
        self.telegram_delivery = TelegramVoiceDelivery(settings, speech=self.speech)

    def generate_speech(
        self,
        text: str,
        voice: str,
        user_prompt: Optional[str] = None,
        style: Optional[str] = None,
        emotion: Optional[str] = None,
        dialect: Optional[str] = None,
        no_style_tag: bool = False,
        split_long_text: bool = True,
        max_chars_per_chunk: int = 120,
        save_file: bool = False,
    ) -> GeneratedSpeech:
        from .text_processing import apply_style_tag, apply_dialect_rewrite, merge_style

        merged_style = merge_style(style, emotion, dialect)
        final_text = apply_dialect_rewrite(text, dialect)
        final_text = apply_style_tag(final_text, merged_style, no_style_tag)
        return self.speech.generate_speech(
            text=final_text,
            voice=voice,
            user_prompt=user_prompt,
            split_long_text=split_long_text,
            max_chars_per_chunk=max_chars_per_chunk,
            save_file=save_file,
        )

    def deliver_voice(
        self,
        channel: str,
        text: str,
        voice: str,
        chat_id: Optional[str] = None,
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
        if channel != "telegram":
            raise ValueError(f"Unsupported channel: {channel}")
        if not chat_id:
            raise ValueError("chat_id is required for telegram delivery")

        delivery = VoiceDeliveryRequest(
            channel=channel,
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
        result = self.telegram_delivery.deliver_voice(delivery, telegram_request)
        return VoiceSendResult(
            chat_id=chat_id,
            message_id=result.message_id,
            voice_file_id=result.voice_file_id,
            local_file=result.local_file,
            chunks=result.chunks,
        )

    # Compatibility methods for current API/CLI surface.
    def synthesize_to_wav(
        self,
        text: str,
        voice: str,
        user_prompt: Optional[str] = None,
        style: Optional[str] = None,
        emotion: Optional[str] = None,
        dialect: Optional[str] = None,
        no_style_tag: bool = False,
        split_long_text: bool = True,
        max_chars_per_chunk: int = 120,
        save_file: bool = False,
    ) -> tuple[bytes, int, Optional[str]]:
        result = self.generate_speech(
            text=text,
            voice=voice,
            user_prompt=user_prompt,
            style=style,
            emotion=emotion,
            dialect=dialect,
            no_style_tag=no_style_tag,
            split_long_text=split_long_text,
            max_chars_per_chunk=max_chars_per_chunk,
            save_file=save_file,
        )
        return result.audio, result.chunks, result.file_path

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
        return self.deliver_voice(
            channel="telegram",
            text=text,
            chat_id=chat_id,
            voice=voice,
            user_prompt=user_prompt,
            style=style,
            emotion=emotion,
            dialect=dialect,
            no_style_tag=no_style_tag,
            reply_to_message_id=reply_to_message_id,
            keep_file=keep_file,
            split_long_text=split_long_text,
            max_chars_per_chunk=max_chars_per_chunk,
        )

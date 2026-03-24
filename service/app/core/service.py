from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from .config import Settings
from .speech import SpeechOrchestrator
from ..integrations.telegram_delivery import TelegramVoiceDelivery


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

    def synthesize_to_wav(
        self,
        text: str,
        voice: str,
        user_prompt: Optional[str] = None,
        split_long_text: bool = True,
        max_chars_per_chunk: int = 120,
        save_file: bool = False,
    ) -> tuple[bytes, int, Optional[str]]:
        return self.speech.synthesize_to_wav(
            text=text,
            voice=voice,
            user_prompt=user_prompt,
            split_long_text=split_long_text,
            max_chars_per_chunk=max_chars_per_chunk,
            save_file=save_file,
        )

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
        result = self.telegram_delivery.send_voice(
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
        return VoiceSendResult(
            chat_id=result.chat_id,
            message_id=result.message_id,
            voice_file_id=result.voice_file_id,
            local_file=result.local_file,
            chunks=result.chunks,
        )

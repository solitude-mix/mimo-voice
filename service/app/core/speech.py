from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Optional

from .config import Settings
from .file_utils import build_output_path
from .text_processing import validate_text
from .text_utils import split_text_for_tts
from ..providers.mimo import MimoClient


logger = logging.getLogger(__name__)


@dataclass
class GeneratedSpeech:
    audio: bytes
    chunks: int
    file_path: Optional[str] = None
    format: str = "wav"


class SpeechOrchestrator:
    def __init__(self, settings: Settings, mimo: Optional[MimoClient] = None):
        self.settings = settings
        self.mimo = mimo or MimoClient(settings)

    def generate_speech(
        self,
        text: str,
        voice: str,
        user_prompt: Optional[str] = None,
        split_long_text: bool = True,
        max_chars_per_chunk: int = 120,
        save_file: bool = False,
    ) -> GeneratedSpeech:
        text = validate_text(text)
        chunks = split_text_for_tts(text, max_chars=max_chars_per_chunk) if split_long_text else [text]
        logger.info("SpeechOrchestrator generate_speech start voice=%s chunks=%s", voice, len(chunks))
        audio_parts: list[bytes] = []
        for idx, chunk in enumerate(chunks, start=1):
            logger.info("SpeechOrchestrator synthesize chunk=%s/%s chars=%s", idx, len(chunks), len(chunk))
            audio_parts.append(self.mimo.synthesize(text=chunk, voice=voice, user_prompt=user_prompt))
        audio = b"".join(audio_parts)
        saved_path = None
        if save_file:
            out_path = build_output_path(self.settings.audio.raw_tts_dir, "mimo_tts", text, "wav")
            out_path.write_bytes(audio)
            saved_path = str(out_path)
            logger.info("SpeechOrchestrator saved raw wav path=%s", saved_path)
        logger.info("SpeechOrchestrator generate_speech done bytes=%s", len(audio))
        return GeneratedSpeech(audio=audio, chunks=len(chunks), file_path=saved_path, format="wav")

    def synthesize_to_wav(
        self,
        text: str,
        voice: str,
        user_prompt: Optional[str] = None,
        split_long_text: bool = True,
        max_chars_per_chunk: int = 120,
        save_file: bool = False,
    ) -> tuple[bytes, int, Optional[str]]:
        result = self.generate_speech(
            text=text,
            voice=voice,
            user_prompt=user_prompt,
            split_long_text=split_long_text,
            max_chars_per_chunk=max_chars_per_chunk,
            save_file=save_file,
        )
        return result.audio, result.chunks, result.file_path

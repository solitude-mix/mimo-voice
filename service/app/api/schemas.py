from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice: str = Field(default="default_zh")
    user_prompt: Optional[str] = None
    style: Optional[str] = None
    emotion: Optional[str] = None
    dialect: Optional[str] = None
    no_style_tag: bool = False
    split_long_text: bool = True
    max_chars_per_chunk: int = Field(default=120, ge=20, le=500)
    save_file: bool = False


class TTSResponse(BaseModel):
    ok: bool = True
    format: str = "wav"
    voice: str
    bytes: int
    file_path: Optional[str] = None
    chunks: int = 1


class TelegramVoiceRequest(BaseModel):
    text: str = Field(..., min_length=1)
    chat_id: str = Field(..., min_length=1)
    voice: str = Field(default="default_zh")
    user_prompt: Optional[str] = None
    style: Optional[str] = None
    emotion: Optional[str] = None
    dialect: Optional[str] = None
    no_style_tag: bool = False
    reply_to_message_id: Optional[str] = None
    keep_file: bool = False
    split_long_text: bool = True
    max_chars_per_chunk: int = Field(default=120, ge=20, le=500)


class TelegramVoiceResponse(BaseModel):
    ok: bool = True
    chat_id: str
    message_id: Optional[int] = None
    voice_file_id: Optional[str] = None
    local_file: Optional[str] = None
    chunks: int = 1

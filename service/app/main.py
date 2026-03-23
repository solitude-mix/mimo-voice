from __future__ import annotations

import logging
import time
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response

from .config import ConfigError, get_settings
from .errors import DependencyError, ProviderError, ValidationError
from .logging_utils import setup_logging
from .response_utils import error_payload, ok_payload
from .schemas import TTSRequest, TTSResponse, TelegramVoiceRequest, TelegramVoiceResponse
from .service import VoiceService

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(title="MiMo Voice Service", version="0.1.0")


@app.exception_handler(ConfigError)
async def handle_config_error(_request: Request, exc: ConfigError):
    return JSONResponse(status_code=500, content=error_payload(str(exc), code="config_error"))


@app.exception_handler(ValidationError)
async def handle_validation_error(_request: Request, exc: ValidationError):
    return JSONResponse(status_code=400, content=error_payload(str(exc), code="validation_error"))


@app.exception_handler(DependencyError)
async def handle_dependency_error(_request: Request, exc: DependencyError):
    return JSONResponse(status_code=500, content=error_payload(str(exc), code="dependency_error"))


@app.exception_handler(ProviderError)
async def handle_provider_error(_request: Request, exc: ProviderError):
    return JSONResponse(status_code=502, content=error_payload(str(exc), code="provider_error"))


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = uuid4().hex[:8]
    started = time.perf_counter()
    logger.info("request start id=%s method=%s path=%s", request_id, request.method, request.url.path)
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("request error id=%s method=%s path=%s", request_id, request.method, request.url.path)
        raise
    elapsed = time.perf_counter() - started
    logger.info("request done id=%s status=%s elapsed=%.2fs", request_id, response.status_code, elapsed)
    response.headers["X-Request-Id"] = request_id
    return response


@app.get("/health")
def health() -> dict:
    return ok_payload(service="mimo-voice-service")


@app.post("/tts", response_model=TTSResponse)
def tts(req: TTSRequest):
    settings = get_settings()
    service = VoiceService(settings)
    audio, chunks, file_path = service.synthesize_to_wav(
        text=req.text,
        voice=req.voice,
        user_prompt=req.user_prompt,
        split_long_text=req.split_long_text,
        max_chars_per_chunk=req.max_chars_per_chunk,
        save_file=req.save_file,
    )
    return TTSResponse(voice=req.voice, bytes=len(audio), chunks=chunks, file_path=file_path)


@app.post("/tts/raw")
def tts_raw(req: TTSRequest):
    settings = get_settings()
    service = VoiceService(settings)
    audio, _chunks, _file_path = service.synthesize_to_wav(
        text=req.text,
        voice=req.voice,
        user_prompt=req.user_prompt,
        split_long_text=req.split_long_text,
        max_chars_per_chunk=req.max_chars_per_chunk,
        save_file=req.save_file,
    )
    return Response(content=audio, media_type="audio/wav")


@app.post("/telegram/send-voice", response_model=TelegramVoiceResponse)
def telegram_send_voice(req: TelegramVoiceRequest):
    settings = get_settings()
    service = VoiceService(settings)
    result = service.send_telegram_voice(
        text=req.text,
        chat_id=req.chat_id,
        voice=req.voice,
        user_prompt=req.user_prompt,
        style=req.style,
        emotion=req.emotion,
        dialect=req.dialect,
        no_style_tag=req.no_style_tag,
        reply_to_message_id=req.reply_to_message_id,
        keep_file=req.keep_file,
        split_long_text=req.split_long_text,
        max_chars_per_chunk=req.max_chars_per_chunk,
    )

    return TelegramVoiceResponse(
        chat_id=result.chat_id,
        message_id=result.message_id,
        voice_file_id=result.voice_file_id,
        local_file=result.local_file,
        chunks=result.chunks,
    )

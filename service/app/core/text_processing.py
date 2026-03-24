from __future__ import annotations

from typing import Optional

from .errors import ValidationError


def validate_text(text: str) -> str:
    text = text.strip()
    if not text:
        raise ValidationError("Text must not be empty")
    return text


def merge_style(style: Optional[str], emotion: Optional[str], dialect: Optional[str]) -> Optional[str]:
    style_parts = [part.strip() for part in [style, emotion, dialect] if part and part.strip()]
    return " ".join(style_parts) if style_parts else None


def apply_style_tag(text: str, style: Optional[str], no_style_tag: bool) -> str:
    text = text.strip()
    if not text:
        return text
    if no_style_tag or not style or not style.strip() or text.startswith("<style>"):
        return text
    return f"<style>{style.strip()}</style>{text}"

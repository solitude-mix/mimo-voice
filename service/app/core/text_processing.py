from __future__ import annotations

import re
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


INLINE_PERFORMANCE_PREFIX_RE = re.compile(r"^(?:<style>.*?</style>)?\s*[（(【\[].{1,24}[）)】\]]", re.S)


def apply_dialect_rewrite(text: str, dialect: Optional[str]) -> str:
    text = text.strip()
    if not text or not dialect:
        return text

    normalized = dialect.strip()
    if normalized not in {"粤语", "广东话", "白话"}:
        return text
    if len(text) > 80:
        return text

    replacements = [
        ("我是", "我係"),
        ("你是", "你係"),
        ("不是", "唔係"),
        ("什么", "乜嘢"),
        ("你好", "你好"),
        ("谢谢", "多谢"),
        ("真的", "真係"),
        ("这个", "呢个"),
        ("那个", "嗰个"),
        ("没有", "冇"),
        ("不要", "唔好"),
    ]

    rewritten = text
    for src, dst in replacements:
        rewritten = rewritten.replace(src, dst)
    return rewritten


def apply_style_tag(text: str, style: Optional[str], no_style_tag: bool) -> str:
    text = text.strip()
    if not text:
        return text
    if no_style_tag or not style or not style.strip() or text.startswith("<style>"):
        return text
    if INLINE_PERFORMANCE_PREFIX_RE.match(text):
        return text
    return f"<style>{style.strip()}</style>{text}"

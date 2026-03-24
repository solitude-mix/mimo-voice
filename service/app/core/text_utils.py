from __future__ import annotations

from typing import List


def split_text_for_tts(text: str, max_chars: int = 120) -> List[str]:
    text = text.strip()
    if not text:
        return []
    if len(text) <= max_chars:
        return [text]

    separators = "。！？!?；;\n"
    chunks: List[str] = []
    current = ""

    for ch in text:
        current += ch
        if len(current) >= max_chars and ch in separators:
            chunks.append(current.strip())
            current = ""

    if current.strip():
        remainder = current.strip()
        while len(remainder) > max_chars:
            chunks.append(remainder[:max_chars].strip())
            remainder = remainder[max_chars:].strip()
        if remainder:
            chunks.append(remainder)

    return [chunk for chunk in chunks if chunk]

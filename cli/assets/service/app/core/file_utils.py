from __future__ import annotations

import pathlib
import re
import time


def safe_slug(text: str, limit: int = 24) -> str:
    text = re.sub(r"\s+", "-", text.strip())
    text = re.sub(r"[^\w\-\u4e00-\u9fff]+", "", text)
    text = text.strip("-_")
    return (text or "audio")[:limit]


def build_output_path(base_dir: pathlib.Path, prefix: str, text: str, ext: str) -> pathlib.Path:
    stamp = int(time.time())
    slug = safe_slug(text)
    return base_dir / f"{prefix}_{stamp}_{slug}.{ext.lstrip('.')}"

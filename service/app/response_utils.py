from __future__ import annotations

from typing import Any


def ok_payload(**kwargs: Any) -> dict[str, Any]:
    return {"ok": True, **kwargs}


def error_payload(error: str, code: str = "runtime_error", **kwargs: Any) -> dict[str, Any]:
    return {"ok": False, "error": error, "code": code, **kwargs}

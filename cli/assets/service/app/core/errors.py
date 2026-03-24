from __future__ import annotations


class VoiceServiceError(RuntimeError):
    """Base error for MiMo voice service."""


class ValidationError(VoiceServiceError):
    """Raised when user input is invalid."""


class DependencyError(VoiceServiceError):
    """Raised when required local dependencies are unavailable."""


class ProviderError(VoiceServiceError):
    """Raised when an upstream provider fails."""

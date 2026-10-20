# Modified by Sekar Nagarajan (2026-10-20 12:52)
"""AsyncAnthropic singleton."""

from __future__ import annotations

from anthropic import AsyncAnthropic

from app.config import Settings

_client: AsyncAnthropic | None = None


def get_anthropic(settings: Settings | None = None) -> AsyncAnthropic:
    global _client
    if _client is None:
        api_key = (settings.anthropic_api_key if settings else "") or None
        _client = AsyncAnthropic(api_key=api_key)
    return _client


def set_anthropic(client: AsyncAnthropic | None) -> None:
    """Test hook to inject a fake client."""
    global _client
    _client = client


def reset_anthropic() -> None:
    set_anthropic(None)

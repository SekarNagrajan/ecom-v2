# Modified by Sekar Nagarajan (2026-10-20 14:47)
from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.config import Settings


def test_production_rejects_trusted_dev():
    with pytest.raises(ValidationError):
        Settings(env="production", auth_mode="trusted-dev")


def test_development_allows_trusted_dev():
    s = Settings(env="development", auth_mode="trusted-dev")
    assert s.auth_mode == "trusted-dev"
    assert s.llm_chat_effort in ("low", "medium", "high")

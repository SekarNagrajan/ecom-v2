# Modified by Sekar Nagarajan (2026-10-20 14:47)
"""Token / caching metrics per LLM round."""

from __future__ import annotations

import logging
from typing import Any

from app.store.conversations import ConversationRecord

logger = logging.getLogger(__name__)


def record_usage(
    app_state: Any,
    conv: ConversationRecord,
    model: str,
    stop: str | None,
    usage: Any,
) -> None:
    log = getattr(app_state, "log", logger)
    u = usage
    log.info(
        "llm_usage conv=%s model=%s stop=%s in=%s out=%s cache_read=%s cache_write=%s",
        conv.conversation_id,
        model,
        stop,
        getattr(u, "input_tokens", 0),
        getattr(u, "output_tokens", 0),
        getattr(u, "cache_read_input_tokens", 0) or 0,
        getattr(u, "cache_creation_input_tokens", 0) or 0,
    )

# Modified by Sekar Nagarajan (2026-10-21 01:40)
"""Haiku 5.5 classifier: allow | off_topic | injection."""

from __future__ import annotations

import json
import logging
from typing import Literal

from anthropic import APIError, AsyncAnthropic

from app.config import Settings
from app.prompts import load
from app.logging_utils import redact

logger = logging.getLogger(__name__)

GuardVerdict = Literal["allow", "off_topic", "injection"]

_guard_override: GuardVerdict | None = None

GUARD_SYSTEM = load("guard")

GUARD_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {
            "type": "string",
            "enum": ["allow", "off_topic", "injection"],
        }
    },
    "required": ["verdict"],
    "additionalProperties": False,
}


def set_guard_override(verdict: GuardVerdict | None) -> None:
    global _guard_override
    _guard_override = verdict


async def classify_message(
    client: AsyncAnthropic,
    settings: Settings,
    message: str,
) -> GuardVerdict:
    """Classify user text before the main model. Fail-open to allow on errors."""
    if _guard_override is not None:
        return _guard_override
    if not message or not message.strip():
        return "allow"

    if settings.llm_provider == "openai":
        from app.llm.openai_runner import classify_openai

        verdict = await classify_openai(settings, GUARD_SYSTEM, message[:2000])
        return verdict if verdict is not None else "allow"  # fail-open

    model = settings.llm_guard_model or settings.llm_router_model
    try:
        resp = await client.messages.create(
            model=model,
            max_tokens=256,
            output_config={
                "effort": "low",
                "format": {"type": "json_schema", "schema": GUARD_SCHEMA},
            },
            system=[
                {
                    "type": "text",
                    "text": GUARD_SYSTEM,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=[{"role": "user", "content": message[:4000]}],
        )
        if getattr(resp, "stop_reason", None) == "refusal":
            return "injection"
        text = ""
        for block in resp.content:
            if getattr(block, "type", None) == "text":
                text += getattr(block, "text", "")
        verdict = json.loads(text)["verdict"]
        if verdict in ("allow", "off_topic", "injection"):
            return verdict  # type: ignore[return-value]
        return "allow"
    except (APIError, StopIteration, json.JSONDecodeError, KeyError, TypeError) as exc:
        logger.warning("guard fail-open: %s", type(exc).__name__)
        return "allow"
    except Exception as exc:
        logger.warning(
            "guard error: %s msg=%s", type(exc).__name__, redact(message[:80])
        )
        return "allow"


# Alias used by the plan
classify = classify_message

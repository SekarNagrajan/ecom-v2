# Modified by Sekar Nagarajan (2026-10-20 12:52)
"""SSE event payloads and encoder helpers."""

from __future__ import annotations

import json
from typing import Any, Literal

from pydantic import BaseModel, Field


class MetaEvent(BaseModel):
    conversation_id: str
    request_id: str


class TokenEvent(BaseModel):
    delta: str


class CitationEvent(BaseModel):
    route: str
    title: str
    marker: str


class ToolCallEvent(BaseModel):
    call_id: str
    name: str
    arguments: dict[str, Any] = Field(default_factory=dict)


class UiActionEvent(BaseModel):
    call_id: str
    kind: Literal["ui_action"] = "ui_action"
    name: str
    arguments: dict[str, Any] = Field(default_factory=dict)


class ErrorEvent(BaseModel):
    code: str
    message: str
    retryable: bool = False


class DoneEvent(BaseModel):
    awaiting_tools: bool = False
    pending_call_ids: list[str] = Field(default_factory=list)


def sse(event: str, payload: BaseModel | dict[str, Any]) -> dict[str, str]:
    """Build an sse-starlette event dict."""
    if isinstance(payload, BaseModel):
        data = payload.model_dump_json()
    else:
        data = json.dumps(payload)
    return {"event": event, "data": data}

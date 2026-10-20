# Modified by Sekar Nagarajan (2026-10-20 16:40)
"""Redis conversation store: append-only Anthropic messages, TTL 24h."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field
from redis.asyncio import Redis

from app.config import Settings
from app.modes import AssistantMode

logger = logging.getLogger(__name__)


class PendingToolCall(BaseModel):
    call_id: str
    name: str
    arguments: dict[str, Any] = Field(default_factory=dict)
    kind: str = "tool_call"  # tool_call | ui_action


class ConversationRecord(BaseModel):
    conversation_id: str
    user_id: str
    tenant_id: str = ""
    capability_profile: str = "NONE"
    mode: AssistantMode = "assistant"
    tool_names: list[str] = Field(default_factory=list)
    messages: list[dict[str, Any]] = Field(default_factory=list)  # APPEND ONLY
    pending_tool_calls: list[PendingToolCall] = Field(default_factory=list)
    parked_results: list[dict[str, Any]] = Field(default_factory=list)
    pending_assistant_id: str | None = None
    tool_rounds: int = 0
    user_turns: int = 0
    display: list[dict[str, Any]] = Field(default_factory=list)
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


def _key(conversation_id: str) -> str:
    return f"conv:{conversation_id}"


def _lock_key(conversation_id: str) -> str:
    return f"lock:conv:{conversation_id}"


class ConversationStore:
    def __init__(self, redis: Redis, settings: Settings) -> None:
        self._redis = redis
        self._settings = settings

    async def create(
        self,
        user_id: str,
        *,
        tenant_id: str = "",
        capability_profile: str = "NONE",
        tool_names: list[str] | None = None,
        mode: AssistantMode = "assistant",
    ) -> ConversationRecord:
        record = ConversationRecord(
            conversation_id=str(uuid4()),
            user_id=user_id,
            tenant_id=tenant_id,
            capability_profile=capability_profile,
            tool_names=list(tool_names or []),
            mode=mode,
        )
        await self.save(record)
        return record

    async def get(self, conversation_id: str) -> ConversationRecord | None:
        raw = await self._redis.get(_key(conversation_id))
        if not raw:
            return None
        try:
            return ConversationRecord.model_validate_json(raw)
        except Exception:
            logger.warning("corrupt conversation %s", conversation_id)
            return None

    async def save(self, record: ConversationRecord) -> None:
        """Persist full history. Never trim messages (Claude 5.5 thinking/cache)."""
        record.updated_at = datetime.now(timezone.utc).isoformat()
        await self._redis.set(
            _key(record.conversation_id),
            record.model_dump_json(),
            ex=self._settings.conversation_ttl_seconds,
        )

    async def append_messages(
        self,
        record: ConversationRecord,
        messages: list[dict[str, Any]],
    ) -> ConversationRecord:
        record.messages.extend(messages)
        await self.save(record)
        return record

    async def set_pending(
        self,
        record: ConversationRecord,
        pending: list[PendingToolCall],
        parked: list[dict[str, Any]] | None = None,
    ) -> ConversationRecord:
        record.pending_tool_calls = pending
        if parked is not None:
            record.parked_results = parked
        await self.save(record)
        return record

    async def clear_pending(self, record: ConversationRecord) -> ConversationRecord:
        record.pending_tool_calls = []
        record.parked_results = []
        await self.save(record)
        return record

    async def acquire_lock(self, conversation_id: str, timeout: int = 120) -> bool:
        """Simple SET NX lock. Returns True if acquired."""
        ok = await self._redis.set(
            _lock_key(conversation_id),
            "1",
            nx=True,
            ex=timeout,
        )
        return bool(ok)

    async def release_lock(self, conversation_id: str) -> None:
        await self._redis.delete(_lock_key(conversation_id))


async def push_feedback(redis: Redis, payload: dict[str, Any]) -> None:
    await redis.rpush("feedback", json.dumps(payload))

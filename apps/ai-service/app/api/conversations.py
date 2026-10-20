# Modified by Sekar Nagarajan (2026-10-20 12:52)
"""Conversation lookup."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from app.auth.context import resolve_user
from app.models.chat import UserContext
from app.store.conversations import ConversationStore

router = APIRouter(prefix="/v1", tags=["conversations"])


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    request: Request,
    user: UserContext = Depends(resolve_user),
) -> dict[str, object]:
    settings = request.app.state.settings
    store = ConversationStore(request.app.state.redis, settings)
    record = await store.get(conversation_id)
    if record is None or record.user_id != user.user_id:
        raise HTTPException(status_code=404, detail="not found")
    return {
        "conversation_id": record.conversation_id,
        "turn_count": len(record.messages),
        "pending_tool_calls": [p.model_dump() for p in record.pending_tool_calls],
        "updated_at": record.updated_at,
    }

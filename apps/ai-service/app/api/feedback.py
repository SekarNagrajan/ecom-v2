# Modified by Sekar Nagarajan (2026-10-20 12:52)
"""User feedback storage (Redis list)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, Field

from app.auth.context import resolve_user
from app.models.chat import UserContext
from app.store.conversations import push_feedback

router = APIRouter(prefix="/v1", tags=["feedback"])


class FeedbackBody(BaseModel):
    conversation_id: str
    rating: Literal["up", "down"]
    comment: str | None = Field(default=None, max_length=2000)


@router.post("/feedback", status_code=204)
async def post_feedback(
    body: FeedbackBody,
    request: Request,
    user: UserContext = Depends(resolve_user),
) -> Response:
    await push_feedback(
        request.app.state.redis,
        {
            "conversation_id": body.conversation_id,
            "rating": body.rating,
            "comment": body.comment,
            "user_id": user.user_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    return Response(status_code=204)

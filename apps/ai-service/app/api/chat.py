# Modified by Sekar Nagarajan (2026-10-20 19:40)
"""POST /v1/chat → SSE EventSourceResponse."""

from __future__ import annotations

import logging
import uuid
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, Request
from sse_starlette.sse import EventSourceResponse

from app.auth.context import resolve_user, user_from_client_context
from app.llm.client import get_anthropic
from app.llm.guard import classify_message
from app.llm.loop import run_chat_loop
from app.modes import parse_mode
from app.models.chat import ChatRequest, UserContext
from app.models.events import DoneEvent, ErrorEvent, MetaEvent, sse
from app.store.conversations import ConversationRecord, ConversationStore
from app.store.ratelimit import check_rate_limit
from app.tools.catalog import tool_names_for

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1", tags=["chat"])


def _bad(
    conversation_id: str, request_id: str, message: str = "Unknown conversation_id"
) -> list[dict[str, str]]:
    return [
        sse("meta", MetaEvent(conversation_id=conversation_id, request_id=request_id)),
        sse(
            "error",
            ErrorEvent(code="BAD_REQUEST", message=message, retryable=False),
        ),
        sse("done", DoneEvent()),
    ]


@router.post("/chat")
async def chat(
    body: ChatRequest,
    request: Request,
    user: UserContext = Depends(resolve_user),
) -> EventSourceResponse:
    settings = request.app.state.settings
    redis = request.app.state.redis
    store = ConversationStore(redis, settings)
    request_id = uuid.uuid4().hex[:12]

    async def event_gen() -> AsyncIterator[dict[str, str]]:
        resolved = user
        if settings.auth_mode == "trusted-dev":
            resolved = user_from_client_context(body.client_context, fallback=user)

        try:
            rl = await check_rate_limit(redis, settings, resolved.user_id)
        except Exception as exc:  # store down: emit a clean SSE error, not a dead socket
            request.app.state.log.error(
                "rate-limit store unavailable: %s", type(exc).__name__
            )
            conv_id = body.conversation_id or str(uuid.uuid4())
            yield sse("meta", MetaEvent(conversation_id=conv_id, request_id=request_id))
            yield sse(
                "error",
                ErrorEvent(
                    code="INTERNAL",
                    message="Service store unavailable. Try again shortly.",
                    retryable=True,
                ),
            )
            yield sse("done", DoneEvent())
            return
        if not rl.allowed:
            conv_id = body.conversation_id or str(uuid.uuid4())
            yield sse("meta", MetaEvent(conversation_id=conv_id, request_id=request_id))
            yield sse(
                "error",
                ErrorEvent(
                    code="RATE_LIMITED",
                    message="Too many requests",
                    retryable=True,
                ),
            )
            yield sse("done", DoneEvent())
            return

        profile = resolved.capability_profile()
        tenant = resolved.tenant_code or body.client_context.tenant_code or ""
        mode = parse_mode(body.mode)
        browser_tools = set(body.tools) if body.tools is not None else None
        bound_tools = tool_names_for(resolved, browser_tools, mode=mode)

        conversation: ConversationRecord | None = None
        if body.conversation_id:
            conversation = await store.get(body.conversation_id)
            if conversation is not None and conversation.mode != mode:
                for ev in _bad(
                    body.conversation_id,
                    request_id,
                    message="conversation_id mode mismatch",
                ):
                    yield ev
                return
            if conversation is not None and (
                conversation.user_id != resolved.user_id
                or conversation.tenant_id != tenant
                or conversation.capability_profile != profile
            ):
                conversation = None

        if conversation is None:
            if body.tool_results:
                for ev in _bad(
                    body.conversation_id or str(uuid.uuid4()),
                    request_id,
                ):
                    yield ev
                return
            conversation = await store.create(
                resolved.user_id,
                tenant_id=tenant,
                capability_profile=profile,
                tool_names=bound_tools,
                mode=mode,
            )

        locked = await store.acquire_lock(conversation.conversation_id)
        if not locked:
            yield sse(
                "meta",
                MetaEvent(
                    conversation_id=conversation.conversation_id,
                    request_id=request_id,
                ),
            )
            yield sse(
                "error",
                ErrorEvent(
                    code="RATE_LIMITED",
                    message="Conversation is busy",
                    retryable=True,
                ),
            )
            yield sse("done", DoneEvent())
            return

        try:
            guard_verdict = "allow"
            if body.message and body.tool_results is None:
                try:
                    client = get_anthropic(settings)
                    guard_verdict = await classify_message(
                        client, settings, body.message
                    )
                except Exception as exc:
                    logger.warning("guard skipped: %s", type(exc).__name__)
                    guard_verdict = "allow"

            client = get_anthropic(settings)
            async for event in run_chat_loop(
                request=body,
                user=resolved,
                settings=settings,
                store=store,
                client=client,
                request_id=request_id,
                conversation=conversation,
                guard_verdict=guard_verdict,
                app_state=request.app.state,
                authorization=request.headers.get("authorization"),
            ):
                yield event
        except Exception:
            logger.exception("chat failure request_id=%s", request_id)
            yield sse(
                "error",
                ErrorEvent(
                    code="INTERNAL",
                    message="Internal error",
                    retryable=False,
                ),
            )
            yield sse("done", DoneEvent())
        finally:
            await store.release_lock(conversation.conversation_id)

    return EventSourceResponse(
        event_gen(),
        ping=15,
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )

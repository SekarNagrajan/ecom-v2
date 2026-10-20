# Modified by Sekar Nagarajan (2026-10-21 00:55)
"""Streaming chat + tool loop (Claude 5.5 append-only, parked results)."""

from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator, Callable
from typing import Any

from anthropic import (
    APIConnectionError,
    APIError,
    APIStatusError,
    AsyncAnthropic,
    BadRequestError,
    RateLimitError,
)

from app.config import Settings
from app.llm.citations import CitationStream
from app.llm.prompts import build_system, turn_context
from app.models.chat import ChatRequest, ToolResult, UserContext
from app.models.events import (
    CitationEvent,
    DoneEvent,
    ErrorEvent,
    MetaEvent,
    TokenEvent,
    ToolCallEvent,
    UiActionEvent,
    sse,
)
from app.observability.usage import record_usage
from app.store.conversations import (
    ConversationRecord,
    ConversationStore,
    PendingToolCall,
)
from app.tools.catalog import (
    SERVER_TOOL_NAMES,
    UI_ACTION_NAMES,
    get_tool,
    to_anthropic_tools,
    validate_tool_arguments,
)
from app.actions.context import ActionContext, customer_for
from app.actions.registry import has_handler, run_action
from app.tools.routes import capability_for_route, route_ok
from app.tools.server_tools import run_server_tool

logger = logging.getLogger(__name__)

BETAS_FALLBACK = "server-side-fallback-2026-07-01"
BETAS_COMPACTION = "compact-2026-01-12"

StreamRunner = Callable[..., AsyncIterator[dict[str, Any]]]
_stream_runner: StreamRunner | None = None


def set_stream_runner(runner: StreamRunner | None) -> None:
    global _stream_runner
    _stream_runner = runner


def _truncate_json(value: Any, max_bytes: int) -> str:
    raw = json.dumps(value, default=str, ensure_ascii=False)
    encoded = raw.encode("utf-8")
    if len(encoded) <= max_bytes:
        return raw
    return encoded[: max_bytes - 20].decode("utf-8", errors="ignore") + "…[truncated]"


def _module_for(route: str) -> str:
    return route.split("/")[2] if route.count("/") >= 2 else "portal"


def _with_cache_breakpoint(messages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Send-time copy with cache breakpoint on last block; stored history untouched."""
    if not messages:
        return messages
    out = [*messages[:-1]]
    last = dict(messages[-1])
    content = last.get("content")
    if isinstance(content, str):
        content = [{"type": "text", "text": content}]
    elif not isinstance(content, list) or not content:
        return messages
    content = [*content[:-1], {**content[-1], "cache_control": {"type": "ephemeral"}}]
    last["content"] = content
    out.append(last)
    return out


def _dump_content_blocks(blocks: Any) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for block in blocks:
        if hasattr(block, "model_dump"):
            out.append(block.model_dump(exclude_none=True))
        elif isinstance(block, dict):
            out.append(block)
    return out


def _tool_result_block(result: ToolResult, max_bytes: int) -> dict[str, Any]:
    if result.ok:
        wrapped = {"portal_data": result.content if result.content is not None else {}}
        content = _truncate_json(wrapped, max_bytes)
        return {
            "type": "tool_result",
            "tool_use_id": result.call_id,
            "content": content,
        }
    return {
        "type": "tool_result",
        "tool_use_id": result.call_id,
        "content": result.error or "tool failed",
        "is_error": True,
    }


def merge_browser_results(
    conversation: ConversationRecord,
    results: list[ToolResult],
    settings: Settings,
) -> str | None:
    """One user message: parked immediate results + browser results. Error code or None."""
    expected = {p.call_id for p in conversation.pending_tool_calls}
    got = {r.call_id for r in results}
    if got != expected:
        return "BAD_REQUEST"
    blocks = list(conversation.parked_results)
    for r in results:
        blocks.append(_tool_result_block(r, settings.tool_result_max_bytes))
    conversation.messages.append({"role": "user", "content": blocks})
    conversation.pending_tool_calls = []
    conversation.parked_results = []
    return None


async def _default_stream(
    client: AsyncAnthropic,
    settings: Settings,
    *,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]],
    system: list[dict[str, Any]] | str,
) -> AsyncIterator[dict[str, Any]]:
    params: dict[str, Any] = {
        "model": settings.llm_chat_model,
        "max_tokens": settings.llm_max_tokens,
        "system": system,
        "tools": tools or None,
        "tool_choice": {"type": "auto"},
        "output_config": {"effort": settings.llm_chat_effort},
        "messages": _with_cache_breakpoint(messages),
    }
    betas: list[str] = []
    if settings.llm_enable_fallback:
        betas.append(BETAS_FALLBACK)
        params["fallbacks"] = "default"
    if settings.llm_enable_compaction:
        betas.append(BETAS_COMPACTION)
        params["context_management"] = {
            "edits": [{"type": "compact_20260112"}]
        }

    try:
        stream_cm = (
            client.beta.messages.stream(betas=betas, **{k: v for k, v in params.items() if v is not None})
            if betas
            else client.messages.stream(**{k: v for k, v in params.items() if v is not None})
        )
        async with stream_cm as stream:
            async for event in stream:
                etype = getattr(event, "type", None)
                if etype == "content_block_delta":
                    delta = getattr(event, "delta", None)
                    if getattr(delta, "type", None) == "text_delta":
                        yield {"type": "token", "delta": getattr(delta, "text", "")}

            final = await stream.get_final_message()
            yield {
                "type": "final",
                "stop_reason": getattr(final, "stop_reason", None),
                "content": _dump_content_blocks(final.content),
                "usage": getattr(final, "usage", None),
                "model": getattr(final, "model", settings.llm_chat_model),
                "raw": final,
            }
    except ValueError:
        yield {"type": "retry_round"}
    except RateLimitError:
        yield {"type": "error", "code": "LLM_UNAVAILABLE", "message": "Assistant is busy", "retryable": True}
    except APIConnectionError:
        yield {
            "type": "error",
            "code": "LLM_UNAVAILABLE",
            "message": "Connection to model failed",
            "retryable": True,
        }
    except BadRequestError as exc:
        logger.error("claude_bad_request: %s", exc)
        yield {"type": "error", "code": "INTERNAL", "message": "Internal error", "retryable": False}
    except APIStatusError as exc:
        yield {
            "type": "error",
            "code": "LLM_UNAVAILABLE",
            "message": "LLM unavailable",
            "retryable": exc.status_code >= 500,
        }
    except APIError:
        yield {"type": "error", "code": "LLM_UNAVAILABLE", "message": "LLM unavailable", "retryable": True}
    except Exception:
        logger.exception("stream failure")
        yield {"type": "error", "code": "LLM_UNAVAILABLE", "message": "LLM unavailable", "retryable": True}


async def run_chat_loop(
    *,
    request: ChatRequest,
    user: UserContext,
    settings: Settings,
    store: ConversationStore,
    client: AsyncAnthropic,
    request_id: str,
    conversation: ConversationRecord,
    guard_verdict: str = "allow",
    app_state: Any = None,
    authorization: str | None = None,
) -> AsyncIterator[dict[str, str]]:
    """Full chat turn: meta → tokens/tools → done. CONTRACT wire shapes."""

    yield sse(
        "meta",
        MetaEvent(conversation_id=conversation.conversation_id, request_id=request_id),
    )

    if guard_verdict == "injection":
        yield sse(
            "error",
            ErrorEvent(
                code="BAD_REQUEST",
                message="Request rejected by safety filter",
                retryable=False,
            ),
        )
        yield sse("done", DoneEvent())
        return

    if guard_verdict == "off_topic":
        yield sse(
            "token",
            TokenEvent(
                delta=(
                    "I can help with shipping schedules, tracking, bookings, "
                    "documents and related portal tasks. What would you like to do?"
                )
            ),
        )
        yield sse("done", DoneEvent())
        return

    anthropic_tools = to_anthropic_tools(conversation.tool_names)
    system = build_system(user, mode=conversation.mode)

    if request.tool_results is not None:
        err = merge_browser_results(conversation, request.tool_results, settings)
        if err:
            yield sse(
                "error",
                ErrorEvent(
                    code=err,
                    message="tool_results call_ids do not match pending tool calls",
                    retryable=False,
                ),
            )
            yield sse("done", DoneEvent())
            return
        await store.save(conversation)
    elif request.message is not None:
        msg = request.message.strip()
        max_chars = settings.max_message_chars or settings.max_message_length
        if len(msg) > max_chars:
            yield sse(
                "error",
                ErrorEvent(
                    code="BAD_REQUEST",
                    message=f"message exceeds {max_chars} characters",
                    retryable=False,
                ),
            )
            yield sse("done", DoneEvent())
            return

        # Cancel pending browser tools so history stays valid
        if conversation.pending_tool_calls:
            merge_browser_results(
                conversation,
                [
                    ToolResult(
                        call_id=p.call_id,
                        ok=False,
                        error="CANCELLED",
                    )
                    for p in conversation.pending_tool_calls
                ],
                settings,
            )

        if conversation.user_turns >= settings.max_user_turns_per_conversation:
            yield sse(
                "error",
                ErrorEvent(
                    code="BAD_REQUEST",
                    message="Conversation is full. Start a new chat.",
                    retryable=False,
                ),
            )
            yield sse("done", DoneEvent())
            return

        conversation.messages.append(
            {"role": "user", "content": [{"type": "text", "text": msg}]}
        )
        conversation.messages.append(
            {"role": "system", "content": turn_context(request.client_context)}
        )
        conversation.user_turns += 1
        conversation.tool_rounds = 0
        await store.save(conversation)
    else:
        yield sse(
            "error",
            ErrorEvent(
                code="BAD_REQUEST",
                message="message or tool_results required",
                retryable=False,
            ),
        )
        yield sse("done", DoneEvent())
        return

    runner = _stream_runner

    # Server-side action context (None when the feature is off or the
    # repository was never attached, e.g. in lifespan-less tests).
    repository = getattr(app_state, "repository", None)
    action_ctx: ActionContext | None = None
    if settings.server_actions_enabled and repository is not None:
        action_ctx = ActionContext(
            repo=repository, user=user, customer=customer_for(user)
        )

    while True:
        if conversation.tool_rounds >= settings.max_tool_rounds:
            yield sse(
                "error",
                ErrorEvent(
                    code="TOOL_LIMIT",
                    message="Maximum tool rounds exceeded",
                    retryable=False,
                ),
            )
            yield sse("done", DoneEvent())
            return

        conversation.tool_rounds += 1
        await store.save(conversation)

        final_content: list[dict[str, Any]] | None = None
        stop_reason: str | None = None
        usage_obj: Any = None
        model_name = settings.llm_chat_model

        if runner is not None:
            stream_iter = runner(
                messages=conversation.messages,
                tools=anthropic_tools,
                system=system,
            )
        elif settings.llm_provider == "openai":
            from app.llm.openai_runner import openai_stream

            stream_iter = openai_stream(
                settings,
                messages=conversation.messages,
                tools=anthropic_tools,
                system=system,
            )
        else:
            stream_iter = _default_stream(
                client,
                settings,
                messages=conversation.messages,
                tools=anthropic_tools,
                system=system,
            )

        cites = CitationStream()
        async for event in stream_iter:
            etype = event.get("type")
            if etype == "token":
                delta = event.get("delta") or ""
                for part in cites.feed(delta):
                    if part[0] == "text" and part[1]:
                        yield sse("token", TokenEvent(delta=part[1]))
                    elif part[0] == "cite":
                        route, title = part[1], part[2]
                        marker = f"[[cite:{route}|{title}]]"
                        yield sse(
                            "citation",
                            CitationEvent(route=route, title=title, marker=marker),
                        )
            elif etype == "retry_round":
                final_content = None
                break
            elif etype == "error":
                yield sse(
                    "error",
                    ErrorEvent(
                        code=event.get("code") or "LLM_UNAVAILABLE",
                        message=event.get("message") or "LLM unavailable",
                        retryable=bool(event.get("retryable", True)),
                    ),
                )
                yield sse("done", DoneEvent())
                return
            elif etype == "final":
                final_content = event.get("content") or []
                stop_reason = event.get("stop_reason")
                usage_obj = event.get("usage")
                model_name = event.get("model") or model_name

        for part in cites.flush():
            if part[0] == "text" and part[1]:
                yield sse("token", TokenEvent(delta=part[1]))

        if final_content is None:
            # retry_round path: try again once more in the while loop
            continue

        if usage_obj is not None and app_state is not None:
            record_usage(app_state, conversation, model_name, stop_reason, usage_obj)

        # Append WHOLE assistant turn unchanged (thinking + text + tool_use + compaction)
        conversation.messages.append(
            {"role": "assistant", "content": final_content}
        )
        await store.save(conversation)

        if stop_reason == "refusal":
            yield sse(
                "error",
                ErrorEvent(
                    code="BAD_REQUEST",
                    message="I can't help with that request.",
                    retryable=False,
                ),
            )
            yield sse("done", DoneEvent())
            return

        if stop_reason == "pause_turn":
            continue

        tool_uses = [b for b in final_content if b.get("type") == "tool_use"]
        if not tool_uses:
            conversation.pending_assistant_id = None
            await store.save(conversation)
            yield sse("done", DoneEvent())
            return

        if stop_reason == "max_tokens":
            conversation.messages.append(
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": b["id"],
                            "is_error": True,
                            "content": "Input was truncated. Retry with fewer arguments.",
                        }
                        for b in tool_uses
                    ],
                }
            )
            await store.save(conversation)
            continue

        immediate: list[dict[str, Any]] = []
        browser: list[PendingToolCall] = []

        for block in tool_uses:
            call_id = block["id"]
            name = block["name"]
            arguments = block.get("input") or {}
            if isinstance(arguments, str):
                try:
                    arguments = json.loads(arguments)
                except json.JSONDecodeError:
                    arguments = {}

            spec = get_tool(name)
            if spec is None or name not in conversation.tool_names:
                immediate.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": call_id,
                        "is_error": True,
                        "content": "Unknown tool",
                    }
                )
                continue

            err = validate_tool_arguments(name, arguments)
            if err:
                immediate.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": call_id,
                        "is_error": True,
                        "content": json.dumps({"INVALID_INPUT": err}),
                    }
                )
                continue

            if name in SERVER_TOOL_NAMES or (spec and spec.kind == "server"):
                data = await run_server_tool(
                    name,
                    arguments,
                    app_state or type("S", (), {})(),
                    authorization=authorization,
                    mode=str(conversation.mode),
                )
                immediate.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": call_id,
                        "content": _truncate_json(data, settings.tool_result_max_bytes),
                    }
                )
                # Surface successful SQL tables as a UI card (not inventable by the model).
                if (
                    name == "run_sql_readonly"
                    and isinstance(data, dict)
                    and data.get("ok")
                    and isinstance(data.get("rows"), list)
                ):
                    yield sse(
                        "ui_action",
                        UiActionEvent(
                            call_id=f"{call_id}_table",
                            name="show_sql_result",
                            arguments={
                                "sql": data.get("sql") or arguments.get("sql"),
                                "explanation": data.get("explanation")
                                or arguments.get("explanation"),
                                "columns": data.get("columns") or [],
                                "rows": data.get("rows") or [],
                                "row_count": data.get("row_count"),
                                "truncated": data.get("truncated"),
                            },
                        ),
                    )
            elif name in UI_ACTION_NAMES or (spec and spec.kind == "ui_action"):
                if name == "navigate":
                    route = str(arguments.get("route") or "")
                    cap = capability_for_route(route)
                    if not route_ok(route) or (cap and not user.can(cap)):
                        immediate.append(
                            {
                                "type": "tool_result",
                                "tool_use_id": call_id,
                                "is_error": True,
                                "content": "Route not allowed for this user",
                            }
                        )
                        continue
                yield sse(
                    "ui_action",
                    UiActionEvent(call_id=call_id, name=name, arguments=arguments),
                )
                immediate.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": call_id,
                        "content": json.dumps({"ok": True, "shown_to_user": True}),
                    }
                )
            elif action_ctx is not None and has_handler(name):
                # Runs in-process against the repository; the browser never
                # sees this tool. Every path returns a structured outcome.
                result = run_action(action_ctx, name, arguments)
                immediate.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": call_id,
                        "content": _truncate_json(
                            result.for_model(), settings.tool_result_max_bytes
                        ),
                        **({} if result.ok else {"is_error": False}),
                    }
                )
            else:
                browser.append(
                    PendingToolCall(
                        call_id=call_id,
                        name=name,
                        arguments=arguments,
                        kind="tool_call",
                    )
                )
                yield sse(
                    "tool_call",
                    ToolCallEvent(call_id=call_id, name=name, arguments=arguments),
                )

        if browser:
            conversation.pending_tool_calls = browser
            conversation.parked_results = immediate
            conversation.pending_assistant_id = request_id
            await store.save(conversation)
            yield sse(
                "done",
                DoneEvent(
                    awaiting_tools=True,
                    pending_call_ids=[p.call_id for p in browser],
                ),
            )
            return

        conversation.messages.append({"role": "user", "content": immediate})
        await store.save(conversation)

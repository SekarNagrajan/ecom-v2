# Modified by Sekar Nagarajan (2026-10-20 21:10)
"""OpenAI stream runner — temporary provider until the Claude key lands.

Yields the same neutral events as `loop._default_stream` ({token|final|error})
and keeps the STORED history in Anthropic block shape (text / tool_use /
tool_result), translating to OpenAI chat format only at send time. Switching
back to Claude is therefore just `LLM_PROVIDER=anthropic` — no history or
loop changes.
"""

from __future__ import annotations

import json
import logging
from collections.abc import AsyncIterator
from types import SimpleNamespace
from typing import Any

from openai import (
    APIConnectionError,
    APIError,
    APIStatusError,
    AsyncOpenAI,
    BadRequestError,
    RateLimitError,
)

from app.config import Settings

logger = logging.getLogger(__name__)

_client: AsyncOpenAI | None = None


def is_openai_endpoint(base_url: str) -> bool:
    """True when talking to api.openai.com (empty base_url means default)."""
    return not base_url.strip() or "api.openai.com" in base_url


def get_openai(settings: Settings) -> AsyncOpenAI:
    global _client
    if _client is None:
        kwargs: dict[str, Any] = {
            "api_key": settings.openai_api_key or None,
            # Point at any OpenAI-compatible provider (Groq, OpenRouter,
            # Ollama, …); empty falls back to api.openai.com.
            "base_url": settings.openai_base_url or None,
        }
        if settings.openai_base_url:
            # Local Ollama can idle many seconds between CPU tokens.
            kwargs["timeout"] = 600.0
        _client = AsyncOpenAI(**kwargs)
    return _client


def reset_openai() -> None:
    global _client
    _client = None


def _system_text(system: list[dict[str, Any]] | str) -> str:
    if isinstance(system, str):
        return system
    return "\n\n".join(
        str(b.get("text", "")) for b in system if isinstance(b, dict)
    ).strip()


def _content_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(
            str(b.get("text", ""))
            for b in content
            if isinstance(b, dict) and b.get("type") == "text"
        ).strip()
    return ""


def convert_messages(
    messages: list[dict[str, Any]], system: list[dict[str, Any]] | str
) -> list[dict[str, Any]]:
    """Anthropic-shaped stored history → OpenAI chat messages."""
    out: list[dict[str, Any]] = [{"role": "system", "content": _system_text(system)}]
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        if role == "system":
            text = _content_text(content)
            if text:
                out.append({"role": "system", "content": text})
            continue
        if role == "assistant":
            blocks = content if isinstance(content, list) else []
            text = _content_text(content)
            tool_calls = [
                {
                    "id": b["id"],
                    "type": "function",
                    "function": {
                        "name": b["name"],
                        "arguments": json.dumps(b.get("input") or {}),
                    },
                }
                for b in blocks
                if isinstance(b, dict) and b.get("type") == "tool_use"
            ]
            entry: dict[str, Any] = {"role": "assistant", "content": text or None}
            if tool_calls:
                entry["tool_calls"] = tool_calls
            if text or tool_calls:
                out.append(entry)
            continue
        if role == "user":
            blocks = content if isinstance(content, list) else []
            if not blocks and isinstance(content, str):
                out.append({"role": "user", "content": content})
                continue
            # tool results must directly follow the assistant tool_calls turn
            for b in blocks:
                if isinstance(b, dict) and b.get("type") == "tool_result":
                    body = b.get("content")
                    out.append(
                        {
                            "role": "tool",
                            "tool_call_id": b.get("tool_use_id", ""),
                            "content": body if isinstance(body, str) else json.dumps(body),
                        }
                    )
            text = _content_text(content)
            if text:
                out.append({"role": "user", "content": text})
    return out


def convert_tools(anthropic_tools: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "type": "function",
            "function": {
                "name": t["name"],
                "description": t.get("description", ""),
                "parameters": t.get("input_schema") or {"type": "object"},
            },
        }
        for t in anthropic_tools or []
    ]


def assemble_final(
    text: str,
    tool_calls: dict[int, dict[str, Any]],
    finish_reason: str | None,
    usage: Any,
    model: str,
) -> dict[str, Any]:
    """Build the neutral 'final' event with Anthropic-shaped content blocks."""
    content: list[dict[str, Any]] = []
    if text:
        content.append({"type": "text", "text": text})
    for idx in sorted(tool_calls):
        call = tool_calls[idx]
        try:
            args = json.loads(call.get("arguments") or "{}")
        except json.JSONDecodeError:
            args = {}
        content.append(
            {
                "type": "tool_use",
                "id": call.get("id") or f"call_{idx}",
                "name": call.get("name") or "",
                "input": args,
            }
        )
    if tool_calls:
        stop_reason = "tool_use"
    elif finish_reason == "length":
        stop_reason = "max_tokens"
    else:
        stop_reason = "end_turn"
    usage_ns = None
    if usage is not None:
        usage_ns = SimpleNamespace(
            input_tokens=getattr(usage, "prompt_tokens", 0),
            output_tokens=getattr(usage, "completion_tokens", 0),
            cache_read_input_tokens=getattr(
                getattr(usage, "prompt_tokens_details", None), "cached_tokens", 0
            )
            or 0,
            cache_creation_input_tokens=0,
        )
    return {
        "type": "final",
        "stop_reason": stop_reason,
        "content": content,
        "usage": usage_ns,
        "model": model,
    }


async def openai_stream(
    settings: Settings,
    *,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]],
    system: list[dict[str, Any]] | str,
) -> AsyncIterator[dict[str, Any]]:
    client = get_openai(settings)
    model = settings.openai_chat_model
    native = is_openai_endpoint(settings.openai_base_url)
    params: dict[str, Any] = {
        "model": model,
        "messages": convert_messages(messages, system),
        "stream": True,
    }
    if native:
        # OpenAI-only: newer token field + usage on the final stream chunk.
        params["max_completion_tokens"] = settings.llm_max_tokens
        params["stream_options"] = {"include_usage": True}
    else:
        # Ollama / LM Studio / Groq compat layers expect the classic field
        # and reject stream_options; usage then simply stays None.
        params["max_tokens"] = settings.llm_max_tokens
    oa_tools = convert_tools(tools)
    if oa_tools:
        params["tools"] = oa_tools
        params["tool_choice"] = "auto"

    text_parts: list[str] = []
    tool_calls: dict[int, dict[str, Any]] = {}
    finish_reason: str | None = None
    usage: Any = None
    try:
        stream = await client.chat.completions.create(**params)
        async for chunk in stream:
            if getattr(chunk, "usage", None) is not None:
                usage = chunk.usage
            choices = getattr(chunk, "choices", None) or []
            if not choices:
                continue
            choice = choices[0]
            if choice.finish_reason:
                finish_reason = choice.finish_reason
            delta = choice.delta
            if delta is None:
                continue
            if delta.content:
                text_parts.append(delta.content)
                yield {"type": "token", "delta": delta.content}
            for tc in delta.tool_calls or []:
                slot = tool_calls.setdefault(
                    tc.index, {"id": None, "name": None, "arguments": ""}
                )
                if tc.id:
                    slot["id"] = tc.id
                fn = tc.function
                if fn is not None:
                    if fn.name:
                        slot["name"] = fn.name
                    if fn.arguments:
                        slot["arguments"] += fn.arguments
        yield assemble_final("".join(text_parts), tool_calls, finish_reason, usage, model)
    except RateLimitError as exc:
        if "insufficient_quota" in str(exc) or "credit_balance_exhausted" in str(exc):
            yield {
                "type": "error",
                "code": "LLM_UNAVAILABLE",
                "message": "Model provider has no credits. Ask an administrator to top up the account.",
                "retryable": False,
            }
        else:
            yield {"type": "error", "code": "LLM_UNAVAILABLE", "message": "Assistant is busy", "retryable": True}
    except APIConnectionError:
        yield {"type": "error", "code": "LLM_UNAVAILABLE", "message": "Connection to model failed", "retryable": True}
    except BadRequestError as exc:
        logger.error("openai_bad_request: %s", exc)
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
        logger.exception("openai stream failure")
        yield {"type": "error", "code": "LLM_UNAVAILABLE", "message": "LLM unavailable", "retryable": True}


async def classify_openai(settings: Settings, system: str, message: str) -> str | None:
    """Guard classification via OpenAI; None on any failure (caller fails open)."""
    try:
        client = get_openai(settings)
        native = is_openai_endpoint(settings.openai_base_url)
        kwargs: dict[str, Any] = {
            "model": settings.openai_guard_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": message},
            ],
        }
        if native:
            kwargs["max_completion_tokens"] = 24
            kwargs["response_format"] = {"type": "json_object"}
        else:
            # Local servers may not honour response_format; allow room for a
            # short JSON object and parse leniently below.
            kwargs["max_tokens"] = 64
        resp = await client.chat.completions.create(**kwargs)
        raw = resp.choices[0].message.content or "{}"
        # Small local models often wrap JSON in prose or a code fence.
        start, end = raw.find("{"), raw.rfind("}")
        data = json.loads(raw[start : end + 1] if start != -1 and end > start else raw)
        verdict = data.get("verdict")
        return verdict if verdict in ("allow", "off_topic", "injection") else None
    except Exception as exc:
        logger.warning("openai guard fail-open: %s", type(exc).__name__)
        return None

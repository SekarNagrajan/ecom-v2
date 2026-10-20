# Modified by Sekar Nagarajan (2026-10-20 12:52)
from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

import pytest

from app.llm.loop import set_stream_runner
from app.tools.catalog import filter_tools, validate_tool_arguments


def _parse_sse(body: str) -> list[tuple[str, dict]]:
    events: list[tuple[str, dict]] = []
    event_name = None
    data_lines: list[str] = []
    for line in body.splitlines():
        if line.startswith("event:"):
            event_name = line.split(":", 1)[1].strip()
        elif line.startswith("data:"):
            data_lines.append(line.split(":", 1)[1].strip())
        elif line == "":
            if event_name and data_lines:
                payload = json.loads("\n".join(data_lines))
                events.append((event_name, payload))
            event_name = None
            data_lines = []
    if event_name and data_lines:
        events.append((event_name, json.loads("\n".join(data_lines))))
    return events


async def _fake_tokens_only(**kwargs: Any) -> AsyncIterator[dict[str, Any]]:
    yield {"type": "token", "delta": "Hello "}
    yield {"type": "token", "delta": "world"}
    yield {
        "type": "final",
        "stop_reason": "end_turn",
        "content": [{"type": "text", "text": "Hello world"}],
    }


async def test_chat_meta_tokens_done(client):
    set_stream_runner(_fake_tokens_only)
    resp = await client.post(
        "/v1/chat",
        json={
            "conversation_id": None,
            "message": "Hi",
            "tool_results": None,
            "client_context": {
                "route": "/app",
                "locale": "en",
                "capabilities": ["BKG"],
            },
            "tools": None,
        },
    )
    assert resp.status_code == 200
    events = _parse_sse(resp.text)
    names = [e[0] for e in events]
    assert names[0] == "meta"
    assert "token" in names
    assert names[-1] == "done"
    assert events[-1][1]["awaiting_tools"] is False
    tokens = "".join(e[1]["delta"] for e in events if e[0] == "token")
    assert tokens == "Hello world"


async def _fake_tool_call(**kwargs: Any) -> AsyncIterator[dict[str, Any]]:
    yield {
        "type": "final",
        "stop_reason": "tool_use",
        "content": [
            {
                "type": "tool_use",
                "id": "toolu_list1",
                "name": "list_bookings",
                "input": {"status": "open"},
            }
        ],
    }


async def test_chat_tool_call_awaiting(client):
    set_stream_runner(_fake_tool_call)
    resp = await client.post(
        "/v1/chat",
        json={
            "conversation_id": None,
            "message": "Show bookings",
            "client_context": {"route": "/app/booking", "locale": "en", "capabilities": ["BKG"]},
        },
    )
    events = _parse_sse(resp.text)
    names = [e[0] for e in events]
    assert "tool_call" in names
    assert names[-1] == "done"
    done = events[-1][1]
    assert done["awaiting_tools"] is True
    assert "toolu_list1" in done["pending_call_ids"]


async def _fake_ui_then_text(call_count: list[int]):
    async def _runner(**kwargs: Any) -> AsyncIterator[dict[str, Any]]:
        call_count[0] += 1
        if call_count[0] == 1:
            yield {
                "type": "final",
                "stop_reason": "tool_use",
                "content": [
                    {
                        "type": "tool_use",
                        "id": "toolu_nav1",
                        "name": "navigate",
                        "input": {"route": "/app/booking/new"},
                    }
                ],
            }
        else:
            yield {"type": "token", "delta": "Opened booking."}
            yield {
                "type": "final",
                "stop_reason": "end_turn",
                "content": [{"type": "text", "text": "Opened booking."}],
            }

    return _runner


async def test_ui_action_continues_same_turn(client):
    call_count = [0]
    set_stream_runner(await _fake_ui_then_text(call_count))
    resp = await client.post(
        "/v1/chat",
        json={
            "message": "Open new booking",
            "client_context": {"route": "/app", "locale": "en", "capabilities": ["BKG"]},
        },
    )
    events = _parse_sse(resp.text)
    names = [e[0] for e in events]
    assert "ui_action" in names
    assert "token" in names
    assert events[-1][1]["awaiting_tools"] is False
    assert call_count[0] == 2


def test_capability_filtering():
    specs = filter_tools(["BKG"], None)
    names = {s.name for s in specs}
    assert "list_bookings" in names
    assert "get_booking" in names
    assert "list_shipping_instructions" not in names
    assert "search_schedules" in names  # ungated

    specs2 = filter_tools([], ["list_bookings", "search_schedules"])
    names2 = {s.name for s in specs2}
    # Browser allowlist + public server/ui_action tools (guide, navigate)
    assert "search_schedules" in names2
    assert "list_bookings" not in names2  # gated BKG, no capability
    assert "search_portal_guide" in names2
    assert "navigate" in names2


def test_invalid_args():
    err = validate_tool_arguments("get_booking", {})
    assert err is not None
    err2 = validate_tool_arguments("navigate", {"route": "/evil"})
    assert err2 is not None
    assert validate_tool_arguments("navigate", {"route": "/app/booking"}) is None


async def _fake_invalid_then_text(call_count: list[int]):
    async def _runner(**kwargs: Any) -> AsyncIterator[dict[str, Any]]:
        call_count[0] += 1
        if call_count[0] == 1:
            yield {
                "type": "final",
                "stop_reason": "tool_use",
                "content": [
                    {
                        "type": "tool_use",
                        "id": "toolu_bad",
                        "name": "get_booking",
                        "input": {},
                    }
                ],
            }
        else:
            yield {"type": "token", "delta": "Need a booking id."}
            yield {
                "type": "final",
                "stop_reason": "end_turn",
                "content": [{"type": "text", "text": "Need a booking id."}],
            }

    return _runner


async def test_invalid_args_re_calls_claude(client):
    call_count = [0]
    set_stream_runner(await _fake_invalid_then_text(call_count))
    resp = await client.post(
        "/v1/chat",
        json={
            "message": "Get booking",
            "client_context": {"route": "/app", "locale": "en", "capabilities": ["BKG"]},
        },
    )
    events = _parse_sse(resp.text)
    assert "tool_call" not in [e[0] for e in events]
    assert call_count[0] == 2
    assert events[-1][0] == "done"


async def test_unknown_call_id_on_resume(client):
    set_stream_runner(_fake_tool_call)
    first = await client.post(
        "/v1/chat",
        json={
            "message": "bookings",
            "client_context": {"route": "/app", "locale": "en", "capabilities": ["BKG"]},
        },
    )
    events = _parse_sse(first.text)
    conv_id = events[0][1]["conversation_id"]

    # Resume with wrong call_id
    set_stream_runner(_fake_tokens_only)
    second = await client.post(
        "/v1/chat",
        json={
            "conversation_id": conv_id,
            "message": None,
            "tool_results": [
                {"call_id": "toolu_WRONG", "ok": True, "content": {}, "error": None}
            ],
            "client_context": {"route": "/app", "locale": "en", "capabilities": ["BKG"]},
        },
    )
    events2 = _parse_sse(second.text)
    assert any(e[0] == "error" and e[1]["code"] == "BAD_REQUEST" for e in events2)
    assert events2[-1][0] == "done"


async def _always_tool(**kwargs: Any) -> AsyncIterator[dict[str, Any]]:
    yield {
        "type": "final",
        "stop_reason": "tool_use",
        "content": [
            {
                "type": "tool_use",
                "id": "toolu_x",
                "name": "get_hotline",
                "input": {},
            }
        ],
    }


async def test_tool_round_limit(client, app):
    app.state.settings.max_tool_rounds = 2
    # ui_action-style continue: use invalid+retry path with always-invalid? 
    # Better: navigate ui_action loops forever until TOOL_LIMIT
    call_n = [0]

    async def forever_nav(**kwargs: Any) -> AsyncIterator[dict[str, Any]]:
        call_n[0] += 1
        yield {
            "type": "final",
            "stop_reason": "tool_use",
            "content": [
                {
                    "type": "tool_use",
                    "id": f"toolu_n{call_n[0]}",
                    "name": "navigate",
                    "input": {"route": "/app/dashboard"},
                }
            ],
        }

    set_stream_runner(forever_nav)
    resp = await client.post(
        "/v1/chat",
        json={
            "message": "go",
            "client_context": {"route": "/app", "locale": "en", "capabilities": []},
        },
    )
    events = _parse_sse(resp.text)
    assert any(e[0] == "error" and e[1]["code"] == "TOOL_LIMIT" for e in events)
    assert events[-1][0] == "done"


async def test_feedback_and_conversation(client):
    set_stream_runner(_fake_tokens_only)
    chat = await client.post(
        "/v1/chat",
        json={
            "message": "Hi",
            "client_context": {"route": "/app", "locale": "en", "capabilities": []},
        },
    )
    conv_id = _parse_sse(chat.text)[0][1]["conversation_id"]
    got = await client.get(f"/v1/conversations/{conv_id}")
    assert got.status_code == 200
    assert got.json()["conversation_id"] == conv_id

    fb = await client.post(
        "/v1/feedback",
        json={"conversation_id": conv_id, "rating": "up", "comment": "nice"},
    )
    assert fb.status_code == 204

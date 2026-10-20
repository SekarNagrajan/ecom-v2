# Created by Sekar Nagarajan (2026-10-21 02:50)
"""Server-side actions end-to-end through POST /v1/chat.

Proves the whole Phase 1-3 stack is reachable by the model: a tool_use from
the LLM is executed in-process against the repository and its structured
outcome is fed back, with no browser round-trip (no `tool_call` event).
"""

from __future__ import annotations

import json

import pytest

from app.llm.loop import set_stream_runner


def _runner(tool_name: str, args: dict):
    """Fake model: ask for one tool, then answer once the result returns."""
    calls = {"n": 0}

    async def run(*, messages, tools, system):
        calls["n"] += 1
        if calls["n"] == 1:
            yield {
                "type": "final",
                "stop_reason": "tool_use",
                "content": [
                    {
                        "type": "tool_use",
                        "id": "call_1",
                        "name": tool_name,
                        "input": args,
                    }
                ],
                "usage": None,
                "model": "fake",
            }
        else:
            yield {"type": "token", "delta": "Done."}
            yield {
                "type": "final",
                "stop_reason": "end_turn",
                "content": [{"type": "text", "text": "Done."}],
                "usage": None,
                "model": "fake",
            }

    return run


def _events(body: str) -> list[tuple[str, dict]]:
    """Parse an SSE body.

    sse-starlette frames with CRLF, so blocks must be split on a blank line
    in either form — the same trap the portal's parser hit.
    """
    import re

    out: list[tuple[str, dict]] = []
    for block in re.split(r"\r?\n\r?\n", body):
        name = data = None
        for line in block.splitlines():
            if line.startswith("event:"):
                name = line[6:].strip()
            elif line.startswith("data:"):
                data = line[5:].strip()
        if name and data:
            out.append((name, json.loads(data)))
    return out


async def _chat(client, tools: list[str], mode: str = "assistant") -> list:
    res = await client.post(
        "/v1/chat",
        json={
            "conversation_id": None,
            "message": "look it up",
            "tool_results": None,
            "client_context": {
                "route": "/app/booking",
                "locale": "en",
                "tenant_code": "C1",
                "capabilities": ["BKG", "SI"],
            },
            "tools": tools,
            "mode": mode,
        },
    )
    assert res.status_code == 200
    return _events(res.text)


@pytest.fixture()
def server_actions(app):
    app.state.settings.server_actions_enabled = True
    yield app
    app.state.settings.server_actions_enabled = False
    set_stream_runner(None)


async def test_server_action_runs_in_process_without_a_browser_round_trip(
    client, server_actions
):
    set_stream_runner(_runner("list_bookings", {}))
    events = await _chat(client, ["list_bookings"])
    names = [n for n, _ in events]

    assert "tool_call" not in names, "server actions must not reach the browser"
    done = next(d for n, d in events if n == "done")
    assert done["awaiting_tools"] is False
    assert names[0] == "meta" and names[-1] == "done"


async def test_browser_tool_still_suspends_when_no_server_handler(
    client, server_actions
):
    """A tool without a handler keeps the existing browser protocol."""
    set_stream_runner(_runner("track_shipment", {"search_type": "container",
                                                 "search_value": "AASU1205200"}))
    events = await _chat(client, ["track_shipment"])
    names = [n for n, _ in events]
    assert "tool_call" in names
    done = next(d for n, d in events if n == "done")
    assert done["awaiting_tools"] is True


async def test_disabled_server_actions_fall_back_to_the_browser(client, app):
    app.state.settings.server_actions_enabled = False
    set_stream_runner(_runner("list_bookings", {}))
    events = await _chat(client, ["list_bookings"])
    assert "tool_call" in [n for n, _ in events]
    set_stream_runner(None)

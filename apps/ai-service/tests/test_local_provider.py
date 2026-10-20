# Created by Sekar Nagarajan (2026-10-20 21:25)
"""End-to-end test of the local-provider path against a fake Ollama server.

Spins up a real HTTP server that speaks the OpenAI-compatible streaming
shape Ollama / LM Studio emit, then drives the production `openai_stream`
against it over the network — proving streaming, tool-call accumulation and
the local-endpoint request quirks without needing the Ollama binary.
"""

from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

from app.config import Settings
from app.llm.openai_runner import openai_stream, reset_openai

# Captured request bodies, so the test can assert what we SENT.
RECEIVED: list[dict] = []


def _chunk(payload: dict) -> bytes:
    return f"data: {json.dumps(payload)}\n\n".encode()


class FakeOllamaHandler(BaseHTTPRequestHandler):
    def log_message(self, *args):  # silence test output
        pass

    def do_POST(self):  # noqa: N802 — BaseHTTPRequestHandler API
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length) or b"{}")
        RECEIVED.append(body)

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()

        base = {"id": "c1", "object": "chat.completion.chunk", "model": "local-3b"}
        wants_tool = bool(body.get("tools"))

        # A little visible text first, as local models usually emit.
        for piece in ("Looking ", "that ", "up. "):
            self.wfile.write(
                _chunk({**base, "choices": [{"index": 0, "delta": {"content": piece}}]})
            )

        if wants_tool:
            # Tool call arrives across several deltas, arguments split
            # mid-JSON — the accumulation path that breaks naive parsers.
            self.wfile.write(
                _chunk(
                    {
                        **base,
                        "choices": [
                            {
                                "index": 0,
                                "delta": {
                                    "tool_calls": [
                                        {
                                            "index": 0,
                                            "id": "call_local_1",
                                            "type": "function",
                                            "function": {
                                                "name": "search_schedules",
                                                "arguments": "",
                                            },
                                        }
                                    ]
                                },
                            }
                        ],
                    }
                )
            )
            for frag in ('{"origin":', ' "SGSIN",', ' "destination":', ' "NLRTM"}'):
                self.wfile.write(
                    _chunk(
                        {
                            **base,
                            "choices": [
                                {
                                    "index": 0,
                                    "delta": {
                                        "tool_calls": [
                                            {
                                                "index": 0,
                                                "function": {"arguments": frag},
                                            }
                                        ]
                                    },
                                }
                            ],
                        }
                    )
                )
            finish = "tool_calls"
        else:
            finish = "stop"

        self.wfile.write(
            _chunk({**base, "choices": [{"index": 0, "delta": {}, "finish_reason": finish}]})
        )
        self.wfile.write(b"data: [DONE]\n\n")
        self.wfile.flush()


@pytest.fixture()
def fake_ollama():
    RECEIVED.clear()
    server = ThreadingHTTPServer(("127.0.0.1", 0), FakeOllamaHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    port = server.server_address[1]
    reset_openai()
    yield f"http://127.0.0.1:{port}/v1"
    server.shutdown()
    server.server_close()
    reset_openai()


def _settings(base_url: str) -> Settings:
    return Settings(
        llm_provider="openai",
        openai_api_key="ollama",
        openai_base_url=base_url,
        openai_chat_model="local-3b",
        llm_max_tokens=512,
    )


async def _drain(settings, tools):
    messages = [{"role": "user", "content": [{"type": "text", "text": "sailings?"}]}]
    tokens, final = [], None
    async for event in openai_stream(
        settings, messages=messages, tools=tools, system="sys"
    ):
        if event["type"] == "token":
            tokens.append(event["delta"])
        elif event["type"] == "final":
            final = event
        elif event["type"] == "error":
            pytest.fail(f"unexpected error event: {event}")
    return "".join(tokens), final


async def test_local_endpoint_streams_text(fake_ollama):
    text, final = await _drain(_settings(fake_ollama), [])
    assert text == "Looking that up. "
    assert final["stop_reason"] == "end_turn"
    assert final["model"] == "local-3b"


async def test_local_endpoint_tool_call_accumulates_split_arguments(fake_ollama):
    tools = [
        {
            "name": "search_schedules",
            "description": "find sailings",
            "input_schema": {"type": "object", "properties": {}},
        }
    ]
    text, final = await _drain(_settings(fake_ollama), tools)
    assert text == "Looking that up. "
    assert final["stop_reason"] == "tool_use"

    calls = [b for b in final["content"] if b["type"] == "tool_use"]
    assert len(calls) == 1
    assert calls[0]["name"] == "search_schedules"
    assert calls[0]["id"] == "call_local_1"
    # Arguments were streamed in 4 fragments; they must reassemble exactly.
    assert calls[0]["input"] == {"origin": "SGSIN", "destination": "NLRTM"}


async def test_local_endpoint_omits_openai_only_fields(fake_ollama):
    """Local servers reject stream_options and expect max_tokens."""
    await _drain(_settings(fake_ollama), [])
    sent = RECEIVED[-1]
    assert "stream_options" not in sent
    assert "max_completion_tokens" not in sent
    assert sent["max_tokens"] == 512
    assert sent["stream"] is True


async def test_tools_are_converted_to_openai_function_shape(fake_ollama):
    tools = [
        {
            "name": "track_shipment",
            "description": "track it",
            "input_schema": {"type": "object", "properties": {"ref": {"type": "string"}}},
        }
    ]
    await _drain(_settings(fake_ollama), tools)
    sent = RECEIVED[-1]
    assert sent["tools"][0]["type"] == "function"
    assert sent["tools"][0]["function"]["name"] == "track_shipment"
    assert sent["tool_choice"] == "auto"

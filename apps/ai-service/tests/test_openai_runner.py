# Created by Sekar Nagarajan (2026-10-20 18:58)
"""Offline tests for the OpenAI provider adapter (no network)."""

from __future__ import annotations

from types import SimpleNamespace

from app.llm.openai_runner import assemble_final, convert_messages, convert_tools


def test_convert_messages_maps_blocks_to_openai_shapes():
    system = [{"type": "text", "text": "You are the portal assistant."}]
    history = [
        {"role": "user", "content": [{"type": "text", "text": "track SMLU1"}]},
        {"role": "system", "content": "turn context: route=/app/tracking"},
        {
            "role": "assistant",
            "content": [
                {"type": "text", "text": "Checking."},
                {"type": "tool_use", "id": "call_1", "name": "track_shipment",
                 "input": {"ref": "SMLU1"}},
            ],
        },
        {
            "role": "user",
            "content": [
                {"type": "tool_result", "tool_use_id": "call_1",
                 "content": '{"status": "In Transit"}'},
            ],
        },
    ]
    out = convert_messages(history, system)
    roles = [m["role"] for m in out]
    assert roles == ["system", "user", "system", "assistant", "tool"]
    assistant = out[3]
    assert assistant["tool_calls"][0]["function"]["name"] == "track_shipment"
    assert out[4]["tool_call_id"] == "call_1"


def test_convert_tools_wraps_input_schema():
    tools = [{"name": "navigate", "description": "go", "input_schema": {"type": "object"}}]
    out = convert_tools(tools)
    assert out[0]["type"] == "function"
    assert out[0]["function"]["parameters"] == {"type": "object"}


def test_assemble_final_tool_use_and_stop_reason():
    final = assemble_final(
        "On it.",
        {0: {"id": "call_9", "name": "search_schedules",
             "arguments": '{"origin": "SGSIN"}'}},
        "tool_calls",
        SimpleNamespace(prompt_tokens=10, completion_tokens=5,
                        prompt_tokens_details=None),
        "gpt-4o-mini",
    )
    assert final["stop_reason"] == "tool_use"
    kinds = [b["type"] for b in final["content"]]
    assert kinds == ["text", "tool_use"]
    assert final["content"][1]["input"] == {"origin": "SGSIN"}
    assert final["usage"].input_tokens == 10


def test_assemble_final_length_maps_to_max_tokens():
    final = assemble_final("partial", {}, "length", None, "gpt-4o-mini")
    assert final["stop_reason"] == "max_tokens"
    assert final["usage"] is None


def test_assemble_final_bad_tool_json_degrades_to_empty_args():
    final = assemble_final("", {0: {"id": "c", "name": "n", "arguments": "{oops"}},
                           "tool_calls", None, "m")
    assert final["content"][0]["input"] == {}


# Added by Sekar Nagarajan (2026-10-20 20:50)
def test_base_url_is_passed_to_the_client(monkeypatch):
    """Any OpenAI-compatible provider (Groq, OpenRouter, Ollama) is reachable."""
    from app.config import Settings
    from app.llm import openai_runner

    openai_runner.reset_openai()
    settings = Settings(
        openai_api_key="test-key",
        openai_base_url="https://api.groq.com/openai/v1",
    )
    client = openai_runner.get_openai(settings)
    assert str(client.base_url).rstrip("/") == "https://api.groq.com/openai/v1"
    openai_runner.reset_openai()


def test_no_base_url_defaults_to_openai(monkeypatch):
    from app.config import Settings
    from app.llm import openai_runner

    openai_runner.reset_openai()
    client = openai_runner.get_openai(Settings(openai_api_key="test-key"))
    assert "api.openai.com" in str(client.base_url)
    openai_runner.reset_openai()

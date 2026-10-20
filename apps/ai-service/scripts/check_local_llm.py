# Created by Sekar Nagarajan (2026-10-20 21:15)
"""Verify the configured local LLM can stream AND call tools.

Tool calling is a hard requirement for Assistant and Automation modes, and
small local models vary wildly in supporting it. Run after pointing .env at
Ollama / LM Studio:

    uv run python scripts/check_local_llm.py
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.config import Settings  # noqa: E402
from app.llm.openai_runner import openai_stream, reset_openai  # noqa: E402

TOOL = [
    {
        "name": "search_schedules",
        "description": "Find sailings between two ports.",
        "input_schema": {
            "type": "object",
            "properties": {
                "origin": {"type": "string", "description": "Origin port code"},
                "destination": {
                    "type": "string",
                    "description": "Destination port code",
                },
            },
            "required": ["origin", "destination"],
            "additionalProperties": False,
        },
    }
]


async def run_case(settings: Settings, label: str, prompt: str, tools: list) -> dict:
    print(f"\n── {label} ──")
    messages = [{"role": "user", "content": [{"type": "text", "text": prompt}]}]
    final: dict = {}
    streamed = 0
    async for event in openai_stream(
        settings,
        messages=messages,
        tools=tools,
        system="You are a shipping portal assistant. Use tools when they fit.",
    ):
        if event["type"] == "token":
            streamed += 1
            print(event["delta"], end="", flush=True)
        elif event["type"] == "error":
            print(f"\n  ERROR {event['code']}: {event['message']}")
            return {"ok": False}
        elif event["type"] == "final":
            final = event
    print(f"\n  [stream chunks: {streamed}, stop_reason: {final.get('stop_reason')}]")
    return {"ok": True, **final}


async def main() -> int:
    settings = Settings()
    print(f"provider : {settings.llm_provider}")
    print(f"base_url : {settings.openai_base_url or 'api.openai.com (default)'}")
    print(f"model    : {settings.openai_chat_model}")

    reset_openai()
    chat = await run_case(
        settings, "1. plain streaming", "Say hello in one short sentence.", []
    )
    if not chat.get("ok"):
        print("\nFAIL: the endpoint is not reachable or the model is unavailable.")
        return 1

    tool = await run_case(
        settings,
        "2. tool calling",
        "Find sailings from Singapore (SGSIN) to Rotterdam (NLRTM).",
        TOOL,
    )
    if not tool.get("ok"):
        return 1

    calls = [b for b in tool.get("content", []) if b.get("type") == "tool_use"]
    print("\n" + "=" * 56)
    if calls:
        print(f"PASS  tool calling works — model requested: {calls[0]['name']}")
        print(f"      arguments: {calls[0]['input']}")
        print("      Assistant, Automation, SQL and Documents modes are usable.")
        return 0
    print("WARN  the model streamed text but did NOT call the tool.")
    print("      Documents mode (RAG) will work; Assistant/Automation modes")
    print("      need a model with reliable function calling — try a larger one.")
    return 2


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

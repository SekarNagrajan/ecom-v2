# Modified by Sekar Nagarajan (2026-10-20 14:47)
from __future__ import annotations

import pytest
from fakeredis import FakeAsyncRedis

from app.config import Settings
from app.store.conversations import ConversationStore


@pytest.mark.asyncio
async def test_save_never_trims_messages():
    redis = FakeAsyncRedis(decode_responses=True)
    settings = Settings(
        env="development",
        auth_mode="trusted-dev",
        anthropic_api_key="x",
        max_user_turns_per_conversation=40,
    )
    store = ConversationStore(redis, settings)
    conv = await store.create("u1", tenant_id="T", capability_profile="BKG", tool_names=["list_bookings"])
    # Simulate many messages beyond any old "20 turn" trim
    for i in range(100):
        conv.messages.append({"role": "user", "content": f"m{i}"})
    await store.save(conv)
    loaded = await store.get(conv.conversation_id)
    assert loaded is not None
    assert len(loaded.messages) == 100
    assert loaded.messages[0]["content"] == "m0"
    await redis.aclose()

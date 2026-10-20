# Modified by Sekar Nagarajan (2026-10-21 02:05)
from __future__ import annotations

from pathlib import Path

import logging

import httpx
import pytest
import pytest_asyncio
from fakeredis import FakeAsyncRedis
from httpx import ASGITransport, AsyncClient

from app.config import Settings, get_settings
from app.knowledge.index import GuideIndex
from app.knowledge.retriever import HybridRetriever
from app.knowledge.vector import VectorIndex
from app.repositories.base import FixtureRepository
from app.llm.client import reset_anthropic
from app.llm.guard import set_guard_override
from app.llm.loop import set_stream_runner
from app.main import create_app

KNOWLEDGE = Path(__file__).resolve().parents[1] / "knowledge"


@pytest.fixture
def settings() -> Settings:
    get_settings.cache_clear()
    return Settings(
        env="development",
        auth_mode="trusted-dev",
        redis_url="redis://localhost:6379/0",
        anthropic_api_key="test-key",
        rate_limit_per_min=30,
        daily_msg_cap=200,
        max_tool_rounds=5,
        tool_result_max_bytes=8000,
        max_user_turns_per_conversation=40,
        llm_enable_fallback=False,
        llm_enable_compaction=False,
    )


@pytest_asyncio.fixture
async def redis():
    r = FakeAsyncRedis(decode_responses=True)
    yield r
    await r.aclose()


FIXTURES_ROOT = (
    Path(__file__).resolve().parents[2] / "ecom-portal/src/mocks/fixtures"
)
VECTOR_DB = Path(__file__).resolve().parents[1] / "var" / "vector-db"


def _test_vector_index() -> VectorIndex | None:
    """The persisted index when it has been built, else BM25-only.

    CI without a built index still runs; a developer with one gets the real
    fusion path under test.
    """
    if not VECTOR_DB.exists():
        return None
    index = VectorIndex(VECTOR_DB)
    return index if index.ready else None


@pytest_asyncio.fixture
async def app(settings: Settings, redis):
    set_guard_override("allow")
    set_stream_runner(None)
    reset_anthropic()
    get_settings.cache_clear()
    application = create_app(settings)
    # Bypass lifespan: wire dependencies directly for ASGITransport
    application.state.settings = settings
    application.state.redis = redis
    application.state.http = httpx.AsyncClient(timeout=10.0)
    # D2: the production path is the HybridRetriever, so tests must drive
    # it (vector layer included when the store exists) rather than a bare
    # BM25 index that never exercises fusion.
    application.state.guide = HybridRetriever(
        GuideIndex(KNOWLEDGE), _test_vector_index()
    )
    application.state.repository = FixtureRepository(FIXTURES_ROOT)
    application.state.log = logging.getLogger("test")
    yield application
    await application.state.http.aclose()
    set_guard_override(None)
    set_stream_runner(None)
    reset_anthropic()
    get_settings.cache_clear()


@pytest_asyncio.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

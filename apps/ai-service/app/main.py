# Modified by Sekar Nagarajan (2026-10-20 18:10)
"""FastAPI entrypoint with Redis + Anthropic lifespan."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI
from redis.asyncio import Redis

from app import __version__
from app.api import chat, conversations, feedback, health
from app.config import Settings, get_settings
from app.knowledge.index import GuideIndex
from app.knowledge.retriever import HybridRetriever
from app.knowledge.vector import VectorIndex
from app.llm.client import get_anthropic, reset_anthropic

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
logger = logging.getLogger("ai-service")

KNOWLEDGE_ROOT = Path(__file__).resolve().parent.parent / "knowledge"


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    docs_url = None if app_settings.env == "production" else "/docs"

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.settings = app_settings
        app.state.log = logger
        redis = getattr(app.state, "redis", None)
        owns_redis = redis is None
        if owns_redis:
            if app_settings.redis_url.startswith("memory://"):
                # Zero-infra dev mode: in-process store, nothing persists
                # across restarts. Never use in production.
                from fakeredis.aioredis import FakeRedis

                redis = FakeRedis(decode_responses=True)
                logger.warning("REDIS_URL=memory:// — using in-process FakeRedis")
            else:
                redis = Redis.from_url(app_settings.redis_url, decode_responses=True)
            app.state.redis = redis
        http_client = httpx.AsyncClient(timeout=10.0)
        app.state.http = http_client
        get_anthropic(app_settings)
        bm25 = GuideIndex(KNOWLEDGE_ROOT)
        vector = None
        if app_settings.rag_vector_enabled:
            db_path = Path(app_settings.vector_db_path)
            if not db_path.is_absolute():
                db_path = KNOWLEDGE_ROOT.parent / db_path
            candidate = VectorIndex(db_path)
            vector = candidate if candidate.ready else None
        app.state.guide = HybridRetriever(bm25, vector)
        logger.info(
            "ai-service started version=%s env=%s auth_mode=%s model=%s "
            "guide_chunks=%s vector=%s",
            __version__,
            app_settings.env,
            app_settings.auth_mode,
            app_settings.llm_chat_model,
            len(app.state.guide.chunks),
            "on" if app.state.guide.vector_ready else "off",
        )
        try:
            yield
        finally:
            await http_client.aclose()
            if owns_redis:
                await redis.aclose()
            reset_anthropic()

    application = FastAPI(
        title="E-com AI Assistant",
        version=__version__,
        lifespan=lifespan,
        docs_url=docs_url,
    )
    application.include_router(health.router)
    application.include_router(chat.router)
    application.include_router(conversations.router)
    application.include_router(feedback.router)
    return application


app = create_app()

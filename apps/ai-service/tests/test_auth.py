# Modified by Sekar Nagarajan (2026-10-20 12:52)
from __future__ import annotations

import httpx
import pytest
import respx
from fakeredis import FakeAsyncRedis
from httpx import ASGITransport, AsyncClient, Response

from app.config import Settings, get_settings
from app.llm.guard import set_guard_override
from app.llm.loop import set_stream_runner
from app.main import create_app


async def _fake_ok(**kwargs):
    yield {"type": "token", "delta": "ok"}
    yield {
        "type": "final",
        "stop_reason": "end_turn",
        "content": [{"type": "text", "text": "ok"}],
    }


async def _make_client(settings: Settings, redis: FakeAsyncRedis) -> tuple:
    from pathlib import Path

    from app.knowledge.index import GuideIndex

    app = create_app(settings)
    app.state.settings = settings
    app.state.redis = redis
    app.state.http = httpx.AsyncClient(timeout=10.0)
    app.state.guide = GuideIndex(Path(__file__).resolve().parents[1] / "knowledge")
    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")
    return app, client


@pytest.mark.asyncio
async def test_trusted_dev_without_header():
    get_settings.cache_clear()
    settings = Settings(env="development", auth_mode="trusted-dev", anthropic_api_key="x")
    redis = FakeAsyncRedis(decode_responses=True)
    set_guard_override("allow")
    set_stream_runner(_fake_ok)
    _app, client = await _make_client(settings, redis)
    async with client:
        resp = await client.post(
            "/v1/chat",
            json={
                "message": "hi",
                "client_context": {"route": "/app", "locale": "en", "capabilities": []},
            },
        )
        assert resp.status_code == 200
        assert "event: meta" in resp.text
    await _app.state.http.aclose()
    set_guard_override(None)
    set_stream_runner(None)
    await redis.aclose()
    get_settings.cache_clear()


@pytest.mark.asyncio
@respx.mock
async def test_backend_introspect_success():
    get_settings.cache_clear()
    settings = Settings(
        env="development",
        auth_mode="backend-introspect",
        backend_base_url="https://backend.test",
        anthropic_api_key="x",
    )
    redis = FakeAsyncRedis(decode_responses=True)
    set_guard_override("allow")
    set_stream_runner(_fake_ok)

    respx.get("https://backend.test/api/auth/me").mock(
        return_value=Response(
            200,
            json={
                "id": "u-99",
                "tenantCode": "ACME",
                "capabilities": ["BKG"],
                "email": "a@example.com",
            },
        )
    )

    _app, client = await _make_client(settings, redis)
    async with client:
        denied = await client.post(
            "/v1/chat",
            json={
                "message": "hi",
                "client_context": {"route": "/app", "locale": "en", "capabilities": []},
            },
        )
        assert denied.status_code == 401

        ok = await client.post(
            "/v1/chat",
            headers={"Authorization": "Bearer secret-token"},
            json={
                "message": "hi",
                "client_context": {"route": "/app", "locale": "en", "capabilities": []},
            },
        )
        assert ok.status_code == 200
        assert "event: meta" in ok.text

        ok2 = await client.post(
            "/v1/chat",
            headers={"Authorization": "Bearer secret-token"},
            json={
                "message": "again",
                "client_context": {"route": "/app", "locale": "en", "capabilities": []},
            },
        )
        assert ok2.status_code == 200

    await _app.state.http.aclose()
    set_guard_override(None)
    set_stream_runner(None)
    await redis.aclose()
    get_settings.cache_clear()


@pytest.mark.asyncio
@respx.mock
async def test_backend_introspect_unauthorized():
    get_settings.cache_clear()
    settings = Settings(
        env="development",
        auth_mode="backend-introspect",
        backend_base_url="https://backend.test",
        anthropic_api_key="x",
    )
    redis = FakeAsyncRedis(decode_responses=True)

    respx.get("https://backend.test/api/auth/me").mock(return_value=Response(401))

    _app, client = await _make_client(settings, redis)
    async with client:
        resp = await client.post(
            "/v1/chat",
            headers={"Authorization": "Bearer bad"},
            json={
                "message": "hi",
                "client_context": {"route": "/app", "locale": "en", "capabilities": []},
            },
        )
        assert resp.status_code == 401

    await _app.state.http.aclose()
    await redis.aclose()
    get_settings.cache_clear()


def test_production_rejects_trusted_dev():
    get_settings.cache_clear()
    with pytest.raises(Exception):
        Settings(env="production", auth_mode="trusted-dev")
    get_settings.cache_clear()


# Added by Sekar Nagarajan (2026-10-20 19:15)
async def test_trusted_dev_falls_back_when_introspection_store_is_down():
    """A Bearer header + unreachable Redis must yield the dev user, not a 500."""

    class BrokenRedis:
        def __getattr__(self, name):
            async def boom(*args, **kwargs):
                raise ConnectionError("redis down")

            return boom

    from app.auth.context import resolve_user

    class S:  # minimal request stand-in
        pass

    from app.config import Settings

    settings = Settings(auth_mode="trusted-dev")
    app_state = S()
    app_state.settings = settings
    app_state.redis = BrokenRedis()
    app_state.http = None
    request = S()
    request.app = S()
    request.app.state = app_state

    user = await resolve_user(request, authorization="Bearer whatever")
    assert user.user_id == settings.dev_user_id
    assert user.authenticated

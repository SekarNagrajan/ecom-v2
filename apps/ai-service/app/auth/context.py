# Modified by Sekar Nagarajan (2026-10-20 19:15)
"""Resolve the calling user for trusted-dev vs backend-introspect."""

from __future__ import annotations

import logging
from typing import assert_never

import httpx
from fastapi import Header, HTTPException, Request
from redis.asyncio import Redis

from app.auth.introspect import introspect_token
from app.config import Settings, get_settings
from app.models.chat import ClientContext, UserContext

logger = logging.getLogger(__name__)


def user_from_client_context(
    ctx: ClientContext,
    *,
    fallback: UserContext,
) -> UserContext:
    """Merge trusted-dev client_context.user / capabilities into the resolved user."""
    if ctx.user is not None:
        return UserContext(
            user_id=ctx.user.id,
            role=ctx.user.role,
            capabilities=list(ctx.user.capabilities or ctx.capabilities),
            tenant_code=ctx.tenant_code or fallback.tenant_code,
            authenticated=True,
        )
    if ctx.capabilities:
        return fallback.model_copy(
            update={
                "capabilities": list(ctx.capabilities),
                "tenant_code": ctx.tenant_code or fallback.tenant_code,
            }
        )
    if ctx.tenant_code:
        return fallback.model_copy(update={"tenant_code": ctx.tenant_code})
    return fallback


async def resolve_user(
    request: Request,
    authorization: str | None = Header(default=None),
) -> UserContext:
    settings: Settings = getattr(request.app.state, "settings", None) or get_settings()
    redis: Redis = request.app.state.redis
    http_client: httpx.AsyncClient | None = getattr(request.app.state, "http", None)

    mode = settings.auth_mode
    if mode == "trusted-dev":
        if authorization:
            # Best effort only: in trusted-dev an unreachable Redis or auth
            # backend must fall back to the dev user, never 500.
            try:
                user = await introspect_token(
                    redis, settings, authorization, http_client
                )
                if user:
                    return user
            except Exception as exc:
                logger.warning(
                    "trusted-dev introspection skipped (%s) — using dev user",
                    type(exc).__name__,
                )
        return UserContext(
            user_id=settings.dev_user_id,
            tenant_code=settings.dev_tenant_code,
            capabilities=settings.parsed_dev_capabilities(),
            authenticated=True,
        )

    if mode == "backend-introspect":
        if not authorization:
            raise HTTPException(status_code=401, detail="UNAUTHORIZED")
        try:
            user = await introspect_token(
                redis, settings, authorization, http_client
            )
        except HTTPException:
            raise
        except Exception as exc:
            logger.error("auth introspection unavailable: %s", type(exc).__name__)
            raise HTTPException(
                status_code=503, detail="AUTH_BACKEND_UNAVAILABLE"
            ) from exc
        if not user:
            raise HTTPException(status_code=401, detail="UNAUTHORIZED")
        return user

    assert_never(mode)

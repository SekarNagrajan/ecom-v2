# Modified by Sekar Nagarajan (2026-10-20 14:47)
"""Backend token introspection via GET /api/auth/me."""

from __future__ import annotations

import hashlib
import logging
from typing import Any

import httpx
from redis.asyncio import Redis

from app.config import Settings
from app.models.chat import UserContext

logger = logging.getLogger(__name__)


def _token_cache_key(token: str) -> str:
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return f"auth:{digest}"


def _parse_me_payload(data: dict[str, Any]) -> UserContext:
    # ApiResponse envelope {status, data} or bare profile / {user: ...}
    if isinstance(data.get("data"), dict):
        p = data["data"]
    elif isinstance(data.get("user"), dict):
        p = data["user"]
    else:
        p = data
    caps = p.get("capabilities") or data.get("capabilities") or []
    if not isinstance(caps, list):
        caps = []
    return UserContext(
        user_id=str(p.get("id") or p.get("userId") or p.get("user_id") or "unknown"),
        role=str(p.get("role") or "CUSTOMER"),
        tenant_code=p.get("tenantId") or p.get("tenantCode") or p.get("tenant_code"),
        capabilities=[str(c) for c in caps],
        email=p.get("email"),
        display_name=p.get("displayName") or p.get("display_name") or p.get("name"),
        is_session_admin=bool(p.get("isSessionAdmin")),
        is_tenant_admin=bool(p.get("isTenantAdmin")),
        is_impersonating=bool(p.get("isImpersonating")),
        authenticated=True,
    )


async def introspect_token(
    redis: Redis,
    settings: Settings,
    authorization: str,
    http_client: httpx.AsyncClient | None = None,
) -> UserContext | None:
    """Validate Bearer token against backend /api/auth/me. Never logs the token."""
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return None

    cache_key = _token_cache_key(token)
    cached = await redis.get(cache_key)
    if cached:
        try:
            return UserContext.model_validate_json(cached)
        except Exception:
            logger.warning("auth cache decode failed; re-introspecting")

    url = f"{settings.backend_base_url.rstrip('/')}/api/auth/me"
    owns_client = http_client is None
    client = http_client or httpx.AsyncClient(timeout=10.0)
    try:
        resp = await client.get(url, headers={"Authorization": f"Bearer {token}"})
        if resp.status_code in (401, 403):
            return None
        resp.raise_for_status()
        payload = resp.json()
        user = _parse_me_payload(payload if isinstance(payload, dict) else {})
        await redis.set(
            cache_key,
            user.model_dump_json(),
            ex=settings.auth_cache_ttl_seconds,
        )
        return user
    except httpx.HTTPError as exc:
        logger.warning("introspect failed: %s", type(exc).__name__)
        return None
    finally:
        if owns_client:
            await client.aclose()

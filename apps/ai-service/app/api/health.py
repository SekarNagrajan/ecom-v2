# Modified by Sekar Nagarajan (2026-10-20 14:47)
"""Liveness and readiness probes."""

from __future__ import annotations

from fastapi import APIRouter, Request, Response

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthz() -> dict[str, bool]:
    return {"ok": True}


@router.get("/readyz")
async def readyz(request: Request, response: Response) -> dict[str, object]:
    redis = request.app.state.redis
    try:
        pong = await redis.ping()
        if not pong:
            response.status_code = 503
            return {"ok": False, "reason": "redis"}
    except Exception:
        response.status_code = 503
        return {"ok": False, "reason": "redis"}

    guide = getattr(request.app.state, "guide", None)
    if guide is not None and not getattr(guide, "ready", True) and not getattr(
        guide, "chunks", None
    ):
        # Empty corpus is OK in early bootstrap; only fail if index object missing later
        pass
    return {"ok": True}

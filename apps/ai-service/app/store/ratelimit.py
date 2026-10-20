# Modified by Sekar Nagarajan (2026-10-20 12:52)
"""Per-user rate limits via Redis INCR."""

from __future__ import annotations

import time
from datetime import datetime, timezone

from redis.asyncio import Redis

from app.config import Settings


class RateLimitResult:
    __slots__ = ("allowed", "reason")

    def __init__(self, allowed: bool, reason: str | None = None) -> None:
        self.allowed = allowed
        self.reason = reason


async def check_rate_limit(
    redis: Redis,
    settings: Settings,
    user_id: str,
) -> RateLimitResult:
    """INCR rl:{user_id}:{epoch_minute}; also enforce daily message cap."""
    now = time.time()
    epoch_minute = int(now // 60)
    minute_key = f"rl:{user_id}:{epoch_minute}"
    count = await redis.incr(minute_key)
    if count == 1:
        await redis.expire(minute_key, 120)
    if count > settings.rate_limit_per_min:
        return RateLimitResult(False, "per_minute")

    day = datetime.now(timezone.utc).strftime("%Y%m%d")
    day_key = f"rl:day:{user_id}:{day}"
    day_count = await redis.incr(day_key)
    if day_count == 1:
        await redis.expire(day_key, 86_400)
    if day_count > settings.daily_msg_cap:
        return RateLimitResult(False, "daily")

    return RateLimitResult(True)

# Modified by Sekar Nagarajan (2026-10-20 16:40)
"""System prompt layers: static (cached) + profile + per-turn context."""

from __future__ import annotations

from app.modes import AssistantMode, get_mode
from app.models.chat import ClientContext, UserContext

# Back-compat alias — prefer get_mode(mode).system
STATIC_SYSTEM = get_mode("assistant").system


def capability_profile(user: UserContext) -> str:
    """Stable key: conversations are bound to one tool set."""
    caps = sorted(user.capabilities or [])
    return ",".join(caps) if caps else "NONE"


def profile_block(user: UserContext) -> str:
    profile = capability_profile(user)
    caps = "all listed modules" if profile != "NONE" else "none"
    if profile and profile != "NONE":
        caps = profile.replace(",", ", ")
    tenant = user.tenant_code or "unknown"
    return (
        f"The user is a signed-in portal user of tenant {tenant}. "
        f"Module access: {caps}."
    )


def turn_context(ctx: ClientContext) -> str:
    lang = ctx.locale or "en"
    parts = [f"Turn context: the user is on screen {ctx.route}; portal language {lang}."]
    if ctx.selected is not None:
        parts.append(f"Selected {ctx.selected.type}: {ctx.selected.id}.")
    return " ".join(parts)


def build_system(
    user: UserContext,
    mode: AssistantMode | str | None = "assistant",
) -> list[dict]:
    """Top-level system blocks. Tools + these blocks form the cache prefix."""
    mode_cfg = get_mode(mode)
    return [
        {"type": "text", "text": mode_cfg.system},
        {
            "type": "text",
            "text": profile_block(user),
            "cache_control": {"type": "ephemeral"},
        },
    ]


def build_system_prompt(
    user: UserContext,
    context: ClientContext,
    mode: AssistantMode | str | None = "assistant",
) -> str:
    return (
        get_mode(mode).system
        + "\n\n"
        + profile_block(user)
        + "\n\n"
        + turn_context(context)
    )

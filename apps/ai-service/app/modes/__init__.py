# Modified by Sekar Nagarajan (2026-10-21 01:40)
"""Assistant mode registry: prompts + tool allowlists (Phase 1 shell)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from app.prompts import load

AssistantMode = Literal["assistant", "automation", "sql", "docs"]

ASSISTANT_MODES: tuple[AssistantMode, ...] = (
    "assistant",
    "automation",
    "sql",
    "docs",
)


@dataclass(frozen=True)
class ModeConfig:
    id: AssistantMode
    system: str
    # None = all capability-eligible tools; frozenset = intersect with catalog.
    tool_allowlist: frozenset[str] | None


_ASSISTANT_SYSTEM = load("assistant")

_AUTOMATION_SYSTEM = load("automation")

_SQL_SYSTEM = load("sql")

_DOCS_SYSTEM = load("docs")

_AUTOMATION_TOOLS = frozenset(
    {
        "search_schedules",
        "track_shipment",
        "get_rates",
        "list_bookings",
        "get_booking",
        "search_portal_guide",
        "prefill_booking",
        "propose_booking_submit",
        "navigate",
    }
)

_SQL_TOOLS = frozenset(
    {
        "search_portal_guide",
        "describe_schema",
        "run_sql_readonly",
        "navigate",
    }
)

_DOCS_TOOLS = frozenset(
    {
        "search_portal_guide",
        "navigate",
        "get_hotline",
    }
)

MODE_CONFIG: dict[AssistantMode, ModeConfig] = {
    "assistant": ModeConfig(
        id="assistant",
        system=_ASSISTANT_SYSTEM,
        tool_allowlist=None,
    ),
    "automation": ModeConfig(
        id="automation",
        system=_AUTOMATION_SYSTEM,
        tool_allowlist=_AUTOMATION_TOOLS,
    ),
    "sql": ModeConfig(
        id="sql",
        system=_SQL_SYSTEM,
        tool_allowlist=_SQL_TOOLS,
    ),
    "docs": ModeConfig(
        id="docs",
        system=_DOCS_SYSTEM,
        tool_allowlist=_DOCS_TOOLS,
    ),
}


def parse_mode(value: str | None) -> AssistantMode:
    if value in ASSISTANT_MODES:
        return value  # type: ignore[return-value]
    return "assistant"


def get_mode(mode: AssistantMode | str | None) -> ModeConfig:
    if isinstance(mode, str) or mode is None:
        return MODE_CONFIG[parse_mode(mode)]
    return MODE_CONFIG[mode]

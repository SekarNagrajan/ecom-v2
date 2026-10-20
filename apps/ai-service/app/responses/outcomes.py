# Created by Sekar Nagarajan (2026-10-21 00:05)
"""Constructors for every outcome — handlers call these, never ActionResult."""

from __future__ import annotations

from typing import Any

from app.responses.schema import ActionResult, Citation, Outcome


def _cites(citations: list[tuple[str, str]] | None) -> list[Citation]:
    return [Citation(route=r, title=t) for r, t in (citations or [])]


def success(
    action: str,
    *,
    data: dict[str, Any],
    label: str,
    record_id: str | None = None,
    count: int | None = None,
    sampled: bool = False,
    citations: list[tuple[str, str]] | None = None,
    meta: dict[str, Any] | None = None,
) -> ActionResult:
    if count is not None:
        key = "found.list.sampled" if sampled else "found.list"
        if count == 0:
            key = "found.list.empty"
        args: dict[str, Any] = {"count": count, "label": label}
    else:
        key, args = "found.record", {"label": label, "id": record_id or ""}
    return ActionResult(
        action=action,
        outcome=Outcome.SUCCESS,
        message_key=key,
        message_args=args,
        data=data,
        citations=_cites(citations),
        meta={**(meta or {}), **({"sampled": True} if sampled else {})},
    )


def not_found(
    action: str, *, label: str, record_id: str,
    citations: list[tuple[str, str]] | None = None,
) -> ActionResult:
    return ActionResult(
        action=action,
        outcome=Outcome.NOT_FOUND,
        message_key="not_found.record",
        message_args={"label": label, "id": record_id},
        citations=_cites(citations),
    )


def not_allowed(
    action: str, *, label: str, capability: str | None = None, owner: bool = False
) -> ActionResult:
    if owner:
        return ActionResult(
            action=action,
            outcome=Outcome.NOT_ALLOWED,
            message_key="not_allowed.owner",
            message_args={"label": label},
        )
    return ActionResult(
        action=action,
        outcome=Outcome.NOT_ALLOWED,
        message_key="not_allowed.capability",
        message_args={"label": label, "capability": capability or "required"},
    )


def missing_info(action: str, *, slots: list[str]) -> ActionResult:
    return ActionResult(
        action=action,
        outcome=Outcome.MISSING_INFO,
        message_key="missing_info.slots",
        message_args={"slots": ", ".join(slots)},
        missing_slots=list(slots),
    )


def wrong_state(
    action: str, *, message_key: str, args: dict[str, Any],
    meta: dict[str, Any] | None = None,
) -> ActionResult:
    return ActionResult(
        action=action,
        outcome=Outcome.WRONG_STATE,
        message_key=message_key,
        message_args=args,
        meta=meta or {},
    )


def error(action: str, *, label: str, data_source: bool = False) -> ActionResult:
    return ActionResult(
        action=action,
        outcome=Outcome.ERROR,
        message_key="error.data_source" if data_source else "error.internal",
        message_args={"label": label},
    )

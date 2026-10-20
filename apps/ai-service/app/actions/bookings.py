# Created by Sekar Nagarajan (2026-10-21 00:35)
"""Booking lookups that know about the two number namespaces."""

from __future__ import annotations

from typing import Any

from app.actions.context import ActionContext, project_rows
from app.actions.records import FIELDS, _citation, get_record, list_records
from app.repositories.base import RepositoryError
from app.repositories.entities import ENTITIES
from app.repositories.links import (
    ChainUnavailable,
    Namespace,
    documents_for_booking,
    resolve_booking,
)
from app.responses import outcomes
from app.responses.schema import ActionResult


def get_booking(ctx: ActionContext, booking_id: Any) -> ActionResult:
    """Find a booking in either namespace and say which one matched."""
    action = "get_booking"
    spec = ENTITIES["portal_booking"]
    if not ctx.allowed_for(spec):
        return outcomes.not_allowed(action, label="bookings", capability="BKG")
    if not booking_id or not str(booking_id).strip():
        return outcomes.missing_info(action, slots=["booking number"])

    ref = str(booking_id).strip()
    try:
        match = resolve_booking(ctx.repo, ref, customer=ctx.customer)
    except RepositoryError as exc:
        return outcomes.error(
            action, label="booking",
            data_source=exc.code == "DATA_SOURCE_UNAVAILABLE",
        )
    if match is None:
        # Exists but belongs to someone else?
        for entity in ("portal_booking", "carrier_booking"):
            if ctx.customer is not None and ctx.repo.exists(entity, ref):
                return outcomes.not_allowed(action, label="booking", owner=True)
        return outcomes.not_found(
            action, label="booking", record_id=ref,
            citations=_citation("portal_booking"),
        )

    entity = match.namespace.value
    data: dict[str, Any] = {
        "record": match.row.project(FIELDS.get(entity, [])),
        "namespace": (
            "portal booking request" if match.namespace is Namespace.PORTAL
            else "carrier booking"
        ),
    }
    for label in ("containers", "parties", "legs"):
        kids = ctx.repo.children(entity, match.record_id, label)
        if kids:
            data[label] = project_rows(kids, list(kids[0]), limit=10)

    return outcomes.success(
        action, data=data, label="booking", record_id=match.record_id,
        citations=_citation("portal_booking"),
        meta={"entity": entity, "namespace": str(match.namespace)},
    )


def list_bookings(ctx: ActionContext, *, limit: int = 20) -> ActionResult:
    return list_records(ctx, "list_bookings", "portal_booking", limit=limit)


def documents_of_booking(
    ctx: ActionContext, action: str, entity: str, booking_id: Any, *, limit: int = 20
) -> ActionResult:
    """SI / VGM filed against a booking.

    A portal booking number cannot reach its documents in this data, so that
    path returns WRONG_STATE with the explanation — never an empty list that
    would read as "you have none".
    """
    spec = ENTITIES[entity]
    if not ctx.allowed_for(spec):
        return outcomes.not_allowed(
            action, label=f"{spec.label}s", capability=spec.capability
        )
    if not booking_id or not str(booking_id).strip():
        return outcomes.missing_info(action, slots=["booking number"])

    ref = str(booking_id).strip()
    try:
        match = resolve_booking(ctx.repo, ref, customer=ctx.customer)
        if match is None:
            return outcomes.not_found(action, label="booking", record_id=ref)

        result = documents_for_booking(
            ctx.repo, match, entity, customer=ctx.customer, limit=limit
        )
    except RepositoryError as exc:
        return outcomes.error(
            action, label=f"{spec.label}s",
            data_source=exc.code == "DATA_SOURCE_UNAVAILABLE",
        )

    if isinstance(result, ChainUnavailable):
        return outcomes.wrong_state(
            action,
            message_key="wrong_state.portal_booking_has_no_documents",
            args={"reason": result.reason},
            meta={"reference": result.reference, "namespace": str(result.namespace)},
        )

    return outcomes.success(
        action,
        data={"items": project_rows(result.rows, FIELDS.get(entity, []), limit)},
        label=f"{spec.label}s",
        count=result.total,
        sampled=result.total > 0,
        citations=_citation(entity),
        meta={"booking": match.record_id, "namespace": str(match.namespace)},
    )

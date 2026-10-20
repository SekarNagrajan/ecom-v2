# Created by Sekar Nagarajan (2026-10-21 00:25)
"""Generic get/list handlers driven by the entity specs.

Most portal lookups are the same shape, so the per-entity differences live
in `FIELDS` (what to show) rather than in bespoke code. Every path returns
an `ActionResult`; there is no route out of here that is not an outcome.
"""

from __future__ import annotations

from typing import Any

from app.actions.context import ActionContext, project_rows
from app.repositories.base import RepositoryError
from app.repositories.entities import ENTITIES
from app.responses import outcomes
from app.responses.schema import ActionResult

#: Columns surfaced per entity, in display order.
FIELDS: dict[str, list[str]] = {
    "portal_booking": [
        "ebookno", "ebook_status", "bookDate", "cust_code",
        "originPortId", "loadPortId", "dischargePortId", "finalPortId",
        "trptsvccode", "customerreference",
    ],
    "carrier_booking": [
        "book_no", "status", "actStatus", "bookDate", "serviceCode",
        "vesselCode", "voyageCode", "polTerminal", "podTerminal",
        "shipment_type",
    ],
    "shipping_instruction": [
        "eSINo", "status", "blno", "bookno", "Vessel", "Voyage",
        "pol", "pod", "custcode", "blType", "blversion",
    ],
    "bill_of_lading": [
        "bl_no", "book_no", "status", "actStatus", "blType",
        "originals", "copies", "OnboardDate",
    ],
    "vgm": [
        "id", "book_no", "eqpid", "eqptype", "VGM_Weight", "VGM_unit",
        "VGM_Obtained_Method", "VGM_Obtained_Date", "status", "Version_no",
    ],
    "arrival_notice": [
        "arrivalnoticeno", "blnumber", "vesselcode", "voyage",
        "portcode", "terminalcode",
    ],
    "delivery_order": ["delordno", "versionNo", "cntrno"],
    "invoice": [
        "invno", "invdate", "invduedate", "custcode", "custname",
        "invamount", "amtreceived", "amtbalance", "invcurrency", "invstatus",
    ],
    "receipt": [
        "ReceiptNo", "ReceiptDate", "CustCode", "Receiptmode",
        "ReceiptAmt", "BalAmt",
    ],
}

#: Screen each entity is shown on, for citations.
ROUTES: dict[str, tuple[str, str]] = {
    "portal_booking": ("/app/booking", "Booking"),
    "carrier_booking": ("/app/booking", "Booking"),
    "shipping_instruction": ("/app/shipping-instruction", "Shipping Instruction"),
    "bill_of_lading": ("/app/bl", "Bill of Lading"),
    "vgm": ("/app/vgm", "VGM"),
    "arrival_notice": ("/app/arrival-notice", "Arrival Notice"),
    "delivery_order": ("/app/delivery-order", "Delivery Order"),
    "invoice": ("/app/customer-statement", "Customer Statement"),
    "receipt": ("/app/customer-statement", "Customer Statement"),
}


def _citation(entity: str) -> list[tuple[str, str]]:
    route = ROUTES.get(entity)
    return [route] if route else []


def get_record(
    ctx: ActionContext, action: str, entity: str, record_id: Any, *,
    include_children: list[str] | None = None,
) -> ActionResult:
    """One record by id, with optional detail tables."""
    spec = ENTITIES[entity]
    if not ctx.allowed_for(spec):
        return outcomes.not_allowed(
            action, label=spec.label, capability=spec.capability
        )
    if not record_id or not str(record_id).strip():
        return outcomes.missing_info(action, slots=[f"{spec.label} number"])

    ref = str(record_id).strip()
    try:
        row = ctx.repo.get(entity, ref, customer=ctx.customer)
        if row is None:
            # Distinguish "does not exist" from "not yours" — different fixes.
            if ctx.customer is not None and ctx.repo.exists(entity, ref):
                return outcomes.not_allowed(action, label=spec.label, owner=True)
            return outcomes.not_found(
                action, label=spec.label, record_id=ref,
                citations=_citation(entity),
            )

        data: dict[str, Any] = {"record": row.project(FIELDS.get(entity, []))}
        for label in include_children or []:
            kids = ctx.repo.children(entity, ref, label)
            if kids:
                data[label] = project_rows(kids, FIELDS.get(entity, []) or list(kids[0]))
        return outcomes.success(
            action, data=data, label=spec.label, record_id=ref,
            citations=_citation(entity),
            meta={"entity": entity, "source": getattr(ctx.repo, "source", "mock")},
        )
    except RepositoryError as exc:
        return outcomes.error(
            action, label=spec.label,
            data_source=exc.code == "DATA_SOURCE_UNAVAILABLE",
        )


def list_records(
    ctx: ActionContext, action: str, entity: str, *,
    filters: dict[str, Any] | None = None, limit: int = 20,
) -> ActionResult:
    """A page of records, always scoped and always honest about sampling."""
    spec = ENTITIES[entity]
    if not ctx.allowed_for(spec):
        return outcomes.not_allowed(
            action, label=spec.label, capability=spec.capability
        )
    try:
        page = ctx.repo.list(
            entity, customer=ctx.customer, filters=filters or {}, limit=limit
        )
        items = project_rows(page.rows, FIELDS.get(entity, []), limit=limit)
        return outcomes.success(
            action,
            data={"items": items},
            label=f"{spec.label}s",
            count=page.total,
            sampled=page.total > 0,
            citations=_citation(entity),
            meta={
                "entity": entity,
                "returned": page.returned,
                "total_in_sample": page.total,
                "source": getattr(ctx.repo, "source", "mock"),
            },
        )
    except RepositoryError as exc:
        return outcomes.error(
            action, label=f"{spec.label}s",
            data_source=exc.code == "DATA_SOURCE_UNAVAILABLE",
        )

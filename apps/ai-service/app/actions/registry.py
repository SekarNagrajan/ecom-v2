# Created by Sekar Nagarajan (2026-10-21 00:40)
"""intent/tool name -> server-side handler.

`app/tools/catalog.py` declares the tool contract the model sees; this maps
the subset that now runs server-side onto handlers. Anything absent here
still executes in the browser, so a tool can be moved one at a time.
"""

from __future__ import annotations

from typing import Any, Callable

from app.actions import bookings
from app.actions.context import ActionContext
from app.actions.records import get_record, list_records
from app.responses import outcomes
from app.responses.schema import ActionResult

Handler = Callable[[ActionContext, dict[str, Any]], ActionResult]


def _simple_list(entity: str, action: str) -> Handler:
    def handler(ctx: ActionContext, args: dict[str, Any]) -> ActionResult:
        limit = args.get("limit")
        return list_records(
            ctx, action, entity,
            limit=int(limit) if isinstance(limit, int) else 20,
        )
    return handler


def _get_booking(ctx: ActionContext, args: dict[str, Any]) -> ActionResult:
    return bookings.get_booking(ctx, args.get("booking_id"))


def _list_si(ctx: ActionContext, args: dict[str, Any]) -> ActionResult:
    booking = args.get("booking_id") or args.get("booking_no")
    if booking:
        return bookings.documents_of_booking(
            ctx, "list_shipping_instructions", "shipping_instruction", booking
        )
    return list_records(ctx, "list_shipping_instructions", "shipping_instruction")


def _list_vgm(ctx: ActionContext, args: dict[str, Any]) -> ActionResult:
    booking = args.get("booking_id") or args.get("booking_no")
    if booking:
        return bookings.documents_of_booking(ctx, "list_vgm", "vgm", booking)
    return list_records(ctx, "list_vgm", "vgm")


def _get_invoice(ctx: ActionContext, args: dict[str, Any]) -> ActionResult:
    return get_record(
        ctx, "get_customer_statement", "invoice", args.get("invoice_no"),
        include_children=["charges"],
    )


HANDLERS: dict[str, Handler] = {
    "get_booking": _get_booking,
    "list_bookings": _simple_list("portal_booking", "list_bookings"),
    "list_shipping_instructions": _list_si,
    "list_bills_of_lading": _simple_list("bill_of_lading", "list_bills_of_lading"),
    "list_vgm": _list_vgm,
    "list_arrival_notices": _simple_list("arrival_notice", "list_arrival_notices"),
    "list_delivery_orders": _simple_list("delivery_order", "list_delivery_orders"),
    "get_customer_statement": _get_invoice,
}


def has_handler(name: str) -> bool:
    return name in HANDLERS


def run_action(ctx: ActionContext, name: str, args: dict[str, Any]) -> ActionResult:
    """Dispatch. An unknown action is an ERROR outcome, never an exception."""
    handler = HANDLERS.get(name)
    if handler is None:
        return outcomes.error(name, label="that action")
    try:
        return handler(ctx, args or {})
    except Exception:  # noqa: BLE001 - a handler bug must not kill the turn
        import logging

        logging.getLogger(__name__).exception("action %s failed", name)
        return outcomes.error(name, label="that action")


__all__ = ["HANDLERS", "Handler", "has_handler", "run_action"]

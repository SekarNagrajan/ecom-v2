# Created by Sekar Nagarajan (2026-10-20 23:15)
"""Which fixture table backs each portal entity, and how it is scoped.

Field spellings are the real column names from the dump; `Row` folds case
and underscores, so one spelling per concept is enough. Child tables list
the FK column that points back at the parent.

Match rates below were measured against the committed fixtures and drive
what the handlers may promise a user.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class EntitySpec:
    """One queryable portal entity."""

    key: str
    table: str
    #: Candidate spellings of the primary identifier.
    id_fields: tuple[str, ...]
    #: Candidate spellings of the owning customer code (None = not scoped).
    customer_fields: tuple[str, ...] = ()
    #: `{label: (table, fk_column)}` detail tables.
    children: dict[str, tuple[str, str]] = field(default_factory=dict)
    #: Capability required to read it (None = open to any signed-in user).
    capability: str | None = None
    label: str = ""


ENTITIES: dict[str, EntitySpec] = {
    # ── portal booking request (BKON…) ───────────────────────────────────
    "portal_booking": EntitySpec(
        key="portal_booking",
        table="bookings",
        id_fields=("ebookno",),
        customer_fields=("cust_code",),
        children={
            "parties": ("bookingCust", "ebookno"),
            "containers": ("bookingCargo", "ebookno"),
            "commodities": ("bookingCommodity", "ebookno"),
            "legs": ("bookingLeg", "ebookno"),
            "cutoffs": ("bookingConf", "ebookno"),
            "reefer": ("bookingRefer", "ebookno"),
            "dangerous_goods": ("bookingDg", "ebookno"),
            "out_of_gauge": ("bookingOog", "ebookno"),
            "haulage": ("bookingHaulage", "ebookno"),
            "references": ("bookingReference", "ebookno"),
        },
        capability="BKG",
        label="booking request",
    ),
    # ── carrier booking (SVMDMU…) — the hub documents hang off ───────────
    "carrier_booking": EntitySpec(
        key="carrier_booking",
        table="lrpBookings",
        id_fields=("book_no",),
        children={
            "parties": ("lrpBookingCust", "book_no"),
            "containers": ("lrpBookingCargo", "book_no"),
            "legs": ("lrpBookingLegs", "book_no"),
            "moves": ("containerMoves", "bookNo"),
        },
        capability="BKG",
        label="carrier booking",
    ),
    "shipping_instruction": EntitySpec(
        key="shipping_instruction",
        table="shippingInstructions",
        id_fields=("eSINo",),
        customer_fields=("custcode",),
        children={
            "parties": ("siCust", "eSINo"),
            "containers": ("siCargo", "eSINo"),
            "commodities": ("siCommodity", "eSINo"),
            "charges": ("siCharges", "esino"),
            "dangerous_goods": ("siDg", "eSIno"),
            "reefer": ("siReefer", "eSIno"),
        },
        capability="SI",
        label="shipping instruction",
    ),
    "bill_of_lading": EntitySpec(
        key="bill_of_lading",
        table="lrpBl",
        id_fields=("bl_no",),
        children={
            "parties": ("lrpBlCust", "bl_no"),
            "containers": ("lrpBlCargo", "bl_no"),
        },
        capability="BL",
        label="bill of lading",
    ),
    "vgm": EntitySpec(
        key="vgm",
        table="vgm",
        id_fields=("id",),
        capability="VGM",
        label="VGM declaration",
    ),
    "arrival_notice": EntitySpec(
        key="arrival_notice",
        table="arrivalNotices",
        id_fields=("arrivalnoticeno",),
        capability="ARN",
        label="arrival notice",
    ),
    "delivery_order": EntitySpec(
        key="delivery_order",
        table="deliveryOrderVersions",
        id_fields=("delordno",),
        capability="DO",
        label="delivery order",
    ),
    "invoice": EntitySpec(
        key="invoice",
        table="invoices",
        id_fields=("invno",),
        customer_fields=("custcode",),
        children={"charges": ("invoiceCharges", "invno")},
        capability="PAY",
        label="invoice",
    ),
    "receipt": EntitySpec(
        key="receipt",
        table="receipts",
        id_fields=("ReceiptNo",),
        customer_fields=("CustCode",),
        children={"allocations": ("receiptAllocations", "ReceiptNo")},
        capability="PAY",
        label="receipt",
    ),
}


def get_entity(key: str) -> EntitySpec | None:
    return ENTITIES.get(key)

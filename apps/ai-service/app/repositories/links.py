# Created by Sekar Nagarajan (2026-10-20 23:45)
"""Resolving references across the two booking-number namespaces.

The portal and the carrier back-office use different booking numbers and,
in this data, they DO NOT JOIN:

    bookings.ebookno      "BKON7313"        portal request + booking* children
    lrpBookings.book_no   "SVMDMU2694105"   SI, VGM, B/L, container moves

Measured on the committed fixtures: ``shippingInstructions.bookno`` matches
``lrpBookings.book_no`` for 97% of rows and ``bookings.ebookno`` for 0%.
``bookings.extBookNo`` — the column intended to bridge them — is 100% null.
Confirmed with the product owner as real, not a sampling artefact.

So a reference is resolved by trying both namespaces, and asking for the
documents of a *portal* booking returns an explicit, explainable
"chain unavailable" rather than a misleading empty list.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum

from app.repositories.base import Repository
from app.repositories.normalize import Row, as_id


class Namespace(StrEnum):
    PORTAL = "portal_booking"
    CARRIER = "carrier_booking"


@dataclass(frozen=True)
class BookingMatch:
    namespace: Namespace
    record_id: str
    row: Row

    @property
    def is_carrier(self) -> bool:
        return self.namespace is Namespace.CARRIER


@dataclass(frozen=True)
class ChainUnavailable:
    """A link that genuinely cannot be made in this data."""

    reference: str
    namespace: Namespace
    reason: str


#: Documents hang off the carrier booking number only.
DOCUMENT_ENTITIES: dict[str, str] = {
    "shipping_instruction": "bookno",
    "vgm": "book_no",
}

_PORTAL_TO_CARRIER_EXPLANATION = (
    "That is a portal booking request number. Shipping instructions, VGM "
    "declarations and bills of lading are filed against the carrier booking "
    "number, and this environment's data does not carry the link between the "
    "two. Search with the carrier booking number, the B/L number or the SI "
    "number instead."
)


def resolve_booking(
    repo: Repository, reference: str, *, customer: str | None
) -> BookingMatch | None:
    """Find a booking by either namespace. Portal is tried first."""
    wanted = as_id(reference)
    if not wanted:
        return None
    for namespace in (Namespace.PORTAL, Namespace.CARRIER):
        row = repo.get(namespace.value, wanted, customer=customer)
        if row is not None:
            return BookingMatch(namespace=namespace, record_id=wanted, row=row)
    return None


def documents_for_booking(
    repo: Repository,
    match: BookingMatch,
    entity: str,
    *,
    customer: str | None,
    limit: int = 20,
):
    """SI/VGM filed against a booking, or why that cannot be answered.

    Returns a `Page` for a carrier booking, or `ChainUnavailable` for a
    portal booking — never a silently empty page.
    """
    fk = DOCUMENT_ENTITIES.get(entity)
    if fk is None:
        raise ValueError(f"{entity!r} is not filed against a booking number")

    if match.namespace is Namespace.PORTAL:
        return ChainUnavailable(
            reference=match.record_id,
            namespace=match.namespace,
            reason=_PORTAL_TO_CARRIER_EXPLANATION,
        )

    return repo.list(
        entity,
        customer=customer,
        filters={fk: match.record_id},
        limit=limit,
    )


def container_ids_for_carrier_booking(repo: Repository, book_no: str) -> list[str]:
    """Real container numbers for a carrier booking.

    Uses ``lrpBookingCargo.eqpId`` (matches ``containerMoves.ContainerNo``
    100%), never ``bookingCargo.containerno`` — that column holds placeholder
    demo values and matches real movements for only a handful of rows.
    """
    rows = repo.children("carrier_booking", book_no, "containers")
    ids = [row.id_of("eqpId") for row in rows]
    return [i for i in ids if i]

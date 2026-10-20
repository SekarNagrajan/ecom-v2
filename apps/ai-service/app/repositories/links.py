# Modified by Sekar Nagarajan (2026-10-21 10:30)
"""Resolving references across the two booking-number namespaces.

The portal and the carrier back-office use different booking numbers:

    bookings.ebookno      "BKON7313"        portal request + booking* children
    lrpBookings.book_no   "SVMDMU2694105"   SI, VGM, B/L, container moves

``shippingInstructions.bookno`` matches ``lrpBookings.book_no`` for 97% of
rows and ``bookings.ebookno`` for 0% -- documents hang off the CARRIER
number. The bridge is ``bookings.extBookNo``, populated for 81 of 116
fixture bookings (70%), and it tracks acceptance exactly:

    ebook_status A (accepted)  -> 77/77 have extBookNo
    ebook_status S (submitted) ->  4/21
    ebook_status D, I, T, V    ->  0/18

A booking receives a carrier booking number when it is accepted. So a
portal reference is followed through ``extBookNo`` when present; when it is
absent the honest answer is not "the data does not link" but the real
reason -- the booking has no carrier booking number yet.
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

    @property
    def carrier_reference(self) -> str | None:
        """Carrier booking number, following `extBookNo` for portal rows."""
        if self.namespace is Namespace.CARRIER:
            return self.record_id
        return self.row.id_of("extBookNo")


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

#: Shown when a portal booking has no carrier booking number yet. This is a
#: real business state (the booking is not accepted), not a data gap.
_NO_CARRIER_BOOKING_YET = (
    "Booking {reference} does not have a carrier booking number yet, so no "
    "shipping instructions, VGM declarations or bills of lading have been "
    "filed against it. Those are created once the booking is accepted."
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

    carrier_ref = match.record_id
    if match.namespace is Namespace.PORTAL:
        # Follow the bridge. Present for ~70% of bookings; absent exactly
        # when the carrier has not accepted the booking yet.
        carrier_ref = match.row.id_of("extBookNo")
        if not carrier_ref:
            return ChainUnavailable(
                reference=match.record_id,
                namespace=match.namespace,
                reason=_NO_CARRIER_BOOKING_YET.format(
                    reference=match.record_id
                ),
            )

    return repo.list(
        entity,
        customer=customer,
        filters={fk: carrier_ref},
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

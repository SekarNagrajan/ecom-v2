# Modified by Sekar Nagarajan (2026-10-20 14:47)
"""Allowlist of portal routes for the navigate ui_action."""

from __future__ import annotations

ALLOWED_ROUTES = {
    "/app/dashboard",
    "/app/schedules",
    "/app/tracking",
    "/app/rates",
    "/app/booking",
    "/app/booking/new",
    "/app/shipping-instruction",
    "/app/vgm",
    "/app/bl",
    "/app/delivery-order",
    "/app/cro",
    "/app/arrival-notice",
    "/app/customer-stmt",
    "/app/carbon",
    "/app/payments",
    "/app/quotes",
    "/app/profile",
    "/app/my-alerts",
}

ROUTE_PREFIXES = (
    "/app/booking/",
    "/app/shipping-instruction/",
    "/app/bl/",
)

ROUTE_CAPABILITY: dict[str, str] = {
    "/app/booking": "BKG",
    "/app/shipping-instruction": "SI",
    "/app/vgm": "VGM",
    "/app/bl": "BL",
    "/app/delivery-order": "DO",
    "/app/cro": "CRO",
    "/app/arrival-notice": "ARN",
    "/app/customer-stmt": "PAY",
    "/app/carbon": "CO2",
    "/app/payments": "PAY",
}


def route_ok(route: str) -> bool:
    if route in ALLOWED_ROUTES:
        return True
    return any(route.startswith(p) for p in ROUTE_PREFIXES)


def capability_for_route(route: str) -> str | None:
    for prefix, cap in ROUTE_CAPABILITY.items():
        if route == prefix or route.startswith(prefix + "/"):
            return cap
    return None

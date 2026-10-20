# Created by Sekar Nagarajan (2026-10-21 00:00)
"""User-facing wording for every outcome, keyed and interpolated.

Keeping the strings here (not in prompts, not in the model's head) means a
failure always reads the same way and can be translated. Unknown keys fall
back loudly rather than silently rendering an empty string.
"""

from __future__ import annotations

from typing import Any

MESSAGES: dict[str, str] = {
    # ── generic ──────────────────────────────────────────────────────────
    "found.record": "Found {label} {id}.",
    "found.list": "Found {count} {label} in this sample.",
    "found.list.empty": "No {label} match that search in this sample.",
    "not_found.record": "No {label} with reference {id} is visible to you.",
    "not_allowed.capability": (
        "You do not have access to {label}. Ask your administrator to enable "
        "the {capability} module for your account."
    ),
    "not_allowed.owner": (
        "That {label} belongs to another customer account, so it cannot be "
        "shown here."
    ),
    "missing_info.slots": "To do that I still need: {slots}.",
    "error.internal": (
        "Something went wrong reading {label}. Please try again."
    ),
    "error.data_source": (
        "The data source is unavailable, so {label} cannot be read right now."
    ),
    # ── the two booking namespaces ───────────────────────────────────────
    "wrong_state.portal_booking_has_no_documents": (
        "{reason}"
    ),
    "wrong_state.unknown_namespace": (
        "{id} does not look like a booking number this portal issues."
    ),
    # ── sampling caveat ──────────────────────────────────────────────────
    "found.list.sampled": (
        "Found {count} {label} in this sample. The demo dataset is a sample "
        "of the database, so this is not necessarily every record."
    ),
}


class UnknownMessageKey(KeyError):
    """Raised when a handler references a message that does not exist."""


def render(key: str, args: dict[str, Any] | None = None) -> str:
    """Render a message. Missing keys and placeholders fail loudly in tests."""
    template = MESSAGES.get(key)
    if template is None:
        raise UnknownMessageKey(key)
    try:
        return template.format(**(args or {}))
    except KeyError as exc:  # a placeholder the caller did not supply
        raise UnknownMessageKey(
            f"{key} is missing placeholder {exc.args[0]!r}"
        ) from exc


def known_keys() -> frozenset[str]:
    return frozenset(MESSAGES)

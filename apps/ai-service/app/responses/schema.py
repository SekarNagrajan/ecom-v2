# Created by Sekar Nagarajan (2026-10-20 23:55)
"""The one envelope every action handler returns.

Requirement: a correct, structured response for EVERY action and EVERY
outcome. Handlers never return bare dicts and never compose user-facing
prose — they pick an `Outcome` and a `message_key`, so the wording is
owned by the service (and translatable) rather than invented by the model.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class Outcome(StrEnum):
    """Every way an action can end. Exhaustive by design."""

    SUCCESS = "success"
    #: The id is well-formed but no such record is visible to this user.
    NOT_FOUND = "not_found"
    #: The user lacks the capability, or the record belongs to someone else.
    NOT_ALLOWED = "not_allowed"
    #: The request is under-specified; `missing_slots` says what to ask for.
    MISSING_INFO = "missing_info"
    #: The record exists but its state makes the request impossible, and the
    #: link the user assumed does not exist in this data.
    WRONG_STATE = "wrong_state"
    #: Something failed that is nobody's fault but ours.
    ERROR = "error"


#: Outcomes the caller may retry unchanged.
RETRYABLE: frozenset[Outcome] = frozenset({Outcome.ERROR})


class Citation(BaseModel):
    """A portal screen backing an answer."""

    route: str
    title: str


class ActionResult(BaseModel):
    """Structured result of one action invocation."""

    action: str
    outcome: Outcome
    #: Stable key resolved against `app/responses/messages.py`.
    message_key: str
    #: Values interpolated into the message template.
    message_args: dict[str, Any] = Field(default_factory=dict)
    #: Payload for the model/UI. Empty on every non-success outcome.
    data: dict[str, Any] = Field(default_factory=dict)
    #: For MISSING_INFO: exactly what the assistant should ask for next.
    missing_slots: list[str] = Field(default_factory=list)
    citations: list[Citation] = Field(default_factory=list)
    #: Provenance: sampling caveats, counts, which namespace matched.
    meta: dict[str, Any] = Field(default_factory=dict)

    @property
    def ok(self) -> bool:
        return self.outcome is Outcome.SUCCESS

    @property
    def retryable(self) -> bool:
        return self.outcome in RETRYABLE

    def for_model(self) -> dict[str, Any]:
        """Compact shape handed back as a tool result.

        `message` is rendered here so the model repeats our wording rather
        than inventing its own explanation of a failure.
        """
        from app.responses.messages import render

        payload: dict[str, Any] = {
            "action": self.action,
            "outcome": str(self.outcome),
            "message": render(self.message_key, self.message_args),
        }
        if self.data:
            payload["data"] = self.data
        if self.missing_slots:
            payload["missing_slots"] = self.missing_slots
        if self.citations:
            payload["citations"] = [c.model_dump() for c in self.citations]
        if self.meta:
            payload["meta"] = self.meta
        return payload

# Created by Sekar Nagarajan (2026-10-21 00:20)
"""Everything a server-side action needs, resolved once per request."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.models.chat import UserContext
from app.repositories.base import Repository
from app.repositories.entities import EntitySpec


@dataclass(frozen=True)
class ActionContext:
    repo: Repository
    user: UserContext
    #: Customer code the results must be scoped to. ``None`` = unscoped
    #: (admin / impersonation / dev), which the repository honours.
    customer: str | None

    def can(self, capability: str | None) -> bool:
        return capability is None or self.user.can(capability)

    def allowed_for(self, spec: EntitySpec) -> bool:
        return self.can(spec.capability)


def customer_for(user: UserContext) -> str | None:
    """Scope key for this user.

    Admins, session admins and impersonators read across customers (the same
    rule `UserContext.can` already applies to capabilities), so they are
    unscoped. Everyone else is pinned to their own customer code.
    """
    if user.role == "ADMIN" or user.is_session_admin or user.is_impersonating:
        return None
    return user.tenant_code or None


def project_rows(rows: list[Any], fields: list[str], limit: int = 20) -> list[dict]:
    """Cleaned, whitelisted projection — never dump whole SQL rows at a model."""
    return [row.project(fields) for row in rows[:limit]]

# Created by Sekar Nagarajan (2026-10-20 23:30)
"""Repository protocol + the fixture-backed and API-backed implementations.

`DATA_SOURCE=mock` reads the committed portal fixtures from disk;
`DATA_SOURCE=api` will call the Spring Boot backend once it exists. Actions
depend only on this protocol, so swapping the source changes no handler.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from app.repositories.entities import ENTITIES, EntitySpec, get_entity
from app.repositories.fixtures import FixtureStore
from app.repositories.normalize import Row, as_id


class RepositoryError(RuntimeError):
    """Raised when the backing data source cannot serve a request."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass(frozen=True)
class Page:
    """A slice of rows plus the honest total for this sample."""

    rows: list[Row]
    total: int
    offset: int
    limit: int

    @property
    def returned(self) -> int:
        return len(self.rows)


class Repository(Protocol):
    """Read access to one portal entity, always customer-scoped."""

    def get(self, entity: str, record_id: str, *, customer: str | None) -> Row | None: ...

    def list(
        self,
        entity: str,
        *,
        customer: str | None,
        filters: dict[str, object] | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> Page: ...

    def children(self, entity: str, record_id: str, label: str) -> list[Row]: ...

    def exists(self, entity: str, record_id: str) -> bool: ...


class FixtureRepository:
    """Reads the committed `src/mocks/fixtures/*.json` dumps."""

    source = "mock"

    def __init__(self, fixtures_root: Path) -> None:
        self.store = FixtureStore(fixtures_root)

    # ── helpers ──────────────────────────────────────────────────────────

    def _spec(self, entity: str) -> EntitySpec:
        spec = get_entity(entity)
        if spec is None:
            raise RepositoryError("UNKNOWN_ENTITY", f"Unknown entity {entity!r}")
        return spec

    @staticmethod
    def _owns(spec: EntitySpec, row: Row, customer: str | None) -> bool:
        """True when the row belongs to this customer.

        No customer (admin/dev) sees everything. An entity with no customer
        column cannot be scoped — the caller must gate it by capability.
        """
        if customer is None or not spec.customer_fields:
            return True
        return row.id_of(*spec.customer_fields) == as_id(customer)

    # ── Repository ───────────────────────────────────────────────────────

    def get(self, entity: str, record_id: str, *, customer: str | None) -> Row | None:
        spec = self._spec(entity)
        wanted = as_id(record_id)
        if wanted is None:
            return None
        for row in self.store.table(spec.table):
            if row.id_of(*spec.id_fields) == wanted:
                return row if self._owns(spec, row, customer) else None
        return None

    def list(
        self,
        entity: str,
        *,
        customer: str | None,
        filters: dict[str, object] | None = None,
        offset: int = 0,
        limit: int = 20,
    ) -> Page:
        spec = self._spec(entity)
        wanted = {k: as_id(v) for k, v in (filters or {}).items() if v is not None}
        matched = [
            row
            for row in self.store.table(spec.table)
            if self._owns(spec, row, customer)
            and all(row.id_of(col) == val for col, val in wanted.items())
        ]
        offset = max(0, offset)
        limit = max(1, min(limit, 100))
        return Page(
            rows=matched[offset : offset + limit],
            total=len(matched),
            offset=offset,
            limit=limit,
        )

    def children(self, entity: str, record_id: str, label: str) -> list[Row]:
        spec = self._spec(entity)
        child = spec.children.get(label)
        if child is None:
            return []
        table, fk = child
        return self.store.find(table, where={fk: record_id})

    def exists(self, entity: str, record_id: str) -> bool:
        spec = self._spec(entity)
        wanted = as_id(record_id)
        return any(
            row.id_of(*spec.id_fields) == wanted for row in self.store.table(spec.table)
        )


class ApiRepository:
    """Placeholder for `DATA_SOURCE=api` (Spring Boot backend).

    Every method fails loudly rather than returning empty results, so a
    mis-set environment can never look like "no records found".
    """

    source = "api"

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url

    def _unavailable(self):
        raise RepositoryError(
            "DATA_SOURCE_UNAVAILABLE",
            "DATA_SOURCE=api is configured but the backend adapter is not "
            "implemented yet. Set DATA_SOURCE=mock to use the portal fixtures.",
        )

    def get(self, entity, record_id, *, customer):  # noqa: D102
        self._unavailable()

    def list(self, entity, *, customer, filters=None, offset=0, limit=20):  # noqa: D102
        self._unavailable()

    def children(self, entity, record_id, label):  # noqa: D102
        self._unavailable()

    def exists(self, entity, record_id):  # noqa: D102
        self._unavailable()


def build_repository(data_source: str, *, fixtures_root: Path, api_base_url: str):
    """Factory selected by `DATA_SOURCE`."""
    if data_source == "api":
        return ApiRepository(api_base_url)
    return FixtureRepository(fixtures_root)


__all__ = [
    "ENTITIES",
    "ApiRepository",
    "FixtureRepository",
    "Page",
    "Repository",
    "RepositoryError",
    "build_repository",
]

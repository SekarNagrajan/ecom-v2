# Created by Sekar Nagarajan (2026-10-20 23:15)
"""In-memory store over the portal's fixture JSON dumps.

Mirrors `apps/ecom-portal/src/mocks/fixture-api/db.ts`: every
`fixtures/*.json` becomes a table keyed by file stem, rows wrapped for
case-insensitive access. Read-only — the assistant never mutates portal
data; writes go through the portal UI.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path

from app.repositories.normalize import Row, as_id, rows_of

logger = logging.getLogger(__name__)


class FixtureStore:
    """Lazily-loaded `{table: [Row, ...]}` over a fixtures directory."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self._tables: dict[str, list[Row]] = {}
        self._loaded = False

    # ── loading ──────────────────────────────────────────────────────────

    def load(self) -> "FixtureStore":
        if self._loaded:
            return self
        if not self.root.is_dir():
            logger.warning("fixtures directory missing: %s", self.root)
            self._loaded = True
            return self
        for path in sorted(self.root.glob("*.json")):
            if path.stem.startswith("_"):  # _manifest.json is provenance
                continue
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError) as exc:
                logger.warning("skipping unreadable fixture %s: %s", path.name, exc)
                continue
            if isinstance(data, list):
                self._tables[path.stem] = rows_of(data)
        self._loaded = True
        logger.info(
            "fixture store loaded: %d tables, %d rows",
            len(self._tables),
            sum(len(r) for r in self._tables.values()),
        )
        return self

    @property
    def ready(self) -> bool:
        return self._loaded and bool(self._tables)

    def table_names(self) -> list[str]:
        self.load()
        return sorted(self._tables)

    def table(self, name: str) -> list[Row]:
        """Rows of a table; empty list when the dump omitted it."""
        self.load()
        return self._tables.get(name, [])

    # ── queries ──────────────────────────────────────────────────────────

    def find(self, table: str, *, where: dict[str, object]) -> list[Row]:
        """Rows matching every `column: value` pair, compared as ids.

        Comparison goes through `as_id`, so padding, int/str drift and
        null-sentinels can never cause a silent miss.
        """
        wanted = {k: as_id(v) for k, v in where.items()}
        out: list[Row] = []
        for row in self.table(table):
            if all(row.id_of(col) == val for col, val in wanted.items()):
                out.append(row)
        return out

    def first(self, table: str, *, where: dict[str, object]) -> Row | None:
        found = self.find(table, where=where)
        return found[0] if found else None

    def children(self, table: str, parent_field: str, parent_id: object) -> list[Row]:
        return self.find(table, where={parent_field: parent_id})

    def distinct(self, table: str, column: str) -> set[str]:
        return {
            value
            for value in (row.id_of(column) for row in self.table(table))
            if value is not None
        }

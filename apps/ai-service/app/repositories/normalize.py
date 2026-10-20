# Modified by Sekar Nagarajan (2026-10-21 01:15)
"""Row normalisation for the SQL-dumped portal fixtures.

The fixtures are raw SQL Server table dumps, so the same logical column is
spelled differently from table to table (`cust_code` / `custcode` /
`CustCode` / `customerCode`, `eSINo` / `eSIno` / `esino`). The portal's TS
layer survives this because `src/mocks/fixture-api/db.ts` wraps every row
for case-insensitive property access; this module is the Python equivalent,
plus the three other hazards the audit found:

  * fixed-width `char()` columns carry padding — `"DDA "` never matches `"DDA"`
  * `id` is a number in some tables and a quoted string in others
  * `"null"`, `"undefined"` and `"None"` appear as literal strings
"""

from __future__ import annotations

from typing import Any, Iterable, Mapping

#: Strings the dump uses where a real NULL was meant.
NULL_STRINGS: frozenset[str] = frozenset({"null", "undefined", "none", ""})


def clean(value: Any) -> Any:
    """Trim padded strings and turn null-ish sentinels into real ``None``."""
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.lower() in NULL_STRINGS:
            return None
        return stripped
    return value


def as_id(value: Any) -> str | None:
    """Coerce an identifier to a comparable string (handles int/str drift)."""
    cleaned = clean(value)
    if cleaned is None:
        return None
    if isinstance(cleaned, float) and cleaned.is_integer():
        return str(int(cleaned))
    return str(cleaned)


#: Columns that mean the same thing but are not case/separator variants.
#: The audit found the customer key spelled four ways across tables and the
#: booking/SI numbers spelled three; without this a spec naming one spelling
#: would silently read nothing from a table that uses another.
SYNONYMS: dict[str, str] = {
    "customercode": "custcode",
    "customerid": "custid",
    "bookno": "bookno",
    "booknumber": "bookno",
    "blnumber": "blno",
    "billofladingno": "blno",
    "containerno": "containerno",
    "equipmentid": "eqpid",
}


def fold(key: str) -> str:
    """Fold a column name so spelling variants collide.

    Case and separators are dropped (``cust_code`` / ``CustCode`` /
    ``custcode`` -> ``custcode``), then known synonyms are mapped onto one
    canonical form (``customerCode`` -> ``custcode``).
    """
    base = key.replace("_", "").replace("-", "").replace(" ", "").lower()
    return SYNONYMS.get(base, base)


class Row(Mapping[str, Any]):
    """Case/underscore-insensitive read-only view over one fixture row.

    ``row["cust_code"]``, ``row["custcode"]`` and ``row["CustCode"]`` all read
    the same column. Values come back cleaned (see :func:`clean`). Iteration
    and ``dict(row)`` yield the ORIGINAL column names, so output keeps the
    shape the portal shows.
    """

    __slots__ = ("_raw", "_folded")

    def __init__(self, raw: Mapping[str, Any]) -> None:
        self._raw: dict[str, Any] = dict(raw)
        self._folded: dict[str, str] = {}
        for key in self._raw:
            # First spelling wins; dumps do not carry true duplicates.
            self._folded.setdefault(fold(key), key)

    def __getitem__(self, key: str) -> Any:
        original = self._folded.get(fold(key))
        if original is None:
            raise KeyError(key)
        return clean(self._raw[original])

    def __iter__(self):
        return iter(self._raw)

    def __len__(self) -> int:
        return len(self._raw)

    def get_any(self, *keys: str, default: Any = None) -> Any:
        """First of several spellings that is present and non-null."""
        for key in keys:
            try:
                value = self[key]
            except KeyError:
                continue
            if value is not None:
                return value
        return default

    def id_of(self, *keys: str) -> str | None:
        """:meth:`get_any` coerced through :func:`as_id`."""
        return as_id(self.get_any(*keys))

    def raw(self) -> dict[str, Any]:
        """The untouched row, original keys and values."""
        return dict(self._raw)

    def project(self, fields: Iterable[str]) -> dict[str, Any]:
        """Cleaned subset, keyed by the names the caller asked for.

        Columns that do not exist are omitted rather than set to ``None``,
        so a caller can tell "absent" from "present but empty".
        """
        out: dict[str, Any] = {}
        for field in fields:
            try:
                value = self[field]
            except KeyError:
                continue
            if value is not None:
                out[field] = value
        return out

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"Row({self._raw!r})"


def rows_of(records: Iterable[Mapping[str, Any]]) -> list[Row]:
    return [Row(r) for r in records if isinstance(r, Mapping)]

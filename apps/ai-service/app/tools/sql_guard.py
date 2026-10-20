# Modified by Sekar Nagarajan (2026-10-20 16:50)
"""Read-only SQL validation before any execution."""

from __future__ import annotations

import re

_FORBIDDEN = re.compile(
    r"\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|"
    r"merge|replace|call|exec|execute|into\s+outfile|load_file|copy\s+)\b",
    re.IGNORECASE,
)
_MULTI_STMT = re.compile(r";\s*\S")
_COMMENTS = re.compile(r"/\*.*?\*/|--.*?$|#.*?$", re.MULTILINE | re.DOTALL)


def validate_readonly_sql(sql: str, *, max_chars: int = 8000) -> str | None:
    """Return an error message if sql is not a single read-only statement."""
    if not sql or not sql.strip():
        return "SQL is empty"
    if len(sql) > max_chars:
        return f"SQL exceeds {max_chars} characters"
    cleaned = _COMMENTS.sub(" ", sql).strip().rstrip(";").strip()
    if not cleaned:
        return "SQL is empty after removing comments"
    if _MULTI_STMT.search(sql):
        return "Multiple statements are not allowed"
    if _FORBIDDEN.search(cleaned):
        return "Only read-only SELECT / WITH / EXPLAIN queries are allowed"
    head = cleaned.lstrip("(").lstrip().split(None, 1)[0].upper()
    if head not in {"SELECT", "WITH", "EXPLAIN", "SHOW", "DESCRIBE", "DESC"}:
        return "Query must start with SELECT, WITH, EXPLAIN, SHOW or DESCRIBE"
    return None

# Modified by Sekar Nagarajan (2026-10-20 16:50)
"""Controlled SQL execution — optional remote SQL service adapter."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config import Settings
from app.tools.sql_guard import validate_readonly_sql

logger = logging.getLogger(__name__)


async def run_readonly_sql(
    sql: str,
    *,
    settings: Settings,
    authorization: str | None = None,
    limit: int = 100,
) -> dict[str, Any]:
    err = validate_readonly_sql(sql)
    if err:
        return {"ok": False, "error": err, "code": "SQL_REJECTED"}

    row_limit = max(1, min(int(limit or 100), 500))
    service_url = (settings.sql_service_url or "").rstrip("/")
    if not service_url:
        return {
            "ok": False,
            "error": (
                "SQL execution service is not configured. "
                "Set SQL_SERVICE_URL to enable controlled query execution. "
                "Use E-Commerce Assistant mode for live portal lookups."
            ),
            "code": "SQL_SERVICE_UNAVAILABLE",
            "validated": True,
            "sql": sql.strip(),
        }

    headers: dict[str, str] = {"Content-Type": "application/json"}
    if authorization:
        headers["Authorization"] = authorization
    elif settings.sql_service_token:
        headers["Authorization"] = f"Bearer {settings.sql_service_token}"

    timeout = float(settings.sql_query_timeout_seconds or 30)
    payload = {"sql": sql.strip(), "limit": row_limit, "readonly": True}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.post(
                f"{service_url}/run-sql",
                json=payload,
                headers=headers,
            )
        if resp.status_code >= 400:
            detail = resp.text[:500]
            return {
                "ok": False,
                "error": f"SQL service error ({resp.status_code}): {detail}",
                "code": "SQL_SERVICE_ERROR",
            }
        data = resp.json()
        columns = data.get("columns") or data.get("column_names") or []
        rows = data.get("rows") or data.get("data") or []
        if not isinstance(rows, list):
            rows = []
        rows = rows[:row_limit]
        return {
            "ok": True,
            "sql": sql.strip(),
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "truncated": len(rows) >= row_limit,
        }
    except httpx.TimeoutException:
        return {
            "ok": False,
            "error": "SQL query timed out",
            "code": "SQL_TIMEOUT",
        }
    except Exception as exc:
        logger.warning("sql runner failed: %s", type(exc).__name__)
        return {
            "ok": False,
            "error": "SQL service request failed",
            "code": "SQL_SERVICE_ERROR",
        }

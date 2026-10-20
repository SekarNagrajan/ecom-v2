# Modified by Sekar Nagarajan (2026-10-20 16:53)
from __future__ import annotations

import pytest

from app.config import Settings
from app.tools.server_tools import run_server_tool
from app.tools.sql_runner import run_readonly_sql


@pytest.mark.asyncio
async def test_run_sql_unavailable_without_service_url():
    settings = Settings(sql_service_url="")
    result = await run_readonly_sql("SELECT 1", settings=settings)
    assert result["ok"] is False
    assert result["code"] == "SQL_SERVICE_UNAVAILABLE"
    assert result.get("validated") is True


@pytest.mark.asyncio
async def test_run_sql_rejects_mutation_before_service():
    settings = Settings(sql_service_url="http://sql.example")
    result = await run_readonly_sql("DELETE FROM bookings", settings=settings)
    assert result["ok"] is False
    assert result["code"] == "SQL_REJECTED"


@pytest.mark.asyncio
async def test_describe_schema_returns_sections():
    class _State:
        settings = Settings()

    data = await run_server_tool("describe_schema", {"entity": "bookings"}, _State())
    assert data["ok"] is True
    assert data["sections"]

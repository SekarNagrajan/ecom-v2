# Modified by Sekar Nagarajan (2026-10-20 16:50)
from __future__ import annotations

from app.tools.sql_guard import validate_readonly_sql


def test_allows_select():
    assert validate_readonly_sql("SELECT booking_id FROM bookings LIMIT 10") is None


def test_allows_with():
    assert (
        validate_readonly_sql(
            "WITH x AS (SELECT 1 AS n) SELECT * FROM x"
        )
        is None
    )


def test_rejects_delete():
    err = validate_readonly_sql("DELETE FROM bookings")
    assert err is not None


def test_rejects_multi_statement():
    err = validate_readonly_sql("SELECT 1; DROP TABLE bookings")
    assert err is not None


def test_rejects_empty():
    assert validate_readonly_sql("   ") is not None

# Modified by Sekar Nagarajan (2026-10-20 16:53)
from __future__ import annotations

from app.modes import get_mode, parse_mode
from app.models.chat import ChatRequest, UserContext
from app.tools.catalog import tool_names_for


def test_parse_mode_defaults():
    assert parse_mode(None) == "assistant"
    assert parse_mode("nope") == "assistant"
    assert parse_mode("sql") == "sql"


def test_chat_request_mode_default():
    body = ChatRequest.model_validate({"message": "hi"})
    assert body.mode == "assistant"


def test_tool_names_scoped_by_mode():
    user = UserContext(user_id="u1", capabilities=["BKG"], authenticated=True)
    assistant = set(tool_names_for(user, mode="assistant"))
    automation = set(tool_names_for(user, mode="automation"))
    sql = set(tool_names_for(user, mode="sql"))
    docs = set(tool_names_for(user, mode="docs"))

    assert "list_bookings" in assistant
    assert "list_bookings" in automation
    assert "list_bookings" not in sql
    assert "list_bookings" not in docs
    assert "search_portal_guide" in docs
    assert "prefill_booking" in automation
    assert "propose_booking_submit" in automation
    assert "propose_booking_submit" not in assistant
    assert "prefill_booking" not in docs
    assert get_mode("automation").tool_allowlist is not None


def test_sql_tools_require_sql_capability():
    with_sql = UserContext(
        user_id="u1", capabilities=["BKG", "SQL"], authenticated=True
    )
    without = UserContext(user_id="u1", capabilities=["BKG"], authenticated=True)
    assert "describe_schema" in tool_names_for(with_sql, mode="sql")
    assert "run_sql_readonly" in tool_names_for(with_sql, mode="sql")
    assert "describe_schema" not in tool_names_for(without, mode="sql")
    assert "run_sql_readonly" not in tool_names_for(without, mode="sql")

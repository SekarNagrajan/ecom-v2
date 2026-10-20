# Created by Sekar Nagarajan (2026-10-21 01:25)
"""Server-side actions: every handler, every outcome, valid envelope."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.actions.context import ActionContext, customer_for
from app.actions.registry import HANDLERS, has_handler, run_action
from app.models.chat import UserContext
from app.repositories.base import ApiRepository, FixtureRepository
from app.responses.messages import known_keys, render
from app.responses.schema import ActionResult, Outcome

ALL_CAPS = ["BKG", "SI", "BL", "VGM", "CRO", "DO", "ARN", "PAY"]


def _user(caps=ALL_CAPS, tenant="C1", role="CUSTOMER", **kw) -> UserContext:
    return UserContext(
        user_id="u1", tenant_code=tenant, capabilities=list(caps),
        role=role, authenticated=True, **kw
    )


@pytest.fixture()
def repo(tmp_path: Path) -> FixtureRepository:
    (tmp_path / "bookings.json").write_text(json.dumps([
        {"ebookno": "BKON1", "cust_code": "C1", "ebook_status": "A"},
        {"ebookno": "OTHER", "cust_code": "C2"},
    ]))
    (tmp_path / "lrpBookings.json").write_text(json.dumps([
        {"book_no": "SVMD1", "status": "A"},
    ]))
    (tmp_path / "shippingInstructions.json").write_text(json.dumps([
        {"eSINo": "SIREQ1", "bookno": "SVMD1", "custcode": "C1", "status": "S"},
    ]))
    (tmp_path / "lrpBl.json").write_text(json.dumps([
        {"bl_no": "BL1", "book_no": "SVMD1", "status": "I"},
    ]))
    (tmp_path / "vgm.json").write_text(json.dumps([
        {"id": 1, "book_no": "SVMD1", "eqpid": "AASU1", "status": "A"},
    ]))
    (tmp_path / "invoices.json").write_text(json.dumps([
        {"invno": "INV1", "custcode": "C1", "invamount": 100},
    ]))
    (tmp_path / "arrivalNotices.json").write_text(json.dumps([
        {"arrivalnoticeno": "AN1"},
    ]))
    (tmp_path / "deliveryOrderVersions.json").write_text(json.dumps([
        {"delordno": "DO1", "versionNo": 1},
    ]))
    return FixtureRepository(tmp_path)


def _ctx(repo, user=None) -> ActionContext:
    u = user or _user()
    return ActionContext(repo=repo, user=u, customer=customer_for(u))


# ── the envelope contract ─────────────────────────────────────────────────


def _assert_valid(result: ActionResult) -> None:
    assert isinstance(result, ActionResult)
    assert result.outcome in set(Outcome)
    assert result.message_key in known_keys(), result.message_key
    rendered = render(result.message_key, result.message_args)
    assert rendered and "{" not in rendered, rendered
    payload = result.for_model()
    assert payload["action"] and payload["outcome"] and payload["message"]
    if result.outcome is not Outcome.SUCCESS:
        assert not result.data, "failures must not carry a data payload"
    if result.outcome is Outcome.MISSING_INFO:
        assert result.missing_slots


@pytest.mark.parametrize("action", sorted(HANDLERS))
def test_every_action_returns_a_valid_envelope_on_success(action, repo):
    args = {
        "get_booking": {"booking_id": "BKON1"},
        "get_customer_statement": {"invoice_no": "INV1"},
        "list_shipping_instructions": {},
        "list_vgm": {},
    }.get(action, {})
    _assert_valid(run_action(_ctx(repo), action, args))


@pytest.mark.parametrize("action", sorted(HANDLERS))
def test_every_action_is_not_allowed_without_capability(action, repo):
    ctx = _ctx(repo, _user(caps=[]))
    result = run_action(ctx, action, {"booking_id": "BKON1", "invoice_no": "INV1"})
    _assert_valid(result)
    assert result.outcome is Outcome.NOT_ALLOWED


@pytest.mark.parametrize("action", sorted(HANDLERS))
def test_every_action_errors_cleanly_when_the_data_source_is_down(action):
    ctx = ActionContext(repo=ApiRepository("http://x"), user=_user(), customer="C1")
    result = run_action(ctx, action, {"booking_id": "B", "invoice_no": "I"})
    _assert_valid(result)
    assert result.outcome is Outcome.ERROR
    assert result.retryable


# ── each remaining outcome, on the handlers that can produce it ───────────


def test_success_carries_data_and_a_citation(repo):
    r = run_action(_ctx(repo), "get_booking", {"booking_id": "BKON1"})
    assert r.outcome is Outcome.SUCCESS and r.ok
    assert r.data["record"]["ebookno"] == "BKON1"
    assert r.data["namespace"] == "portal booking request"
    assert r.citations and r.citations[0].route.startswith("/app/")


def test_not_found_for_an_unknown_reference(repo):
    r = run_action(_ctx(repo), "get_booking", {"booking_id": "NOPE"})
    _assert_valid(r)
    assert r.outcome is Outcome.NOT_FOUND


def test_not_allowed_when_the_record_belongs_to_another_customer(repo):
    r = run_action(_ctx(repo), "get_booking", {"booking_id": "OTHER"})
    _assert_valid(r)
    assert r.outcome is Outcome.NOT_ALLOWED
    assert "another customer" in r.for_model()["message"]


def test_missing_info_names_the_slot_to_ask_for(repo):
    r = run_action(_ctx(repo), "get_booking", {})
    _assert_valid(r)
    assert r.outcome is Outcome.MISSING_INFO
    assert r.missing_slots == ["booking number"]


def test_wrong_state_explains_the_portal_to_carrier_gap(repo):
    r = run_action(_ctx(repo), "list_shipping_instructions", {"booking_id": "BKON1"})
    _assert_valid(r)
    assert r.outcome is Outcome.WRONG_STATE
    msg = r.for_model()["message"]
    assert "carrier booking number" in msg
    assert not r.data, "must not look like an empty result set"


def test_carrier_booking_does_reach_its_documents(repo):
    r = run_action(_ctx(repo), "list_shipping_instructions", {"booking_id": "SVMD1"})
    assert r.outcome is Outcome.SUCCESS
    assert r.data["items"][0]["eSINo"] == "SIREQ1"


def test_empty_result_is_success_not_not_found(repo):
    """Nothing matching is a successful empty list, not a missing record."""
    ctx = _ctx(repo, _user(tenant="C-NONE"))
    r = run_action(ctx, "list_bookings", {})
    assert r.outcome is Outcome.SUCCESS
    assert r.data["items"] == []
    assert "No " in r.for_model()["message"]


# ── scoping ───────────────────────────────────────────────────────────────


def test_admin_is_unscoped_and_sees_every_customer(repo):
    admin = _user(role="ADMIN", tenant="C1")
    assert customer_for(admin) is None
    r = run_action(_ctx(repo, admin), "list_bookings", {})
    assert r.meta["total_in_sample"] == 2


def test_customer_only_sees_their_own(repo):
    r = run_action(_ctx(repo, _user(tenant="C1")), "list_bookings", {})
    assert r.meta["total_in_sample"] == 1


def test_impersonator_is_unscoped():
    assert customer_for(_user(is_impersonating=True)) is None


# ── registry hygiene ──────────────────────────────────────────────────────


def test_unknown_action_is_an_error_outcome_not_an_exception(repo):
    r = run_action(_ctx(repo), "no_such_action", {})
    assert r.outcome is Outcome.ERROR
    assert not has_handler("no_such_action")


def test_handler_exceptions_become_error_outcomes(repo, monkeypatch):
    def boom(ctx, args):
        raise RuntimeError("kaboom")

    monkeypatch.setitem(HANDLERS, "get_booking", boom)
    r = run_action(_ctx(repo), "get_booking", {"booking_id": "BKON1"})
    assert r.outcome is Outcome.ERROR


def test_results_are_sampling_honest(repo):
    r = run_action(_ctx(repo), "list_bookings", {})
    assert r.meta.get("sampled") is True
    assert "sample" in r.for_model()["message"]

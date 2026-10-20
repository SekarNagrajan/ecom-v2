# Created by Sekar Nagarajan (2026-10-21 01:05)
"""Normalisation, fixture store, scoping and the two booking namespaces."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from app.repositories.base import (
    ApiRepository,
    FixtureRepository,
    RepositoryError,
    build_repository,
)
from app.repositories.links import (
    ChainUnavailable,
    Namespace,
    container_ids_for_carrier_booking,
    documents_for_booking,
    resolve_booking,
)
from app.repositories.normalize import Row, as_id, clean, fold

FIXTURES = Path(__file__).resolve().parents[2] / "ecom-portal/src/mocks/fixtures"
needs_fixtures = pytest.mark.skipif(
    not FIXTURES.is_dir(), reason="portal fixtures not checked out"
)


# ── normalize ─────────────────────────────────────────────────────────────


def test_row_reads_every_spelling_of_the_customer_key():
    """cust_code / custcode / CustCode / customerCode are one column."""
    for spelling in ("cust_code", "custcode", "CustCode", "customerCode"):
        row = Row({spelling: "C1"})
        for lookup in ("cust_code", "custcode", "CustCode", "customerCode"):
            assert row[lookup] == "C1", f"{spelling} not readable as {lookup}"


def test_row_reads_si_number_spellings():
    for spelling in ("eSINo", "eSIno", "esino"):
        assert Row({spelling: "SIREQ1"})["eSINo"] == "SIREQ1"


def test_clean_strips_padding_and_null_sentinels():
    assert clean("DDA  ") == "DDA"
    assert clean("null") is None and clean("undefined") is None
    assert clean("None") is None and clean("") is None
    assert clean(0) == 0 and clean(False) is False  # real falsy values survive


def test_as_id_normalises_int_str_drift():
    assert as_id(42) == as_id("42") == as_id(" 42 ") == "42"
    assert as_id(42.0) == "42"
    assert as_id(None) is None and as_id("null") is None


def test_fold_collapses_separators_and_case():
    assert fold("cust_code") == fold("CustCode") == fold("custcode") == "custcode"


def test_row_keeps_original_keys_and_projects_only_present_fields():
    row = Row({"Ebookno": "B1", "empty": "null"})
    assert list(row) == ["Ebookno", "empty"]
    assert row.project(["ebookno", "empty", "absent"]) == {"ebookno": "B1"}


def test_row_missing_key_raises():
    with pytest.raises(KeyError):
        Row({"a": 1})["nope"]


# ── store / repository ────────────────────────────────────────────────────


def test_store_matches_across_padding_and_type_drift(tmp_path: Path):
    (tmp_path / "bookings.json").write_text(
        json.dumps([
            {"ebookno": "B1 ", "cust_code": 20001374},
            {"ebookno": "B2", "cust_code": "X"},
        ])
    )
    repo = FixtureRepository(tmp_path)
    assert repo.get("portal_booking", "B1", customer=None) is not None
    # int customer in data, str customer from the session
    assert repo.get("portal_booking", "B1", customer="20001374") is not None


def test_repository_scopes_reads_to_the_owning_customer(tmp_path: Path):
    (tmp_path / "bookings.json").write_text(
        json.dumps([
            {"ebookno": "MINE", "cust_code": "C1"},
            {"ebookno": "THEIRS", "cust_code": "C2"},
        ])
    )
    repo = FixtureRepository(tmp_path)
    assert repo.get("portal_booking", "THEIRS", customer="C1") is None
    assert repo.get("portal_booking", "MINE", customer="C1") is not None
    assert repo.list("portal_booking", customer="C1").total == 1
    assert repo.list("portal_booking", customer=None).total == 2
    # exists() ignores scope so the caller can tell "not yours" from "no such"
    assert repo.exists("portal_booking", "THEIRS") is True


def test_repository_paginates_and_caps_limit(tmp_path: Path):
    (tmp_path / "bookings.json").write_text(
        json.dumps([{"ebookno": f"B{i}"} for i in range(50)])
    )
    repo = FixtureRepository(tmp_path)
    page = repo.list("portal_booking", customer=None, offset=10, limit=5)
    assert page.total == 50 and page.returned == 5
    assert page.rows[0].id_of("ebookno") == "B10"
    assert repo.list("portal_booking", customer=None, limit=9999).returned == 50


def test_unknown_entity_raises_repository_error(tmp_path: Path):
    with pytest.raises(RepositoryError):
        FixtureRepository(tmp_path).get("nope", "1", customer=None)


def test_missing_fixtures_directory_yields_empty_not_crash(tmp_path: Path):
    repo = FixtureRepository(tmp_path / "absent")
    assert repo.list("portal_booking", customer=None).total == 0


def test_api_repository_fails_loudly_instead_of_returning_empty():
    repo = ApiRepository("http://backend")
    with pytest.raises(RepositoryError) as exc:
        repo.list("portal_booking", customer=None)
    assert exc.value.code == "DATA_SOURCE_UNAVAILABLE"


def test_build_repository_selects_by_data_source(tmp_path: Path):
    assert build_repository("mock", fixtures_root=tmp_path, api_base_url="x").source == "mock"
    assert build_repository("api", fixtures_root=tmp_path, api_base_url="x").source == "api"


# ── the two namespaces ────────────────────────────────────────────────────


def _two_namespace_repo(tmp_path: Path) -> FixtureRepository:
    (tmp_path / "bookings.json").write_text(
        json.dumps([{"ebookno": "BKON1", "cust_code": "C1", "extBookNo": None}])
    )
    (tmp_path / "lrpBookings.json").write_text(
        json.dumps([{"book_no": "SVMD1", "status": "A"}])
    )
    (tmp_path / "shippingInstructions.json").write_text(
        json.dumps([{"eSINo": "SIREQ1", "bookno": "SVMD1", "custcode": "C1"}])
    )
    (tmp_path / "lrpBookingCargo.json").write_text(
        json.dumps([{"book_no": "SVMD1", "eqpId": "AASU1205200"}])
    )
    return FixtureRepository(tmp_path)


def test_resolve_booking_finds_both_namespaces(tmp_path: Path):
    repo = _two_namespace_repo(tmp_path)
    assert resolve_booking(repo, "BKON1", customer=None).namespace is Namespace.PORTAL
    assert resolve_booking(repo, "SVMD1", customer=None).namespace is Namespace.CARRIER
    assert resolve_booking(repo, "ZZZ", customer=None) is None
    assert resolve_booking(repo, "", customer=None) is None


def test_portal_booking_cannot_reach_its_documents(tmp_path: Path):
    """The gap is real: extBookNo is null, so the chain must be explained."""
    repo = _two_namespace_repo(tmp_path)
    match = resolve_booking(repo, "BKON1", customer=None)
    result = documents_for_booking(
        repo, match, "shipping_instruction", customer=None
    )
    assert isinstance(result, ChainUnavailable)
    assert "carrier booking number" in result.reason


def test_carrier_booking_reaches_its_documents(tmp_path: Path):
    repo = _two_namespace_repo(tmp_path)
    match = resolve_booking(repo, "SVMD1", customer=None)
    page = documents_for_booking(repo, match, "shipping_instruction", customer=None)
    assert not isinstance(page, ChainUnavailable)
    assert page.total == 1


def test_documents_for_unsupported_entity_raises(tmp_path: Path):
    repo = _two_namespace_repo(tmp_path)
    match = resolve_booking(repo, "SVMD1", customer=None)
    with pytest.raises(ValueError):
        documents_for_booking(repo, match, "invoice", customer=None)


def test_container_ids_come_from_eqp_id_not_the_placeholder_column(tmp_path: Path):
    repo = _two_namespace_repo(tmp_path)
    assert container_ids_for_carrier_booking(repo, "SVMD1") == ["AASU1205200"]


# ── against the real committed fixtures ───────────────────────────────────


@needs_fixtures
def test_real_fixtures_load_every_entity():
    repo = FixtureRepository(FIXTURES)
    for entity in ("portal_booking", "carrier_booking", "shipping_instruction",
                   "bill_of_lading", "vgm", "invoice", "receipt"):
        assert repo.list(entity, customer=None, limit=1).total > 0, entity


@needs_fixtures
def test_real_portal_booking_still_has_no_document_chain():
    """Guards the finding: if production ever populates extBookNo, this fails."""
    repo = FixtureRepository(FIXTURES)
    booking = repo.list("portal_booking", customer=None, limit=1).rows[0]
    match = resolve_booking(repo, booking.id_of("ebookno"), customer=None)
    assert match.namespace is Namespace.PORTAL
    assert isinstance(
        documents_for_booking(repo, match, "shipping_instruction", customer=None),
        ChainUnavailable,
    )

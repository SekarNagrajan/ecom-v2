# Created by Sekar Nagarajan (2026-10-21 02:25)
"""Run every YAML scenario against the fixture repository.

Each case pins an action + arguments + capabilities to an expected outcome,
so the six-outcome contract is enforced as data rather than as hand-written
assertions per handler. `evals/run.py --scenarios` scores the same files
against a live service.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
import yaml

from app.actions.context import ActionContext, customer_for
from app.actions.registry import run_action
from app.models.chat import UserContext
from app.repositories.base import FixtureRepository
from app.responses.messages import known_keys, render
from app.responses.schema import Outcome

SCENARIO_DIR = Path(__file__).parent / "scenarios"


def load_cases() -> list[tuple[str, dict]]:
    out: list[tuple[str, dict]] = []
    for path in sorted(SCENARIO_DIR.glob("*.yaml")):
        doc = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        for case in doc.get("cases", []):
            out.append((f"{path.stem}:{case['id']}", case))
    return out


CASES = load_cases()


@pytest.fixture(scope="module")
def repo(tmp_path_factory) -> FixtureRepository:
    """A tiny, fully-known dataset the scenarios are written against."""
    root = tmp_path_factory.mktemp("fixtures")
    tables = {
        "bookings": [
            {"ebookno": "BKON1", "cust_code": "C1", "ebook_status": "A"},
            {"ebookno": "OTHER", "cust_code": "C2"},
        ],
        "lrpBookings": [{"book_no": "SVMD1", "status": "A"}],
        "shippingInstructions": [
            {"eSINo": "SIREQ1", "bookno": "SVMD1", "custcode": "C1"}
        ],
        "lrpBl": [{"bl_no": "BL1", "book_no": "SVMD1"}],
        "vgm": [{"id": 1, "book_no": "SVMD1", "eqpid": "AASU1"}],
        "invoices": [{"invno": "INV1", "custcode": "C1", "invamount": 100}],
        "arrivalNotices": [{"arrivalnoticeno": "AN1"}],
        "deliveryOrderVersions": [{"delordno": "DO1"}],
    }
    for name, rows in tables.items():
        (root / f"{name}.json").write_text(json.dumps(rows), encoding="utf-8")
    return FixtureRepository(root)


def test_scenario_files_are_well_formed():
    assert CASES, "no scenario cases discovered"
    seen: set[str] = set()
    for name, case in CASES:
        assert case["action"], name
        assert case["expect_outcome"] in set(Outcome), name
        assert name not in seen, f"duplicate scenario id {name}"
        seen.add(name)


def test_scenarios_cover_every_outcome():
    """The suite must exercise all six outcomes, not just the easy ones."""
    covered = {c["expect_outcome"] for _, c in CASES}
    # ERROR is covered by tests/test_actions.py via the ApiRepository path.
    expected = {o.value for o in Outcome} - {Outcome.ERROR.value}
    assert expected <= covered, f"outcomes never exercised: {expected - covered}"


@pytest.mark.parametrize("name,case", CASES, ids=[n for n, _ in CASES])
def test_scenario(name: str, case: dict, repo: FixtureRepository):
    user = UserContext(
        user_id="u1",
        tenant_code=case.get("tenant", "C1"),
        capabilities=list(case.get("capabilities", [])),
        authenticated=True,
    )
    ctx = ActionContext(repo=repo, user=user, customer=customer_for(user))
    result = run_action(ctx, case["action"], case.get("args") or {})

    assert result.outcome.value == case["expect_outcome"], (
        f"{name}: expected {case['expect_outcome']}, got {result.outcome.value} "
        f"({result.for_model()['message']})"
    )

    # The envelope contract holds on every single case.
    assert result.message_key in known_keys(), name
    message = render(result.message_key, result.message_args)
    assert message and "{" not in message, name

    if expected := case.get("expect_message_contains"):
        assert expected in message, f"{name}: {message!r}"
    if expected := case.get("expect_slots"):
        assert result.missing_slots == expected, name
    if case.get("expect_no_data"):
        assert not result.data, f"{name}: must not look like an empty result"
    for key, value in (case.get("expect_data_contains") or {}).items():
        assert result.data.get(key) == value, f"{name}: data.{key}"

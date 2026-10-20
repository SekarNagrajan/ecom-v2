# Created by Sekar Nagarajan (2026-10-21 11:40)
"""Guard: no customer-like data is retrievable outside SQL mode.

The identifier patterns are DERIVED from `mock-data/runtime/` rather than
hand-written, so the guard keeps working when the demo dataset is re-dumped
with different reference-number prefixes.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

import pytest

from app.knowledge.index import GuideIndex

ROOT = Path(__file__).resolve().parents[1]
KNOWLEDGE = ROOT / "knowledge"
RUNTIME = ROOT.parent / "ecom-portal/mock-data/runtime"

EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", re.IGNORECASE)
# 7+ digits with optional separators, e.g. "+971 4 123 4567"
PHONE = re.compile(r"(?<!\d)\+?\d[\d\s().-]{7,}\d(?!\d)")

needs_runtime = pytest.mark.skipif(
    not RUNTIME.is_dir(), reason="runtime overlay not present"
)


def _rows(rel: str) -> list[dict]:
    path = RUNTIME / rel
    if not path.is_file():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return [r for r in data if isinstance(r, dict)]


def observed_reference_patterns() -> list[re.Pattern[str]]:
    """Build identifier regexes from the shapes actually present in the data.

    Collects values of the reference-number columns, reduces each to its
    alphabetic prefix + digit length, and keeps prefixes seen more than once
    so a one-off oddity does not become a rule.
    """
    values: list[str] = []
    for rel, field in (
        ("bookings.json", "ebookno"),
        ("bookings.json", "extBookNo"),
        ("si/shippingInstructions.json", "eSINo"),
        ("si/shippingInstructions.json", "blno"),
    ):
        values += [
            str(r[field]).strip()
            for r in _rows(rel)
            if r.get(field) and isinstance(r[field], str | int)
        ]

    shapes = Counter()
    for value in values:
        m = re.fullmatch(r"([A-Za-z]{2,})(\d{3,})", value)
        if m:
            shapes[(m.group(1).upper(), len(m.group(2)))] += 1

    return [
        re.compile(rf"\b{prefix}\d{{{digits}}}\b", re.IGNORECASE)
        for (prefix, digits), count in shapes.items()
        if count > 1
    ]


@needs_runtime
def test_reference_patterns_are_actually_derived():
    patterns = observed_reference_patterns()
    assert patterns, "expected to derive at least one reference-number shape"
    # Sanity: a known runtime booking must match one of them.
    assert any(p.search("BKON260016") for p in patterns)


def _non_sql_chunks() -> list[dict]:
    return [c for c in GuideIndex(KNOWLEDGE).chunks if c["module"] != "sql"]


@needs_runtime
def test_no_customer_reference_numbers_outside_sql_mode():
    patterns = observed_reference_patterns()
    offenders: list[tuple[str, str]] = []
    for chunk in _non_sql_chunks():
        for pattern in patterns:
            found = pattern.search(chunk["text"])
            if found:
                offenders.append((chunk["id"], found.group(0)))
                break
    assert not offenders, (
        "booking/SI/B-L style reference numbers are retrievable outside SQL "
        f"mode: {offenders[:10]}"
    )


def test_no_email_addresses_outside_sql_mode():
    offenders = [
        (c["id"], EMAIL.search(c["text"]).group(0))
        for c in _non_sql_chunks()
        if EMAIL.search(c["text"])
    ]
    assert not offenders, f"e-mail addresses are retrievable: {offenders[:10]}"


def test_no_phone_numbers_outside_sql_mode():
    offenders = [
        (c["id"], PHONE.search(c["text"]).group(0))
        for c in _non_sql_chunks()
        if PHONE.search(c["text"])
    ]
    assert not offenders, f"phone numbers are retrievable: {offenders[:10]}"


def test_every_chunk_has_a_known_kind():
    from app.knowledge.index import KINDS

    bad = [
        (c["id"], c.get("kind"))
        for c in GuideIndex(KNOWLEDGE).chunks
        if c.get("kind") not in KINDS
    ]
    assert not bad, f"chunks with an unknown kind: {bad[:10]}"


def test_fixture_digests_carry_the_disclaimer():
    fixtures = [c for c in GuideIndex(KNOWLEDGE).chunks if c["kind"] == "fixture"]
    assert fixtures, "expected fixture digests to exist"
    missing = [
        c["id"] for c in fixtures
        if "never use as a customer's data" not in c["text"].lower()
        and not c["id"].endswith(":_intro")
    ]
    assert not missing, f"fixture chunks without the disclaimer: {missing[:10]}"


# ── kind filtering per mode ───────────────────────────────────────────────


def test_assistant_mode_cannot_retrieve_fixture_chunks(tmp_path: Path):
    from app.knowledge.index import GuideIndex as GI

    folder = tmp_path / "booking"
    folder.mkdir(parents=True)
    (folder / "mock-data.md").write_text(
        "# booking\n\n## booking fixture: bookings (bookings.json)\n"
        "Reference only — never use as a customer's data.\n"
        "Fields: ebookno, polPortId, podPortId\n",
        encoding="utf-8",
    )
    (folder / "howto.md").write_text(
        "# booking\n\n## Create a booking\nebookno polPortId podPortId steps\n"
        "\n## Parties\nshipper consignee\n\n## Cut-offs\nvgm doc cutoff\n",
        encoding="utf-8",
    )
    index = GI(tmp_path)

    everything = index.search("ebookno polPortId", k=5)
    assert any(h["kind"] == "fixture" for h in everything)

    filtered = index.search("ebookno polPortId", k=5,
                            exclude_kinds=frozenset({"fixture"}))
    assert filtered, "excluding fixtures must not empty the result"
    assert all(h["kind"] != "fixture" for h in filtered)


async def test_server_tool_excludes_fixtures_per_mode(app):
    """assistant/docs never see fixture chunks; sql may."""
    from app.tools.server_tools import run_server_tool

    args = {"query": "fixture fields record count"}
    for mode in ("assistant", "docs", "automation"):
        res = await run_server_tool("search_portal_guide", args, app.state, mode=mode)
        kinds = {r.get("kind") for r in res["results"]}
        assert "fixture" not in kinds, f"{mode} retrieved a fixture chunk"

    res = await run_server_tool("search_portal_guide", args, app.state, mode="sql")
    assert isinstance(res["results"], list)  # sql is permitted fixtures


def test_include_samples_writes_only_to_sql(tmp_path: Path):
    import sys

    sys.path.insert(0, str(ROOT / "scripts"))
    from ingest_ecom_mocks import ingest

    src = tmp_path / "mocks"
    (src / "fixtures").mkdir(parents=True)
    (src / "fixtures" / "ports.json").write_text(
        '[{"portcode": "SGSIN", "portname": "SINGAPORE"}]'
    )
    out = tmp_path / "knowledge"

    ingest(src, out, include_samples=False)
    assert not (out / "sql" / "fixtures.md").exists()
    assert "SGSIN" not in (out / "_shared" / "mock-data.md").read_text()

    ingest(src, out, include_samples=True)
    samples = (out / "sql" / "fixtures.md").read_text()
    assert "SGSIN" in samples
    # The non-sql digest still carries no sample rows.
    assert "SGSIN" not in (out / "_shared" / "mock-data.md").read_text()

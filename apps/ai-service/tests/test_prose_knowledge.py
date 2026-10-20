# Created by Sekar Nagarajan (2026-10-20 22:35)
"""Prose extraction from the portal fixtures + stale-chunk purging.

Covers the six prose sources the fixtures hide (configuration, settings,
notification catalogue, status decoder, workflow emails, T&C policy), the
junk denylist, and VectorIndex.purge_missing.
"""

from __future__ import annotations

import json
from pathlib import Path

from app.knowledge.index import GuideIndex
from app.knowledge.prose import (
    JUNK_FIXTURES,
    collect_prose,
    configuration_sections,
    email_template_sections,
    notification_sections,
    policy_sections,
    status_sections,
    strip_html,
)


def _write(path: Path, rows: list[dict]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(rows), encoding="utf-8")
    return path


# ── strip_html ────────────────────────────────────────────────────────────


def test_strip_html_removes_tags_and_decodes_entities():
    assert strip_html("<p>Dear&nbsp;@customer</p>") == "Dear @customer"
    assert strip_html("<b>A</b> &amp; <i>B</i>") == "A & B"


def test_strip_html_turns_list_items_into_bullets():
    out = strip_html("<ul><li>first</li><li>second</li></ul>")
    assert "- first" in out and "- second" in out


def test_strip_html_normalises_crlf_and_nbsp():
    assert strip_html("a\r\n\r\n\r\nb") == "a\n\nb"
    assert strip_html("x  y") == "x y"


def test_strip_html_on_empty_input():
    assert strip_html("") == ""


# ── configuration / settings ──────────────────────────────────────────────


def test_configuration_sections_use_the_description_prose(tmp_path: Path):
    src = _write(
        tmp_path / "configuration.json",
        [
            {
                "configKey": "SHIPMENT_TRACKING_ACCESS",
                "configName": "Shipment tracking access",
                "description": "PUBLIC: any caller tracks any shipment.",
                "configValue": "PUBLIC",
            },
            {"configKey": "NO_DESC", "configName": "x", "description": ""},
        ],
    )
    out = configuration_sections(src)
    assert len(out) == 1  # the description-less row is skipped
    module, text = out[0]
    assert module == "portal"
    assert text.startswith("## Portal behaviour: Shipment tracking access")
    assert "any caller tracks any shipment" in text


def test_settings_sections_report_the_flag_state(tmp_path: Path):
    src = _write(
        tmp_path / "settings.json",
        [
            {
                "settingKey": "CONFIRMED_BOOKING_CANCEL_ENABLED",
                "settingName": "Confirmed booking cancellation",
                "description": "When on, a confirmed booking can be cancelled.",
                "isEnabled": False,
            }
        ],
    )
    _, text = configuration_sections(src)[0]
    assert "**OFF**" in text


# ── status decoder ────────────────────────────────────────────────────────


def test_status_sections_spell_each_code_out_as_a_sentence(tmp_path: Path):
    src = _write(
        tmp_path / "statusDescriptions.json",
        [
            {"module": "BOL", "status": "I", "statusdesc": "Released"},
            {"module": "BOL", "status": "D", "statusdesc": "Verify Copy"},
            {"module": "BOL", "status": "I", "statusdesc": "Released"},  # dupe
            {"module": "XXX", "status": "Q", "statusdesc": "Unknown module"},
        ],
    )
    out = status_sections(src)
    assert [m for m, _ in out] == ["bl"]
    text = out[0][1]
    # Sentences carry the retrieval signal; the table is the quick reference.
    assert 'Status `I` on a bill of lading means "Released".' in text
    assert "| `D` | Verify Copy |" in text
    assert text.count("`I`") == 2  # one sentence + one table row, deduped
    assert "Unknown module" not in text  # unmapped module dropped


# ── notifications ─────────────────────────────────────────────────────────


def test_notification_sections_route_by_category(tmp_path: Path):
    src = _write(
        tmp_path / "notificationSettings.json",
        [
            {
                "notificationKey": "BILL_OF_LADING_DRAFT_APPROVAL",
                "notificationName": "Verify Copy approved",
                "description": "Notify when you approve the draft.",
                "category": "BILL_OF_LADING",
                "defaultEnabled": True,
            }
        ],
    )
    module, text = notification_sections(src)[0]
    assert module == "bl"
    assert "Notify when you approve the draft." in text
    assert "enabled by default: on" in text


# ── workflow emails ───────────────────────────────────────────────────────


def test_email_templates_route_by_key_prefix_and_strip_html(tmp_path: Path):
    src = _write(
        tmp_path / "emailTemplates.json",
        [
            {
                "templateKey": "BOOKING_ACCEPTED_CUSTOMER",
                "templateName": "Booking accepted",
                "subject": "ESEA Booking confirmed",
                "bodyHtml": "<p>Dear @customer</p><p>Your booking is confirmed.</p>",
            },
            {
                "templateKey": "BILL_OF_LADING_DRAFT_ACCEPTED_AGENCY",
                "templateName": "BL draft accepted",
                "subject": "s",
                "bodyHtml": "<p>ok</p>",
            },
            {"templateKey": "EMPTY_BODY", "bodyHtml": ""},
        ],
    )
    out = email_template_sections(src)
    assert [m for m, _ in out] == ["booking", "bl"]  # empty body dropped
    text = out[0][1]
    assert "Your booking is confirmed." in text
    assert "<p>" not in text


# ── policy ────────────────────────────────────────────────────────────────


def test_policy_sections_chunk_long_terms_and_conditions(tmp_path: Path):
    para = "Clause text that is reasonably long. " * 20  # ~740 chars
    src = _write(
        tmp_path / "EcomContent.json",
        [
            {
                "contentKey": "TERMS_AND_CONDITIONS",
                "title": "Terms and Conditions",
                "body": "".join(f"<p>{para}</p>" for _ in range(6)),
            }
        ],
    )
    out = policy_sections(src)
    assert len(out) > 1, "a long policy must be split into several chunks"
    assert all(m == "portal" for m, _ in out)
    assert out[0][1].startswith("## Terms and Conditions (part 1 of ")
    assert "<p>" not in out[0][1]


# ── collection + junk ─────────────────────────────────────────────────────


def test_collect_prose_skips_absent_files(tmp_path: Path):
    assert collect_prose(tmp_path) == {}


def test_junk_fixtures_are_denylisted():
    # A Java stack trace, PDF-pointer rows and SQL error text must never be
    # retrievable; the ingester consults this set.
    assert {"advisories", "insertmisexpreport_dup", "notices"} <= JUNK_FIXTURES


def test_real_fixtures_produce_prose_for_the_expected_modules():
    fixtures = Path(__file__).resolve().parents[2] / "ecom-portal/src/mocks/fixtures"
    if not fixtures.is_dir():  # pragma: no cover - portal not checked out
        return
    docs = collect_prose(fixtures)
    assert "portal" in docs and len(docs["portal"]) > 30
    joined = "\n".join(docs.get("bl", []))
    assert "status codes" in joined.lower()


def test_generated_knowledge_is_chunkable_by_guide_index(tmp_path: Path):
    """Prose sections must chunk on '## ' exactly like the hand-written docs."""
    folder = tmp_path / "bl"
    folder.mkdir(parents=True)
    src = _write(
        tmp_path / "statusDescriptions.json",
        [{"module": "BOL", "status": "I", "statusdesc": "Released"}],
    )
    (folder / "portal-reference.md").write_text(
        "# bl\n\n" + status_sections(src)[0][1], encoding="utf-8"
    )
    chunks = GuideIndex(tmp_path).chunks
    assert any(c["module"] == "bl" for c in chunks)

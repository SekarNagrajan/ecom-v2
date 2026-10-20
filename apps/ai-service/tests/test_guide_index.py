# Modified by Sekar Nagarajan (2026-10-20 16:45)
from __future__ import annotations

from pathlib import Path

from app.knowledge.index import GuideIndex

ROOT = Path(__file__).resolve().parents[1] / "knowledge"


def test_guide_index_loads_phase2_corpus():
    guide = GuideIndex(ROOT)
    assert guide.ready
    modules = {c["module"] for c in guide.chunks}
    for expected in (
        "_shared",
        "booking",
        "tracking",
        "schedules",
        "rates",
        "shipping-instruction",
        "bl",
        "vgm",
        "cro",
        "delivery-order",
        "arrival-notice",
        "carbon",
    ):
        assert expected in modules, f"missing module {expected}"


def test_guide_search_booking_howto():
    guide = GuideIndex(ROOT)
    hits = guide.search("create a booking", module="booking", k=4)
    assert hits
    joined = " ".join(h["text"].lower() for h in hits)
    assert "booking" in joined


def test_guide_search_glossary_vgm():
    guide = GuideIndex(ROOT)
    hits = guide.search("verified gross mass", module="_shared", k=4)
    assert hits
    assert any("vgm" in h["text"].lower() for h in hits)

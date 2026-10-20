# Created by Sekar Nagarajan (2026-10-20 17:35)
"""Hybrid retriever fusion + ecom portal mock ingestion parsing (offline)."""

from __future__ import annotations

from pathlib import Path

import sys

from app.knowledge.index import GuideIndex
from app.knowledge.retriever import HybridRetriever

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from ingest_ecom_mocks import fixture_module, ingest  # noqa: E402


class FakeVector:
    ready = True

    def __init__(self, hits):
        self._hits = hits

    def search(self, query, module=None, k=6):
        return self._hits[:k]


def test_fixture_module_mapping():
    assert fixture_module("bookingCargo") == "booking"
    assert fixture_module("siDg") == "shipping-instruction"
    assert fixture_module("lrpBl") == "bl"
    assert fixture_module("arrivalNotices") == "arrival-notice"
    assert fixture_module("portCountryMap") == "_shared"
    assert fixture_module("EcomContent") == "portal"


def test_ingest_writes_module_docs(tmp_path: Path):
    src = tmp_path / "mocks"
    (src / "fixtures").mkdir(parents=True)
    (src / "fixtures" / "bookings.json").write_text(
        '[{"bookingNo": "BKG001", "polPortId": "SGSIN", "podPortId": "NLRTM"}]'
    )
    (src / "tracking.handlers.ts").write_text(
        'export const trackingHandlers = [http.get("/api/tracking/search", h)];'
    )
    out = tmp_path / "knowledge"
    counts = ingest(src, out)
    assert counts == {"booking": 1, "tracking": 1}
    doc = (out / "booking" / "mock-data.md").read_text()
    assert "## booking fixture: bookings" in doc and "BKG001" in doc
    tdoc = (out / "tracking" / "mock-data.md").read_text()
    assert "GET /api/tracking/search" in tdoc

    # GuideIndex chunks the generated docs per section, tagged by module
    guide = GuideIndex(out)
    hits = guide.search("booking SGSIN NLRTM record", module="booking")
    assert hits and hits[0]["module"] == "booking"


def test_hybrid_fusion_prefers_agreement(tmp_path: Path):
    root = tmp_path / "k"
    (root / "m").mkdir(parents=True)
    (root / "m" / "howto.md").write_text(
        "# t\n\n## alpha\nbooking cutoff rules\n\n## beta\nvgm submission steps\n"
    )
    bm25 = GuideIndex(root)
    both = bm25.search("vgm submission", k=4)
    assert both
    vector = FakeVector([{"id": both[0]["id"], "module": "m", "text": both[0]["text"]}])
    retriever = HybridRetriever(bm25, vector)
    fused = retriever.search("vgm submission", k=2)
    assert fused[0]["id"] == both[0]["id"]  # agreed-on chunk ranks first
    assert retriever.vector_ready


def test_hybrid_falls_back_to_bm25_without_vector(tmp_path: Path):
    root = tmp_path / "k"
    (root / "m").mkdir(parents=True)
    (root / "m" / "howto.md").write_text(
        "# t\n\n## alpha\ncarbon estimate steps\n\n## beta\nbooking cutoff rules\n"
    )
    retriever = HybridRetriever(GuideIndex(root), None)
    assert not retriever.vector_ready
    assert retriever.search("carbon")[0]["module"] == "m"

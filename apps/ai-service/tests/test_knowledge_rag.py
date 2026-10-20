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
    # CATALOG data is embeddable…
    (src / "fixtures" / "ports.json").write_text(
        '[{"portcode": "SGSIN", "portname": "SINGAPORE", "countrycode": "SG"}]'
    )
    (src / "tracking.handlers.ts").write_text(
        'export const trackingHandlers = [http.get("/api/tracking/search", h)];'
    )
    out = tmp_path / "knowledge"
    counts = ingest(src, out)
    assert counts == {"_shared": 1, "tracking": 1}
    doc = (out / "_shared" / "mock-data.md").read_text()
    # Phase 2: digests carry the field glossary and the disclaimer, never
    # sample row values (those go to knowledge/sql/fixtures.md on request).
    assert "## _shared fixture: ports" in doc
    assert "Fields: portcode, portname" in doc
    assert "never use as a customer's data" in doc
    assert "SGSIN" not in doc
    tdoc = (out / "tracking" / "mock-data.md").read_text()
    assert "GET /api/tracking/search" in tdoc

    # GuideIndex chunks the generated docs per section, tagged by module
    guide = GuideIndex(out)
    hits = guide.search("ports portcode portname fixture", module="_shared")
    assert hits and hits[0]["module"] == "_shared"


def test_transactional_fixtures_are_never_embedded(tmp_path: Path):
    """Per-customer records must stay out of the vector store.

    A semantic search over bookings would surface one customer's shipment to
    another; those rows are reachable only by exact id via repositories.
    """
    src = tmp_path / "mocks"
    (src / "fixtures").mkdir(parents=True)
    for name, payload in [
        ("bookings.json", '[{"ebookno": "BKON1", "cust_code": "C1"}]'),
        ("shippingInstructions.json", '[{"eSINo": "SIREQ1"}]'),
        ("invoices.json", '[{"invno": "INV1", "invamount": 999}]'),
        ("ports.json", '[{"portcode": "SGSIN", "portname": "SINGAPORE"}]'),
    ]:
        (src / "fixtures" / name).write_text(payload)

    out = tmp_path / "knowledge"
    counts = ingest(src, out)
    assert counts == {"_shared": 1}, counts  # only the port catalogue survives

    corpus = "\n".join(
        p.read_text() for p in out.rglob("*.md")
    )
    for leaked in ("BKON1", "SIREQ1", "INV1", "999"):
        assert leaked not in corpus, f"{leaked} leaked into the vector corpus"


def test_fixture_category_classification():
    from ingest_ecom_mocks import fixture_category

    assert fixture_category("bookings") == "TRANSACTIONAL"
    assert fixture_category("siCargo") == "TRANSACTIONAL"
    assert fixture_category("invoices") == "TRANSACTIONAL"
    assert fixture_category("ports") == "CATALOG"
    assert fixture_category("vessels") == "CATALOG"
    assert fixture_category("menuTree") == "SYSTEM"
    assert fixture_category("emailTemplates") == "SYSTEM"


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


# Added by Sekar Nagarajan (2026-10-20 22:40)
class _FakeCollection:
    """Minimal stand-in for a Chroma collection (offline)."""

    def __init__(self, ids):
        self.ids = list(ids)
        self.deleted: list[str] = []

    def get(self, include=None):
        return {"ids": list(self.ids)}

    def delete(self, ids):
        self.deleted.extend(ids)
        self.ids = [i for i in self.ids if i not in set(ids)]


def _index_with(ids):
    from app.knowledge.vector import VectorIndex

    index = VectorIndex.__new__(VectorIndex)  # bypass chromadb construction
    index._collection = _FakeCollection(ids)
    return index


def test_purge_missing_deletes_only_orphaned_chunks():
    """Upsert never removes chunks whose source section was deleted."""
    index = _index_with(["a:1", "a:2", "gone:9"])
    removed = index.purge_missing({"a:1", "a:2"})
    assert removed == 1
    assert index._collection.deleted == ["gone:9"]
    assert index._collection.ids == ["a:1", "a:2"]


def test_purge_missing_is_a_noop_when_index_matches_corpus():
    index = _index_with(["a:1"])
    assert index.purge_missing({"a:1"}) == 0
    assert index._collection.deleted == []


def test_purge_missing_without_a_collection_is_safe():
    from app.knowledge.vector import VectorIndex

    index = VectorIndex.__new__(VectorIndex)
    index._collection = None
    assert index.purge_missing({"a:1"}) == 0

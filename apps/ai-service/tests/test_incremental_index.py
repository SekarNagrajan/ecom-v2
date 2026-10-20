# Created by Sekar Nagarajan (2026-10-21 10:45)
"""Phase 1: stable chunk ids and an index that only writes what changed."""

from __future__ import annotations

from pathlib import Path

from app.knowledge.index import GuideIndex, content_hash, slug
from app.knowledge.vector import VectorIndex


class FakeCollection:
    """In-memory stand-in for a Chroma collection (CI needs no chromadb)."""

    def __init__(self, metadata=None):
        self.store: dict[str, tuple[str, dict]] = {}
        self.metadata = metadata or {}
        self.upsert_calls = 0

    def get(self, include=None):
        ids = list(self.store)
        return {
            "ids": ids,
            "metadatas": [self.store[i][1] for i in ids],
            "documents": [self.store[i][0] for i in ids],
        }

    def upsert(self, ids, documents, metadatas):
        self.upsert_calls += 1
        for cid, doc, meta in zip(ids, documents, metadatas, strict=True):
            self.store[cid] = (doc, meta)

    def delete(self, ids):
        for cid in ids:
            self.store.pop(cid, None)

    def count(self):
        return len(self.store)


def _index(collection: FakeCollection) -> VectorIndex:
    idx = VectorIndex.__new__(VectorIndex)
    idx._collection = collection
    idx._client = None
    idx.embedding_model = "test-model"
    idx.rebuilt_for_model_change = False
    return idx


def _write(root: Path, module: str, stem: str, body: str) -> Path:
    folder = root / module
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / f"{stem}.md"
    path.write_text(body, encoding="utf-8")
    return path


# ── stable ids ────────────────────────────────────────────────────────────


def test_slug_is_stable_and_bounded():
    assert slug("Create a booking") == "create-a-booking"
    assert slug("  VGM / cut-off!  ") == "vgm-cut-off"
    assert slug("###") == "section"
    assert len(slug("x" * 200)) <= 80


def test_chunk_ids_are_heading_based_not_positional(tmp_path: Path):
    _write(tmp_path, "booking", "howto",
           "# Booking\n\n## Alpha\na\n\n## Beta\nb\n")
    ids = [c["id"] for c in GuideIndex(tmp_path).chunks]
    assert ids == ["booking:howto:_intro", "booking:howto:alpha",
                   "booking:howto:beta"]


def test_inserting_a_section_does_not_renumber_the_others(tmp_path: Path):
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n\n## Beta\nb\n")
    before = {c["id"] for c in GuideIndex(tmp_path).chunks}
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n\n## Middle\nm\n\n## Beta\nb\n")
    after = {c["id"] for c in GuideIndex(tmp_path).chunks}
    assert before < after
    assert after - before == {"m:d:middle"}


def test_duplicate_headings_get_numeric_suffixes(tmp_path: Path):
    _write(tmp_path, "m", "d", "# T\n\n## Same\na\n\n## Same\nb\n\n## Same\nc\n")
    ids = [c["id"] for c in GuideIndex(tmp_path).chunks]
    assert ids[1:] == ["m:d:same", "m:d:same-2", "m:d:same-3"]


def test_content_hash_changes_only_with_content():
    a = content_hash("m", "s.md", "text")
    assert a == content_hash("m", "s.md", "text")
    assert a != content_hash("m", "s.md", "other")
    assert a != content_hash("m", "other.md", "text")


# ── incremental build ─────────────────────────────────────────────────────


def test_building_three_times_writes_nothing_after_the_first(tmp_path: Path):
    """The 'run it the nth time' requirement."""
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n\n## Beta\nb\n")
    chunks = GuideIndex(tmp_path).chunks
    idx = _index(FakeCollection())

    first = idx.build(chunks)
    assert first == {"upserted": 3, "deleted": 0, "unchanged": 0, "total": 3}
    for _ in range(2):
        again = idx.build(GuideIndex(tmp_path).chunks)
        assert again["upserted"] == 0 and again["deleted"] == 0
        assert again["unchanged"] == 3


def test_editing_one_section_upserts_exactly_one(tmp_path: Path):
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n\n## Beta\nb\n")
    idx = _index(FakeCollection())
    idx.build(GuideIndex(tmp_path).chunks)

    _write(tmp_path, "m", "d", "# T\n\n## Alpha\nEDITED\n\n## Beta\nb\n")
    stats = idx.build(GuideIndex(tmp_path).chunks)
    assert stats["upserted"] == 1 and stats["deleted"] == 0
    assert stats["unchanged"] == 2


def test_removing_a_section_deletes_exactly_one(tmp_path: Path):
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n\n## Beta\nb\n")
    idx = _index(FakeCollection())
    idx.build(GuideIndex(tmp_path).chunks)

    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n")
    stats = idx.build(GuideIndex(tmp_path).chunks)
    assert stats["deleted"] == 1 and stats["upserted"] == 0
    assert "m:d:beta" not in idx._collection.store


def test_inserting_a_section_upserts_only_that_one(tmp_path: Path):
    """Positional ids would have re-keyed every later chunk."""
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n\n## Beta\nb\n")
    idx = _index(FakeCollection())
    idx.build(GuideIndex(tmp_path).chunks)

    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n\n## Middle\nm\n\n## Beta\nb\n")
    stats = idx.build(GuideIndex(tmp_path).chunks)
    assert stats == {"upserted": 1, "deleted": 0, "unchanged": 3, "total": 4}


def test_dry_run_reports_without_writing(tmp_path: Path):
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n")
    collection = FakeCollection()
    idx = _index(collection)
    stats = idx.build(GuideIndex(tmp_path).chunks, dry_run=True)
    assert stats["upserted"] == 2
    assert collection.store == {} and collection.upsert_calls == 0


def test_build_on_a_disabled_index_is_a_noop():
    idx = VectorIndex.__new__(VectorIndex)
    idx._collection = None
    assert idx.build([{"id": "a", "text": "t", "module": "m"}])["total"] == 0


def test_metadata_carries_hash_heading_and_source(tmp_path: Path):
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\na\n")
    collection = FakeCollection()
    _index(collection).build(GuideIndex(tmp_path).chunks)
    _, meta = collection.store["m:d:alpha"]
    assert meta["heading"] == "Alpha" and meta["module"] == "m"
    assert meta["source"] == "m/d.md" and len(meta["hash"]) == 64


# ── BM25 / vector id parity ───────────────────────────────────────────────


def test_bm25_and_vector_ids_are_identical(tmp_path: Path):
    _write(tmp_path, "m", "d", "# T\n\n## Alpha\nalpha text\n\n## Beta\nbeta text\n")
    guide = GuideIndex(tmp_path)
    collection = FakeCollection()
    _index(collection).build(guide.chunks)
    assert {c["id"] for c in guide.chunks} == set(collection.store)


def test_search_results_expose_provenance(tmp_path: Path):
    """D7: a hit must say which file and heading it came from.

    Several distinct sections are needed: BM25 gives a term zero weight when
    it appears in every document, so a two-chunk corpus retrieves nothing.
    """
    _write(tmp_path, "m", "d",
           "# T\n\n## Cut-off rules\nvgm cutoff deadline rules\n"
           "\n## Parties\nshipper consignee notify\n"
           "\n## Equipment\ncontainer reefer sizes\n")
    hits = GuideIndex(tmp_path).search("vgm cutoff deadline", k=2)
    assert hits, "expected a lexical hit"
    assert hits[0]["source"] == "m/d.md"
    assert hits[0]["heading"] == "Cut-off rules"
    assert hits[0]["id"] == "m:d:cut-off-rules"

# Modified by Sekar Nagarajan (2026-10-20 14:47)
from __future__ import annotations

from app.llm.citations import CitationStream


def test_marker_split_across_one_char_chunks():
    marker = "[[cite:/app/booking|Bookings]]"
    cs = CitationStream()
    parts: list[tuple] = []
    for ch in f"See {marker} now":
        parts.extend(cs.feed(ch))
    parts.extend(cs.flush())
    texts = [p[1] for p in parts if p[0] == "text"]
    cites = [p for p in parts if p[0] == "cite"]
    assert "".join(texts) == "See  now"
    assert cites == [("cite", "/app/booking", "Bookings")]


def test_unmatched_brackets_flushed():
    cs = CitationStream()
    parts = list(cs.feed("hello [[ not a cite"))
    parts.extend(cs.flush())
    assert "".join(p[1] for p in parts if p[0] == "text") == "hello [[ not a cite"


def test_two_markers_in_one_delta():
    cs = CitationStream()
    delta = "A [[cite:/app/a|A]] and [[cite:/app/b|B]]."
    parts = list(cs.feed(delta)) + list(cs.flush())
    cites = [p for p in parts if p[0] == "cite"]
    assert cites == [
        ("cite", "/app/a", "A"),
        ("cite", "/app/b", "B"),
    ]

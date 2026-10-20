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


def test_whitespace_before_marker_dropped_when_followed_by_punctuation():
    cs = CitationStream()
    delta = "See the booking [[cite:/app/booking|Booking]]."
    parts = list(cs.feed(delta)) + list(cs.flush())
    text = "".join(p[1] for p in parts if p[0] == "text")
    # The space before the citation is dropped so the chip hugs the word and
    # the period follows immediately: "See the booking" + chip + ".".
    assert text == "See the booking."
    cites = [p for p in parts if p[0] == "cite"]
    assert cites == [("cite", "/app/booking", "Booking")]


def test_whitespace_kept_when_marker_followed_by_space():
    cs = CitationStream()
    delta = "See the booking [[cite:/app/booking|Booking]] now"
    parts = list(cs.feed(delta)) + list(cs.flush())
    text = "".join(p[1] for p in parts if p[0] == "text")
    # Non-punctuation after the marker: spacing is untouched.
    assert text == "See the booking  now"

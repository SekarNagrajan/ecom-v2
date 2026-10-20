# Modified by Sekar Nagarajan (2026-10-20 14:47)
"""Streaming [[cite:…]] marker parser (markers may split across chunks)."""

from __future__ import annotations

import re
from collections.abc import Iterator

CITE = re.compile(r"\[\[cite:(/[^|\]]{1,200})\|([^\]]{1,80})\]\]")

# Punctuation that should sit flush after a citation chip. When a marker is
# immediately followed by one of these, the whitespace before the marker is
# dropped so the chip hugs the preceding word (e.g. "departed [[cite]]." →
# "departed" + chip + ".").
_PUNCT_AFTER = frozenset(".,;:!?)]}")


class CitationStream:
    """Feed text deltas; yields ('text', str) or ('cite', route, title)."""

    def __init__(self) -> None:
        self.buf = ""

    def feed(self, delta: str) -> Iterator[tuple]:
        self.buf += delta
        while True:
            m = CITE.search(self.buf)
            if m:
                before = self.buf[: m.start()]
                # Drop the space before the marker when punctuation follows it,
                # so the citation chip hugs the word and the punctuation stays
                # attached. Only possible once the following char has arrived.
                after = self.buf[m.end()] if m.end() < len(self.buf) else ""
                if after and after in _PUNCT_AFTER:
                    before = before.rstrip()
                if before:
                    yield ("text", before)
                yield ("cite", m.group(1), m.group(2))
                self.buf = self.buf[m.end() :]
                continue
            # Hold back a possible partial marker starting with '[' or '[['
            cut = self.buf.rfind("[[")
            if cut == -1:
                cut = self.buf.rfind("[")
            if cut == -1:
                if self.buf:
                    yield ("text", self.buf)
                self.buf = ""
            else:
                if cut:
                    yield ("text", self.buf[:cut])
                self.buf = self.buf[cut:]
                if len(self.buf) > 300:
                    yield ("text", self.buf)
                    self.buf = ""
            return

    def flush(self) -> Iterator[tuple]:
        if self.buf:
            yield ("text", self.buf)
        self.buf = ""

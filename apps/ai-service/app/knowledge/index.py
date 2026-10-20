# Modified by Sekar Nagarajan (2026-10-21 11:10)
"""In-process BM25 index over knowledge/**/*.md."""

from __future__ import annotations

import hashlib
import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

_WORD = re.compile(r"[a-z0-9]+")
_SLUG_STRIP = re.compile(r"[^a-z0-9]+")

#: Section 0 of a file is its preamble, not a `## ` heading.
INTRO_SLUG = "_intro"

#: Retrieval class of a chunk. Drives what each assistant mode may see.
KINDS = frozenset(
    {"howto", "reference", "policy", "status", "glossary", "schema",
     "fixture", "faq"}
)
DEFAULT_KIND = "reference"

#: Default kind by file stem; a section may override it (see `_KIND_MARKER`).
_STEM_KIND: dict[str, str] = {
    "howto": "howto",
    "mock-data": "fixture",
    "fixtures": "fixture",
    "glossary": "glossary",
    "schema": "schema",
    "portal-reference": "reference",
}

#: `<!-- kind: policy -->` on its own line inside a section.
_KIND_MARKER = re.compile(r"<!--\s*kind:\s*([a-z]+)\s*-->", re.IGNORECASE)


def _tokenize(text: str) -> list[str]:
    return _WORD.findall(text.lower())


def slug(heading: str) -> str:
    """Stable, filesystem-safe slug from a section heading.

    Chunk ids are derived from the heading rather than the section's
    position, so inserting or reordering a section does not re-key every
    chunk after it (which would churn the whole vector index).
    """
    cleaned = _SLUG_STRIP.sub("-", heading.strip().lower()).strip("-")
    return cleaned[:80] or "section"


def content_hash(module: str, source: str, text: str) -> str:
    """Identity of a chunk's content — drives incremental upserts."""
    digest = hashlib.sha256()
    for part in (module, source, text):
        digest.update(part.encode("utf-8"))
        digest.update(b"\x1e")
    return digest.hexdigest()


class GuideIndex:
    def __init__(self, root: Path) -> None:
        self.chunks: list[dict] = []
        self._bm25 = None
        self._loaded = False
        if not root.exists():
            logger.warning("knowledge root missing: %s", root)
            return
        for md in sorted(root.rglob("*.md")):
            module = md.parent.name
            text = md.read_text(encoding="utf-8")
            source = str(md.relative_to(root))
            sections = text.split("\n## ")
            seen: dict[str, int] = {}
            for i, section in enumerate(sections):
                body = section.strip()
                if not body:
                    continue
                heading = body.split("\n", 1)[0].lstrip("# ").strip()
                marker = _KIND_MARKER.search(body)
                kind = (
                    marker.group(1).lower()
                    if marker and marker.group(1).lower() in KINDS
                    else _STEM_KIND.get(md.stem, DEFAULT_KIND)
                )
                base = INTRO_SLUG if i == 0 else slug(heading)
                # Repeated headings inside one file get -2, -3, … so ids stay
                # unique without falling back to a positional index.
                seen[base] = seen.get(base, 0) + 1
                key = base if seen[base] == 1 else f"{base}-{seen[base]}"
                self.chunks.append(
                    {
                        "id": f"{module}:{md.stem}:{key}",
                        "module": module,
                        "source": source,
                        "heading": heading,
                        "kind": kind,
                        "hash": content_hash(module, source, body),
                        "text": body,
                    }
                )
        if not self.chunks:
            return
        try:
            from rank_bm25 import BM25Okapi  # type: ignore[import-untyped]

            corpus = [_tokenize(c["text"]) for c in self.chunks]
            self._bm25 = BM25Okapi(corpus)
            self._loaded = True
        except ImportError:
            logger.warning("rank_bm25 not installed; using naive keyword search")
            self._loaded = True

    @property
    def ready(self) -> bool:
        return self._loaded and bool(self.chunks)

    def search(
        self,
        query: str,
        module: str | None = None,
        k: int = 4,
        *,
        exclude_kinds: frozenset[str] | set[str] | None = None,
    ) -> list[dict]:
        if not self.chunks:
            return []
        blocked = frozenset(exclude_kinds or ())
        if self._bm25 is not None:
            scores = self._bm25.get_scores(_tokenize(query))
            ranked = sorted(zip(scores, self.chunks, strict=True), key=lambda x: -x[0])
            hits = [
                c
                for s, c in ranked
                if s > 0
                and (module is None or c["module"] in (module, "_shared"))
                and c.get("kind", DEFAULT_KIND) not in blocked
            ]
        else:
            q = set(_tokenize(query))
            scored: list[tuple[int, dict]] = []
            for c in self.chunks:
                if module and c["module"] not in (module, "_shared"):
                    continue
                if c.get("kind", DEFAULT_KIND) in blocked:
                    continue
                overlap = len(q & set(_tokenize(c["text"])))
                if overlap:
                    scored.append((overlap, c))
            hits = [c for _, c in sorted(scored, key=lambda x: -x[0])]
        return [
            {
                "id": c["id"],
                "module": c["module"],
                # D7: the originating file, so an answer can say where a
                # passage came from instead of asserting it unsourced.
                "source": c.get("source", ""),
                "heading": c.get("heading", ""),
                "kind": c.get("kind", DEFAULT_KIND),
                "text": c["text"][:1500],
            }
            for c in hits[:k]
        ]

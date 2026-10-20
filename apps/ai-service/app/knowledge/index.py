# Modified by Sekar Nagarajan (2026-10-21 01:50)
"""In-process BM25 index over knowledge/**/*.md."""

from __future__ import annotations

import logging
import re
from pathlib import Path

logger = logging.getLogger(__name__)

_WORD = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _WORD.findall(text.lower())


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
            sections = text.split("\n## ")
            for i, section in enumerate(sections):
                body = section.strip()
                if not body:
                    continue
                self.chunks.append(
                    {
                        "id": f"{module}:{md.stem}:{i}",
                        "module": module,
                        "source": str(md.relative_to(root)),
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
    ) -> list[dict]:
        if not self.chunks:
            return []
        if self._bm25 is not None:
            scores = self._bm25.get_scores(_tokenize(query))
            ranked = sorted(zip(scores, self.chunks, strict=True), key=lambda x: -x[0])
            hits = [
                c
                for s, c in ranked
                if s > 0 and (module is None or c["module"] in (module, "_shared"))
            ]
        else:
            q = set(_tokenize(query))
            scored: list[tuple[int, dict]] = []
            for c in self.chunks:
                if module and c["module"] not in (module, "_shared"):
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
                "text": c["text"][:1500],
            }
            for c in hits[:k]
        ]

# Modified by Sekar Nagarajan (2026-10-21 11:25)
"""Hybrid RAG retriever: BM25 (GuideIndex) + vector (VectorIndex), fused
with reciprocal rank fusion. Drop-in for GuideIndex where `.search()` and
`.chunks` are consumed (server_tools, startup logging)."""

from __future__ import annotations

from typing import Any, Protocol


class _Searchable(Protocol):
    def search(
        self, query: str, module: str | None = None, k: int = 6
    ) -> list[dict[str, Any]]: ...


RRF_K = 60


class HybridRetriever:
    def __init__(self, bm25: Any, vector: _Searchable | None = None) -> None:
        self._bm25 = bm25
        self._vector = vector

    @property
    def chunks(self) -> list[dict]:
        return getattr(self._bm25, "chunks", [])

    @property
    def ready(self) -> bool:
        return bool(getattr(self._bm25, "ready", False))

    @property
    def vector_ready(self) -> bool:
        return bool(self._vector is not None and getattr(self._vector, "ready", False))

    def search(
        self,
        query: str,
        module: str | None = None,
        k: int = 6,
        *,
        exclude_kinds: frozenset[str] | set[str] | None = None,
    ) -> list[dict[str, Any]]:
        lexical = (
            self._bm25.search(query, module, k=k * 2, exclude_kinds=exclude_kinds)
            if self._bm25
            else []
        )
        semantic = (
            self._vector.search(query, module, k=k * 2) if self.vector_ready else []
        )
        if exclude_kinds:
            # The vector store filters by module server-side but not by kind,
            # so drop excluded kinds here using the lexical index's metadata.
            kinds = {c["id"]: c.get("kind", "") for c in self.chunks}
            semantic = [
                h for h in semantic
                if kinds.get(h["id"], "") not in set(exclude_kinds)
            ]
        if not semantic:
            return lexical[:k]
        if not lexical:
            return semantic[:k]

        # Reciprocal rank fusion over the two ranked lists, keyed by chunk id.
        scores: dict[str, float] = {}
        byid: dict[str, dict[str, Any]] = {}
        for rank, hit in enumerate(lexical):
            scores[hit["id"]] = scores.get(hit["id"], 0.0) + 1.0 / (RRF_K + rank + 1)
            byid.setdefault(hit["id"], hit)
        for rank, hit in enumerate(semantic):
            scores[hit["id"]] = scores.get(hit["id"], 0.0) + 1.0 / (RRF_K + rank + 1)
            byid.setdefault(hit["id"], hit)
        fused = sorted(scores.items(), key=lambda x: -x[1])
        return [byid[cid] for cid, _ in fused[:k]]

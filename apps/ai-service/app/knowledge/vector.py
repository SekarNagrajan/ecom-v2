# Created by Sekar Nagarajan (2026-10-20 17:20)
"""Persistent vector index (ChromaDB) over the knowledge chunks.

Embeddings are Chroma's default local ONNX MiniLM model — no external API.
The index is BUILT offline by scripts/build_vector_index.py ("training")
and only OPENED read-only at service startup; if chromadb or the persisted
store is unavailable the retriever degrades to BM25-only.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

COLLECTION = "portal-knowledge"


class VectorIndex:
    def __init__(self, path: Path, *, create: bool = False) -> None:
        self._collection = None
        try:
            import chromadb  # noqa: PLC0415 — optional heavy dep

            if not create and not path.exists():
                logger.info("vector store missing at %s — BM25 only", path)
                return
            client = chromadb.PersistentClient(path=str(path))
            self._collection = (
                client.get_or_create_collection(COLLECTION)
                if create
                else client.get_collection(COLLECTION)
            )
        except Exception as exc:  # pragma: no cover — environment dependent
            logger.warning("vector index unavailable (%s) — BM25 only", exc)
            self._collection = None

    @property
    def ready(self) -> bool:
        return self._collection is not None

    def count(self) -> int:
        return self._collection.count() if self._collection is not None else 0

    def build(self, chunks: list[dict], batch: int = 64) -> int:
        """Upsert GuideIndex-shaped chunks ({id, module, source, text})."""
        if self._collection is None:
            return 0
        for i in range(0, len(chunks), batch):
            part = chunks[i : i + batch]
            self._collection.upsert(
                ids=[c["id"] for c in part],
                documents=[c["text"][:3000] for c in part],
                metadatas=[
                    {"module": c["module"], "source": c.get("source", "")}
                    for c in part
                ],
            )
        return len(chunks)

    def search(
        self, query: str, module: str | None = None, k: int = 6
    ) -> list[dict[str, Any]]:
        if self._collection is None or not query.strip():
            return []
        where = (
            {"module": {"$in": [module, "_shared"]}} if module else None
        )
        try:
            res = self._collection.query(
                query_texts=[query], n_results=k, where=where
            )
        except Exception as exc:  # pragma: no cover — environment dependent
            logger.warning("vector query failed: %s", exc)
            return []
        out: list[dict[str, Any]] = []
        ids = res.get("ids") or [[]]
        docs = res.get("documents") or [[]]
        metas = res.get("metadatas") or [[]]
        for cid, doc, meta in zip(ids[0], docs[0], metas[0], strict=False):
            out.append(
                {
                    "id": cid,
                    "module": (meta or {}).get("module", ""),
                    "text": (doc or "")[:1500],
                }
            )
        return out

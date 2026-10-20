# Created by Sekar Nagarajan (2026-10-20 17:20)
"""Build ("train") the persistent vector index from knowledge/**/*.md.

Chunks exactly as GuideIndex does, embeds every chunk with Chroma's local
ONNX embedding model and persists the collection, so the service only has
to open it at startup. Rerun after any knowledge change or mock ingestion:

    uv run python scripts/build_vector_index.py
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.knowledge.index import GuideIndex  # noqa: E402
from app.knowledge.vector import VectorIndex  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--knowledge", default=str(ROOT / "knowledge"))
    parser.add_argument("--db", default=str(ROOT / "var" / "vector-db"))
    args = parser.parse_args()

    guide = GuideIndex(Path(args.knowledge))
    if not guide.chunks:
        raise SystemExit("no knowledge chunks found — nothing to index")

    index = VectorIndex(Path(args.db), create=True)
    if not index.ready:
        raise SystemExit("chromadb unavailable — cannot build the vector index")
    n = index.build(guide.chunks)
    print(f"indexed {n} chunks → {args.db} (collection count: {index.count()})")


if __name__ == "__main__":
    main()

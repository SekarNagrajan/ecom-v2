# Created by Sekar Nagarajan (2026-10-20 17:20)
"""Build ("train") the persistent vector index from knowledge/**/*.md.

Chunks exactly as GuideIndex does, embeds every chunk with Chroma's local
ONNX embedding model and persists the collection, so the service only has
to open it at startup. Rerun after any knowledge change or mock ingestion:

    uv run python scripts/build_vector_index.py
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.knowledge.index import GuideIndex  # noqa: E402
from app.knowledge.vector import VectorIndex  # noqa: E402


def corpus_fingerprint(chunks: list[dict]) -> str:
    """Stable hash of the whole corpus (ids + text).

    Lets a re-run skip the expensive embedding pass when nothing changed —
    the "safe to run the nth time" requirement.
    """
    digest = hashlib.sha256()
    for chunk in sorted(chunks, key=lambda c: c["id"]):
        digest.update(chunk["id"].encode())
        digest.update(b"\x00")
        digest.update(chunk["text"].encode())
        digest.update(b"\x1e")
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--knowledge", default=str(ROOT / "knowledge"))
    parser.add_argument("--db", default=str(ROOT / "var" / "vector-db"))
    parser.add_argument(
        "--force", action="store_true",
        help="rebuild even when the corpus fingerprint is unchanged",
    )
    args = parser.parse_args()

    guide = GuideIndex(Path(args.knowledge))
    if not guide.chunks:
        raise SystemExit("no knowledge chunks found — nothing to index")

    fingerprint = corpus_fingerprint(guide.chunks)
    manifest_path = Path(args.db).parent / "ingest-manifest.json"
    if not args.force and manifest_path.is_file():
        try:
            previous = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            previous = {}
        if previous.get("fingerprint") == fingerprint:
            print(
                f"unchanged — {previous.get('chunks', '?')} chunks already "
                f"indexed at {args.db} (use --force to rebuild)"
            )
            return

    index = VectorIndex(Path(args.db), create=True)
    if not index.ready:
        raise SystemExit("chromadb unavailable — cannot build the vector index")
    n = index.build(guide.chunks)
    # Upsert alone never removes chunks that no longer exist in the corpus,
    # so deleted knowledge stays searchable forever. Purge the difference.
    removed = index.purge_missing({c["id"] for c in guide.chunks})
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(
            {
                "fingerprint": fingerprint,
                "chunks": n,
                "purged": removed,
                "built_at": datetime.now(tz=UTC).isoformat(),
            },
            indent=1,
        ),
        encoding="utf-8",
    )
    print(
        f"indexed {n} chunks → {args.db} "
        f"(purged {removed} stale, collection count: {index.count()})"
    )


if __name__ == "__main__":
    main()

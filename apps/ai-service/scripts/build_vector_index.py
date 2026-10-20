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
import shutil
import sys
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.config import get_settings  # noqa: E402
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
    parser.add_argument(
        "--dry-run", action="store_true",
        help="report what would change without writing",
    )
    parser.add_argument(
        "--reset", action="store_true",
        help="delete the store first and rebuild from scratch",
    )
    args = parser.parse_args()

    guide = GuideIndex(Path(args.knowledge))
    if not guide.chunks:
        raise SystemExit("no knowledge chunks found — nothing to index")

    if args.reset and Path(args.db).exists():
        shutil.rmtree(args.db)
        print(f"reset: removed {args.db}")

    fingerprint = corpus_fingerprint(guide.chunks)
    manifest_path = Path(args.db).parent / "ingest-manifest.json"
    if not (args.force or args.reset or args.dry_run) and manifest_path.is_file():
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

    settings = get_settings()
    index = VectorIndex(
        Path(args.db), create=True, embedding_model=settings.embedding_model
    )
    if not index.ready:
        raise SystemExit("chromadb unavailable — cannot build the vector index")
    if index.rebuilt_for_model_change:
        print(f"embedding model changed -> full rebuild ({settings.embedding_model})")

    stats = index.build(guide.chunks, dry_run=args.dry_run)
    if args.dry_run:
        print(
            f"dry-run: would upsert {stats['upserted']}, "
            f"delete {stats['deleted']}, leave {stats['unchanged']} unchanged "
            f"(corpus {stats['total']})"
        )
        return
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(
            {
                "fingerprint": fingerprint,
                "chunks": stats["total"],
                "upserted": stats["upserted"],
                "deleted": stats["deleted"],
                "embedding_model": settings.embedding_model,
                "built_at": datetime.now(tz=UTC).isoformat(),
            },
            indent=1,
        ),
        encoding="utf-8",
    )
    print(
        f"upserted {stats['upserted']}, deleted {stats['deleted']}, "
        f"unchanged {stats['unchanged']} (corpus {stats['total']}) "
        f"→ {args.db} (collection count: {index.count()})"
    )


if __name__ == "__main__":
    main()

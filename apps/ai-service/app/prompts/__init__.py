# Created by Sekar Nagarajan (2026-10-21 01:40)
"""Prompts live in files, not in code.

Each `*.md` here is loaded once at import and cached. The text is the
cache prefix for every request, so it must stay byte-stable — editing a
prompt invalidates prompt caching for all live conversations, which is why
these are versioned files rather than strings scattered through modules.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

PROMPT_DIR = Path(__file__).resolve().parent


class MissingPrompt(FileNotFoundError):
    """A prompt file referenced by code does not exist."""


@lru_cache(maxsize=None)
def load(name: str) -> str:
    """Return the text of ``app/prompts/<name>.md`` (cached, stripped)."""
    path = PROMPT_DIR / f"{name}.md"
    if not path.is_file():
        raise MissingPrompt(f"prompt file not found: {path}")
    return path.read_text(encoding="utf-8").strip()


def available() -> list[str]:
    return sorted(p.stem for p in PROMPT_DIR.glob("*.md"))

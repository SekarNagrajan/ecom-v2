# Modified by Sekar Nagarajan (2026-10-20 12:52)
"""Log redaction helpers — never log Authorization tokens."""

from __future__ import annotations

import re

_EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
_PHONE_RE = re.compile(r"\+?\d[\d\s().-]{7,}\d")
_BEARER_RE = re.compile(r"(?i)(authorization\s*[:=]\s*bearer\s+)\S+")


def redact(text: str) -> str:
    text = _BEARER_RE.sub(r"\1[REDACTED]", text)
    text = _EMAIL_RE.sub("[REDACTED_EMAIL]", text)
    text = _PHONE_RE.sub("[REDACTED_PHONE]", text)
    return text

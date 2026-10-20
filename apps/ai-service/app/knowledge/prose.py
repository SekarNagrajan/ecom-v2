# Created by Sekar Nagarajan (2026-10-20 22:10)
"""Extract the genuine prose knowledge hiding inside the portal fixtures.

The fixture set has no FAQ or policy file, but six datasets carry real
explanatory English that is far better RAG material than the SQL-column
digests. This module turns each into markdown `## ` sections (the unit
GuideIndex/VectorIndex chunk on):

  configuration.json       — plain-English description of portal behaviour
  settings.json            — feature flags with rationale
  notificationSettings.json— what each notifiable event means
  statusDescriptions.json  — the status-code decoder (BOL + "I" -> Released)
  emailTemplates.json      — "what happens when X" workflow emails
  EcomContent.json         — the Terms & Conditions policy document

Nothing here is imported or executed from the fixture data; values are read
as text only. HTML is stripped and known junk rows are dropped.
"""

from __future__ import annotations

import html
import json
import re
from pathlib import Path
from typing import Any

# Fixtures that are pure noise — a Java stack trace, SQL error text, test
# strings. They must never become retrievable knowledge.
JUNK_FIXTURES: frozenset[str] = frozenset(
    {"insertmisexpreport_dup", "advisories", "notices"}
)

_TAG = re.compile(r"<[^>]+>")
_WS = re.compile("[ \t\u00a0]+")  # space, tab, non-breaking space
_BLANKS = re.compile(r"\n{3,}")

# Human-readable module names — the words a user actually types.
_MODULE_LABEL: dict[str, str] = {
    "bl": "bill of lading",
    "booking": "booking",
    "shipping-instruction": "shipping instruction",
    "vgm": "VGM",
    "cro": "container release order",
    "delivery-order": "delivery order",
    "arrival-notice": "arrival notice",
}

# statusDescriptions.module -> knowledge folder
_STATUS_MODULE: dict[str, str] = {
    "BOL": "bl",
    "BKG": "booking",
    "SI": "shipping-instruction",
    "VGM": "vgm",
    "CRO": "cro",
    "DO": "delivery-order",
    "ARN": "arrival-notice",
}

# notificationSettings.category -> knowledge folder
_CATEGORY_MODULE: dict[str, str] = {
    "BOOKING": "booking",
    "SHIPPING_INSTRUCTION": "shipping-instruction",
    "BILL_OF_LADING": "bl",
    "VGM": "vgm",
}

# emailTemplates.templateKey prefix -> knowledge folder (first match wins)
_TEMPLATE_MODULE: list[tuple[str, str]] = [
    ("BILL_OF_LADING", "bl"),
    ("SHIPPING_INSTRUCTION", "shipping-instruction"),
    ("CONTAINER_RELEASE", "cro"),
    ("DELIVERY_ORDER", "delivery-order"),
    ("ARRIVAL_NOTICE", "arrival-notice"),
    ("VGM", "vgm"),
    ("BOOKING", "booking"),
]

MAX_POLICY_CHUNK = 1400


def strip_html(raw: str) -> str:
    """HTML/entities -> readable plain text, with newlines preserved."""
    if not raw:
        return ""
    text = re.sub(r"(?i)<\s*(br|/p|/li|/div|/tr)\s*/?>", "\n", raw)
    text = re.sub(r"(?i)<\s*li[^>]*>", "\n- ", text)
    text = _TAG.sub(" ", text)
    text = html.unescape(text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = _WS.sub(" ", text)
    text = "\n".join(line.strip() for line in text.split("\n"))
    return _BLANKS.sub("\n\n", text).strip()


def _rows(path: Path) -> list[dict[str, Any]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    if isinstance(data, list):
        return [r for r in data if isinstance(r, dict)]
    return []


def _template_module(key: str) -> str:
    upper = (key or "").upper()
    for prefix, module in _TEMPLATE_MODULE:
        if upper.startswith(prefix):
            return module
    return "portal"


def configuration_sections(path: Path) -> list[tuple[str, str]]:
    """configuration.json / settings.json -> behaviour explanations."""
    out: list[tuple[str, str]] = []
    for row in _rows(path):
        key = row.get("configKey") or row.get("settingKey") or ""
        name = row.get("configName") or row.get("settingName") or key
        desc = (row.get("description") or "").strip()
        if not key or not desc:
            continue
        body = [f"## Portal behaviour: {name} ({key})", "", desc]
        if "isEnabled" in row:
            state = "ON" if row.get("isEnabled") else "OFF"
            body += ["", f"Current state in this environment: **{state}**."]
        out.append(("portal", "\n".join(body) + "\n"))
    return out


def notification_sections(path: Path) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for row in _rows(path):
        key = row.get("notificationKey") or ""
        desc = (row.get("description") or "").strip()
        if not key or not desc:
            continue
        module = _CATEGORY_MODULE.get(str(row.get("category") or ""), "portal")
        default = "on" if row.get("defaultEnabled") else "off"
        body = [
            f"## Notification: {row.get('notificationName') or key}",
            "",
            desc,
            "",
            f"Notification key `{key}`, category "
            f"`{row.get('category')}`, enabled by default: {default}.",
        ]
        out.append((module, "\n".join(body) + "\n"))
    return out


def status_sections(path: Path) -> list[tuple[str, str]]:
    """One status-code decoder table per module — small file, huge value."""
    by_module: dict[str, list[dict[str, Any]]] = {}
    for row in _rows(path):
        code = str(row.get("module") or "").strip()
        module = _STATUS_MODULE.get(code.upper())
        if not module:
            continue
        by_module.setdefault(module, []).append(row)

    out: list[tuple[str, str]] = []
    for module, rows in sorted(by_module.items()):
        label = _MODULE_LABEL.get(module, module)
        pairs: list[tuple[str, str]] = []
        seen: set[str] = set()
        for row in rows:
            status = str(row.get("status") or "").strip()
            desc = str(row.get("statusdesc") or "").strip()
            if not status or not desc or status in seen:
                continue
            seen.add(status)
            pairs.append((status, desc))

        # Sentences first, table second. A bare table of single letters
        # retrieves badly: "I" tokenises to a stopword-like term and the
        # embedding has almost no signal. Spelling each code out as a
        # sentence gives both BM25 and the embedder real text to match.
        lines = [
            f"## {label.title()} status codes — what each status means",
            "",
            f"Meaning of every stored status code on a {label}. Use these "
            "exact words when explaining the state of a record; never guess "
            "a meaning for a status code.",
            "",
        ]
        lines += [
            f"- Status `{code}` on a {label} means \"{desc}\"."
            for code, desc in pairs
        ]
        lines += ["", "| Code | Meaning |", "|---|---|"]
        lines += [f"| `{code}` | {desc} |" for code, desc in pairs]
        out.append((module, "\n".join(lines) + "\n"))
    return out


def email_template_sections(path: Path) -> list[tuple[str, str]]:
    """Workflow emails = the best 'what happens when X' corpus available."""
    out: list[tuple[str, str]] = []
    for row in _rows(path):
        key = row.get("templateKey") or ""
        if not key:
            continue
        body = strip_html(row.get("bodyHtml") or "")
        if not body:
            continue
        module = _template_module(key)
        section = [
            f"## Workflow email: {row.get('templateName') or key}",
            "",
            f"Sent when the `{key}` event occurs. "
            f"Subject line: \"{row.get('subject') or ''}\".",
            "",
            "Message text sent to the recipient:",
            "",
            body[:2000],
        ]
        out.append((module, "\n".join(section) + "\n"))
    return out


def policy_sections(path: Path) -> list[tuple[str, str]]:
    """EcomContent.json — the only true policy document in the dataset."""
    out: list[tuple[str, str]] = []
    for row in _rows(path):
        text = strip_html(row.get("body") or "")
        if not text:
            continue
        title = row.get("title") or row.get("contentKey") or "Policy"
        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
        chunks: list[str] = []
        buf = ""
        for para in paragraphs:
            if len(buf) + len(para) + 1 > MAX_POLICY_CHUNK and buf:
                chunks.append(buf)
                buf = para
            else:
                buf = f"{buf}\n{para}" if buf else para
        if buf:
            chunks.append(buf)
        total = len(chunks)
        for i, chunk in enumerate(chunks, start=1):
            head = (
                f"## {title} (part {i} of {total})"
                if total > 1
                else f"## {title}"
            )
            out.append(("portal", f"{head}\n\n{chunk}\n"))
    return out


_EXTRACTORS: list[tuple[str, Any]] = [
    ("configuration.json", configuration_sections),
    ("settings.json", configuration_sections),
    ("notificationSettings.json", notification_sections),
    ("statusDescriptions.json", status_sections),
    ("emailTemplates.json", email_template_sections),
    ("EcomContent.json", policy_sections),
]


def collect_prose(fixtures_dir: Path) -> dict[str, list[str]]:
    """{module: [markdown section, …]} for every prose source present."""
    docs: dict[str, list[str]] = {}
    for filename, extractor in _EXTRACTORS:
        path = fixtures_dir / filename
        if not path.exists():
            continue
        for module, section in extractor(path):
            docs.setdefault(module, []).append(section)
    return docs

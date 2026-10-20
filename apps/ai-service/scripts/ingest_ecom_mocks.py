# Created by Sekar Nagarajan (2026-10-20 17:55)
"""Ingest the E-com v2 portal mock layer into the assistant knowledge base.

Sources (parsed textually — nothing is imported or executed):
  * `src/mocks/fixtures/*.json`  — DB-dumped fixture data (from Ecomm_JSF).
    Each fixture becomes one digest section: record count, field names and
    up to two sample records.
  * `src/mocks/*.handlers.ts`    — MSW handlers. Each becomes an endpoint
    inventory section (`http.get("/api/…")` routes it serves).

Output: `knowledge/<module>/mock-data.md`, one file per portal module,
sectioned with `## ` so GuideIndex/VectorIndex chunk per fixture/handler.

Run (then rebuild the vector index):

    uv run python -I scripts/ingest_ecom_mocks.py \\
      --src ../ecom-portal/src/mocks
    uv run python scripts/build_vector_index.py
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

KNOWLEDGE_ROOT = Path(__file__).resolve().parents[1] / "knowledge"

# First matching prefix wins (checked case-insensitively).
_FIXTURE_MODULE_PREFIXES: list[tuple[str, str]] = [
    ("lrpbooking", "booking"),
    ("booking", "booking"),
    ("insurance", "booking"),
    ("cutoffconfig", "booking"),
    ("shippinginstructions", "shipping-instruction"),
    ("si", "shipping-instruction"),
    ("lrpbl", "bl"),
    ("invoicebls", "bl"),
    ("bl", "bl"),
    ("telexreleases", "bl"),
    ("vgm", "vgm"),
    ("cro", "cro"),
    ("deliveryorder", "delivery-order"),
    ("arrivalnotice", "arrival-notice"),
    ("schedules", "schedules"),
    ("vessels", "schedules"),
    ("portcalls", "schedules"),
    ("routes", "schedules"),
    ("transportservices", "schedules"),
    ("services", "schedules"),
    ("containermoves", "tracking"),
    ("intransitpods", "tracking"),
    ("tracking", "tracking"),
    ("statusdescriptions", "tracking"),
    ("tariffs", "rates"),
    ("lcltariffs", "rates"),
    ("contract", "rates"),
    ("charges", "rates"),
    ("invoice", "customer-statement"),
    ("payments", "customer-statement"),
    ("paymentreferences", "customer-statement"),
    ("receipt", "customer-statement"),
    ("hotline", "hotline"),
    ("carbon", "carbon"),
    ("ports", "_shared"),
    ("portcountrymap", "_shared"),
    ("countries", "_shared"),
    ("states", "_shared"),
    ("terminals", "_shared"),
    ("depots", "_shared"),
    ("carriers", "_shared"),
    ("commodities", "_shared"),
    ("packages", "_shared"),
    ("equipments", "_shared"),
    ("shipmentterms", "_shared"),
    ("oprts", "_shared"),
    ("cargoprotectrestrictions", "_shared"),
    ("languages", "_shared"),
    ("lookups", "_shared"),
]

_HANDLER_MODULES: dict[str, str] = {
    "booking": "booking",
    "si": "shipping-instruction",
    "bl": "bl",
    "vgm": "vgm",
    "cro": "cro",
    "delivery-order": "delivery-order",
    "arrival-notice": "arrival-notice",
    "schedules": "schedules",
    "tracking": "tracking",
    "rates": "rates",
    "carbon": "carbon",
    "customer-statement": "customer-statement",
    "hotline": "hotline",
    "dashboard-export": "dashboard",
    "landing": "portal",
    "contact-us": "hotline",
    "registration": "portal",
    "auth": "portal",
    "auth-admin": "portal",
    "admin": "portal",
    "accessibility": "portal",
    "public-tenant": "portal",
    "user-creation": "portal",
    "user-modules": "portal",
    "profile-photo": "portal",
}

_SKIP_HANDLERS = {"ai-assist", "assistant"}  # the assistant's own plumbing

_ENDPOINT_RE = re.compile(
    r"http\.(get|post|put|delete|patch|head|options)\(\s*[\"'`]([^\"'`]+)"
)

MAX_SAMPLE_CHARS = 1600


def fixture_module(stem: str) -> str:
    low = stem.lower()
    for prefix, module in _FIXTURE_MODULE_PREFIXES:
        if low.startswith(prefix):
            return module
    return "portal"


def _sample(records: list) -> str:
    out = json.dumps(records[:2], indent=1, ensure_ascii=False, default=str)
    return out[:MAX_SAMPLE_CHARS]


def fixture_section(path: Path) -> tuple[str, str] | None:
    """Return (module, markdown section) for one fixture JSON file."""
    stem = path.stem
    if stem == "_manifest":
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    module = fixture_module(stem)
    if isinstance(data, list):
        records = data
    elif isinstance(data, dict):
        # Common dump shape: {"tableName": [rows]} or a single object.
        inner = next((v for v in data.values() if isinstance(v, list)), None)
        records = inner if inner is not None else [data]
    else:
        records = [data]
    fields: list[str] = []
    if records and isinstance(records[0], dict):
        fields = list(records[0].keys())[:40]
    lines = [
        f"## {module} fixture: {stem} ({path.name})",
        "",
        f"E-com v2 portal fixture `{path.name}` — {len(records)} record(s) "
        f"serving the {module} module in mock mode.",
    ]
    if fields:
        lines += ["", "Fields: " + ", ".join(fields)]
    if records:
        lines += ["", "Sample records:", "```json", _sample(records), "```"]
    return module, "\n".join(lines) + "\n"


def handler_section(path: Path) -> tuple[str, str] | None:
    stem = path.name.removesuffix(".handlers.ts")
    if stem in _SKIP_HANDLERS:
        return None
    module = _HANDLER_MODULES.get(stem, "portal")
    text = path.read_text(encoding="utf-8", errors="replace")
    endpoints = [
        f"- {method.upper()} {route}"
        for method, route in _ENDPOINT_RE.findall(text)
    ]
    if not endpoints:
        return None
    lines = [
        f"## {module} API endpoints: {stem} ({path.name})",
        "",
        f"Mock-mode API endpoints the portal serves for the {module} module:",
        "",
        *endpoints,
    ]
    return module, "\n".join(lines) + "\n"


def ingest(src_root: Path, out_root: Path) -> dict[str, int]:
    docs: dict[str, list[str]] = {}

    for fx in sorted((src_root / "fixtures").glob("*.json")):
        got = fixture_section(fx)
        if got:
            docs.setdefault(got[0], []).append(got[1])

    for hd in sorted(src_root.glob("*.handlers.ts")):
        got = handler_section(hd)
        if got:
            docs.setdefault(got[0], []).append(got[1])

    counts: dict[str, int] = {}
    for module, sections in sorted(docs.items()):
        folder = out_root / module
        folder.mkdir(parents=True, exist_ok=True)
        header = (
            f"# {module} — portal mock data reference\n\n"
            "Generated by scripts/ingest_ecom_mocks.py from the E-com v2 "
            "portal mock layer (fixtures + MSW handlers). Sample/reference "
            "data, not live records.\n\n"
        )
        (folder / "mock-data.md").write_text(
            header + "\n".join(sections), encoding="utf-8"
        )
        counts[module] = len(sections)
    return counts


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", required=True, help="ecom-portal src/mocks directory")
    parser.add_argument("--out", default=str(KNOWLEDGE_ROOT))
    args = parser.parse_args()
    src = Path(args.src).resolve()
    if not (src / "fixtures").is_dir():
        raise SystemExit(f"no fixtures/ under: {src}")
    counts = ingest(src, Path(args.out).resolve())
    total = sum(counts.values())
    print(f"ingested {total} sections across {len(counts)} modules:")
    for module, n in sorted(counts.items()):
        print(f"  {module}: {n}")


if __name__ == "__main__":
    main()

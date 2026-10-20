# Modified by Sekar Nagarajan (2026-10-21 11:25)
"""Server-side tool implementations (run inside ai-service)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from app.tools.sql_runner import run_readonly_sql

# Normalise common aliases → knowledge folder names.
_MODULE_ALIASES: dict[str, str] = {
    "si": "shipping-instruction",
    "shipping_instruction": "shipping-instruction",
    "shippinginstruction": "shipping-instruction",
    "bill-of-lading": "bl",
    "bill_of_lading": "bl",
    "billoflading": "bl",
    "bol": "bl",
    "do": "delivery-order",
    "delivery_order": "delivery-order",
    "arn": "arrival-notice",
    "arrival_notice": "arrival-notice",
    "co2": "carbon",
    "carbon-calculator": "carbon",
    "glossary": "_shared",
    "shared": "_shared",
}

_SCHEMA_ROOT = Path(__file__).resolve().parents[2] / "knowledge" / "sql"


def _normalize_module(module: str | None) -> str | None:
    if not module:
        return None
    key = module.strip().lower().replace(" ", "-")
    return _MODULE_ALIASES.get(key, key)


def _describe_schema(entity: str | None) -> dict[str, Any]:
    path = _SCHEMA_ROOT / "schema.md"
    if not path.exists():
        return {"ok": False, "error": "Schema guide not found", "sections": []}
    text = path.read_text(encoding="utf-8")
    sections = text.split("\n## ")
    out: list[dict[str, str]] = []
    needle = (entity or "").strip().lower()
    for i, section in enumerate(sections):
        body = section.strip()
        if not body:
            continue
        title = body.split("\n", 1)[0].strip().lower()
        if needle and needle not in title and needle not in body.lower():
            if i > 0:
                continue
        out.append({"title": body.split("\n", 1)[0].strip(), "text": body[:2000]})
    return {
        "ok": True,
        "verified": True,
        "entity": entity,
        "sections": out[:8] if out else [{"title": "schema", "text": text[:2000]}],
        "note": "Logical portal schema from the verified guide — not live DDL.",
    }


#: Fixture digests describe the demo dataset's shape. Only SQL mode, whose
#: job is querying that dataset, may retrieve them — everywhere else they
#: risk being read as a specific customer's record.
_KINDS_BY_MODE: dict[str, frozenset[str]] = {
    "assistant": frozenset({"fixture"}),
    "automation": frozenset({"fixture"}),
    "docs": frozenset({"fixture"}),
    "sql": frozenset(),
}


async def run_server_tool(
    name: str,
    args: dict[str, Any],
    app_state: Any,
    *,
    authorization: str | None = None,
    mode: str = "assistant",
) -> dict[str, Any]:
    if name == "search_portal_guide":
        guide = getattr(app_state, "guide", None)
        if guide is None:
            return {"results": [], "verified": True}
        query = str(args.get("query") or "")
        module_s = _normalize_module(
            str(args["module"]) if args.get("module") is not None else None
        )
        excluded = _KINDS_BY_MODE.get(mode, frozenset({"fixture"}))
        hits = guide.search(query, module_s, k=6, exclude_kinds=excluded)
        return {
            "results": hits,
            "verified": True,
            "note": (
                "These excerpts are from the verified portal guide. "
                "Do not invent steps that are not present."
            ),
        }

    if name == "describe_schema":
        entity = args.get("entity")
        return _describe_schema(str(entity) if entity is not None else None)

    if name == "run_sql_readonly":
        settings = getattr(app_state, "settings", None)
        if settings is None:
            from app.config import get_settings

            settings = get_settings()
        sql = str(args.get("sql") or "")
        limit = args.get("limit")
        result = await run_readonly_sql(
            sql,
            settings=settings,
            authorization=authorization,
            limit=int(limit) if isinstance(limit, int) else 100,
        )
        if isinstance(args.get("explanation"), str):
            result = {**result, "explanation": args["explanation"]}
        return result

    raise KeyError(name)

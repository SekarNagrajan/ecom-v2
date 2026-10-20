# Modified by Sekar Nagarajan (2026-10-20 12:52)
"""Run eval cases against /v1/chat and report tool accuracy.

Usage:
  uv run python evals/run.py
  AI_SERVICE_URL=http://localhost:8000 uv run python evals/run.py

Without ANTHROPIC_API_KEY (or AI_SERVICE_URL), runs in stub mode using
heuristic keyword→tool mapping for offline CI.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None  # type: ignore

import httpx

CASES_PATH = Path(__file__).with_name("cases.yaml")

# Offline stub: crude keyword → tool map for accuracy scaffolding
_KEYWORD_TOOLS: list[tuple[list[str], str]] = [
    (["schedule", "schedules", "etd", "sailing"], "search_schedules"),
    (["track", "tracking", "container", "bl "], "track_shipment"),
    (["rate", "rates", "freight"], "get_rates"),
    (["booking", "bookings"], "list_bookings"),
    (["shipping instruction", "si "], "list_shipping_instructions"),
    (["bill of lading", "bills of lading", "b/l"], "list_bills_of_lading"),
    (["vgm"], "list_vgm"),
    (["cro", "release order"], "list_cro"),
    (["delivery order"], "list_delivery_orders"),
    (["arrival notice"], "list_arrival_notices"),
    (["statement", "payment"], "get_customer_statement"),
    (["carbon"], "estimate_carbon"),
    (["dashboard"], "get_dashboard_summary"),
    (["hotline"], "get_hotline"),
    (["prefill"], "prefill_booking"),
    (["take me to", "navigate", "open the new"], "navigate"),
]


def _stub_tools(message: str, capabilities: list[str]) -> list[str]:
    lower = message.lower()
    found: list[str] = []

    # Prefer explicit UI intents before generic booking/schedule keywords
    if "prefill" in lower or ("start a booking" in lower and "schedule" in lower):
        if "BKG" in capabilities:
            found.append("prefill_booking")
            if "schedule" in lower:
                found.insert(0, "search_schedules")
            return found

    for keys, tool in _KEYWORD_TOOLS:
        if any(k in lower for k in keys):
            need = {
                "list_bookings": "BKG",
                "get_booking": "BKG",
                "prefill_booking": "BKG",
                "list_shipping_instructions": "SI",
                "list_bills_of_lading": "BL",
                "list_vgm": "VGM",
                "list_cro": "CRO",
                "list_delivery_orders": "DO",
                "list_arrival_notices": "ARN",
                "get_customer_statement": "PAY",
            }.get(tool)
            if need and need not in capabilities:
                continue
            if tool == "list_bookings" and "bkg-" in lower.replace(" ", ""):
                found.append("get_booking")
            else:
                found.append(tool)
    out: list[str] = []
    for t in found:
        if t not in out:
            out.append(t)
    return out


def _parse_sse_tools(body: str) -> list[str]:
    tools: list[str] = []
    event = None
    for line in body.splitlines():
        if line.startswith("event:"):
            event = line.split(":", 1)[1].strip()
        elif line.startswith("data:") and event in ("tool_call", "ui_action"):
            data = json.loads(line.split(":", 1)[1].strip())
            name = data.get("name")
            if name:
                tools.append(name)
            event = None
    return tools


def _score(expected: list[str], actual: list[str], match: str) -> bool:
    if not expected:
        return actual == []
    if match == "any":
        return any(t in actual for t in expected)
    return all(t in actual for t in expected)


def run_scenarios() -> int:
    """Score the action scenarios: outcome correctness, offline.

    Tool-selection accuracy says the model picked the right action; this
    says the action then returned the right OUTCOME — the thing the user
    actually experiences when something is missing, denied or impossible.
    """
    import json
    import tempfile

    import yaml

    from app.actions.context import ActionContext, customer_for
    from app.actions.registry import run_action
    from app.models.chat import UserContext
    from app.repositories.base import FixtureRepository

    scenario_dir = Path(__file__).resolve().parents[1] / "tests" / "scenarios"
    cases: list[tuple[str, dict]] = []
    for path in sorted(scenario_dir.glob("*.yaml")):
        doc = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        for case in doc.get("cases", []):
            cases.append((f"{path.stem}:{case['id']}", case))
    if not cases:
        print("no scenarios found")
        return 1

    tables = {
        "bookings": [
            {"ebookno": "BKON1", "cust_code": "C1", "ebook_status": "A"},
            {"ebookno": "OTHER", "cust_code": "C2"},
        ],
        "lrpBookings": [{"book_no": "SVMD1", "status": "A"}],
        "shippingInstructions": [
            {"eSINo": "SIREQ1", "bookno": "SVMD1", "custcode": "C1"}
        ],
        "lrpBl": [{"bl_no": "BL1", "book_no": "SVMD1"}],
        "vgm": [{"id": 1, "book_no": "SVMD1", "eqpid": "AASU1"}],
        "invoices": [{"invno": "INV1", "custcode": "C1", "invamount": 100}],
        "arrivalNotices": [{"arrivalnoticeno": "AN1"}],
        "deliveryOrderVersions": [{"delordno": "DO1"}],
    }
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        for name, rows in tables.items():
            (root / f"{name}.json").write_text(json.dumps(rows), encoding="utf-8")
        repo = FixtureRepository(root)

        passed = 0
        by_outcome: dict[str, list[int]] = {}
        for name, case in cases:
            user = UserContext(
                user_id="u1",
                tenant_code=case.get("tenant", "C1"),
                capabilities=list(case.get("capabilities", [])),
                authenticated=True,
            )
            ctx = ActionContext(repo=repo, user=user, customer=customer_for(user))
            result = run_action(ctx, case["action"], case.get("args") or {})
            expected = case["expect_outcome"]
            ok = result.outcome.value == expected
            passed += ok
            tally = by_outcome.setdefault(expected, [0, 0])
            tally[0] += ok
            tally[1] += 1
            flag = "PASS" if ok else "FAIL"
            print(f"{flag}  {name:42} {expected:12} -> {result.outcome.value}")

    total = len(cases)
    print(f"\noutcome_accuracy={passed / total * 100:.2f}%  ({passed}/{total})")
    for outcome, (ok, n) in sorted(by_outcome.items()):
        print(f"  {outcome:12} {ok}/{n}")
    return 0 if passed == total else 1


def main() -> int:
    if yaml is None:
        print("PyYAML required: uv sync", file=sys.stderr)
        return 2

    cases = yaml.safe_load(CASES_PATH.read_text())["cases"]
    base = os.environ.get("AI_SERVICE_URL")
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    use_live = bool(base) and bool(api_key)

    passed = 0
    rows: list[tuple[str, bool, list[str], list[str]]] = []

    for case in cases:
        expected = case.get("expected_tools") or []
        caps = case.get("capabilities") or []
        match = case.get("match") or "all"
        message = case["message"]

        if use_live:
            assert base is not None
            with httpx.Client(timeout=60.0) as client:
                resp = client.post(
                    f"{base.rstrip('/')}/v1/chat",
                    json={
                        "conversation_id": None,
                        "message": message,
                        "tool_results": None,
                        "client_context": {
                            "route": "/app",
                            "locale": "en",
                            "capabilities": caps,
                        },
                        "tools": None,
                    },
                )
                actual = _parse_sse_tools(resp.text) if resp.status_code == 200 else []
        else:
            actual = _stub_tools(message, caps)

        ok = _score(expected, actual, match)
        passed += int(ok)
        rows.append((case["id"], ok, expected, actual))

    total = len(rows)
    print(f"mode={'live' if use_live else 'stub'}  {passed}/{total} passed")
    for cid, ok, exp, act in rows:
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] {cid}: expected={exp} actual={act}")

    accuracy = (passed / total) if total else 0.0
    print(f"tool_accuracy={accuracy:.2%}")
    return 0 if passed == total else 1


if __name__ == "__main__":
    import sys as _sys

    if "--scenarios" in _sys.argv:
        raise SystemExit(run_scenarios())
    raise SystemExit(main())

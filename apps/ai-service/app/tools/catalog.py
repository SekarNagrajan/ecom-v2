# Modified by Sekar Nagarajan (2026-10-20 16:53)
"""Tool catalog: ToolSpec, Anthropic conversion, capability gates (CONTRACT names)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal

from app.modes import AssistantMode, get_mode, parse_mode
from app.models.chat import UserContext
from app.tools.routes import route_ok

Kind = Literal["browser", "server", "ui_action"]

NAVIGATE_ROUTE_PREFIX = "/app/"
UI_ACTION_NAMES = frozenset(
    {"prefill_booking", "navigate", "propose_booking_submit"}
)
SERVER_TOOL_NAMES = frozenset(
    {"search_portal_guide", "describe_schema", "run_sql_readonly"}
)


@dataclass(frozen=True)
class ToolSpec:
    name: str
    description: str
    input_schema: dict[str, Any]
    capability: str | None = None  # None = ungated when authenticated (or public)
    kind: Kind = "browser"
    public: bool = False  # guests allowed
    required: list[str] = field(default_factory=list)
    # When set, tool is only offered in these modes (even if mode allowlist is None).
    modes: frozenset[AssistantMode] | None = None


def _obj(properties: dict[str, Any], required: list[str] | None = None) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": properties,
        "required": required or [],
        "additionalProperties": False,
    }


TOOL_CATALOG: list[ToolSpec] = [
    ToolSpec(
        name="search_schedules",
        description="Search vessel schedules by origin, destination and ETD window.",
        input_schema=_obj(
            {
                "origin": {"type": "string"},
                "destination": {"type": "string"},
                "etd_from": {"type": "string"},
                "etd_to": {"type": "string"},
            }
        ),
        public=True,
    ),
    ToolSpec(
        name="track_shipment",
        description="Track a shipment by container, B/L or booking reference.",
        input_schema=_obj(
            {
                "search_type": {
                    "type": "string",
                    "enum": ["container", "bl", "booking", "CONTAINER", "BL", "BOOKING"],
                },
                "search_value": {"type": "string"},
            },
            required=["search_type", "search_value"],
        ),
        required=["search_type", "search_value"],
        public=True,
    ),
    ToolSpec(
        name="get_rates",
        description="Fetch indicative freight rates / published tariffs.",
        input_schema=_obj(
            {
                "origin": {"type": "string"},
                "destination": {"type": "string"},
                "container_type": {"type": "string"},
            }
        ),
        public=True,
    ),
    ToolSpec(
        name="list_bookings",
        description="List bookings for the current tenant/user.",
        input_schema=_obj(
            {
                "status": {"type": "string"},
                "page": {"type": "integer"},
                "page_size": {"type": "integer"},
            }
        ),
        capability="BKG",
    ),
    ToolSpec(
        name="get_booking",
        description="Get a single booking by id.",
        input_schema=_obj(
            {"booking_id": {"type": "string"}},
            required=["booking_id"],
        ),
        capability="BKG",
        required=["booking_id"],
    ),
    ToolSpec(
        name="list_shipping_instructions",
        description="List shipping instructions.",
        input_schema=_obj({"status": {"type": "string"}, "page": {"type": "integer"}}),
        capability="SI",
    ),
    ToolSpec(
        name="list_bills_of_lading",
        description="List bills of lading.",
        input_schema=_obj({"status": {"type": "string"}, "page": {"type": "integer"}}),
        capability="BL",
    ),
    ToolSpec(
        name="list_vgm",
        description="List VGM submissions.",
        input_schema=_obj({"status": {"type": "string"}, "page": {"type": "integer"}}),
        capability="VGM",
    ),
    ToolSpec(
        name="list_cro",
        description="List container release orders.",
        input_schema=_obj({"status": {"type": "string"}, "page": {"type": "integer"}}),
        capability="CRO",
    ),
    ToolSpec(
        name="list_delivery_orders",
        description="List delivery orders.",
        input_schema=_obj({"status": {"type": "string"}, "page": {"type": "integer"}}),
        capability="DO",
    ),
    ToolSpec(
        name="list_arrival_notices",
        description="List arrival notices.",
        input_schema=_obj({"status": {"type": "string"}, "page": {"type": "integer"}}),
        capability="ARN",
    ),
    ToolSpec(
        name="get_customer_statement",
        description="Get customer payment statement.",
        input_schema=_obj(
            {"from_date": {"type": "string"}, "to_date": {"type": "string"}}
        ),
        capability="PAY",
    ),
    ToolSpec(
        name="estimate_carbon",
        description="Estimate carbon emissions for a lane and containers.",
        input_schema=_obj(
            {
                "origin": {"type": "string"},
                "destination": {"type": "string"},
                "containers": {"type": "integer"},
            },
            required=["origin", "destination", "containers"],
        ),
        required=["origin", "destination", "containers"],
    ),
    ToolSpec(
        name="get_dashboard_summary",
        description="Get dashboard KPI summary.",
        input_schema=_obj({}),
    ),
    ToolSpec(
        name="get_hotline",
        description="Get carrier hotline / contact details.",
        input_schema=_obj({}),
    ),
    ToolSpec(
        name="search_portal_guide",
        description=(
            "Search the verified portal user guide: how-to steps, field rules, statuses, glossary. "
            "Use for any 'how do I' / 'what does X mean' / tutorial question. "
            "Optional module: booking, tracking, schedules, rates, shipping-instruction, bl, vgm, "
            "cro, delivery-order, arrival-notice, carbon, _shared."
        ),
        input_schema=_obj(
            {
                "query": {"type": "string", "minLength": 2, "maxLength": 300},
                "module": {"type": "string"},
            },
            required=["query"],
        ),
        required=["query"],
        kind="server",
        public=True,
    ),
    ToolSpec(
        name="prefill_booking",
        description=(
            "Prefill the booking wizard from a schedule, quote or master details. "
            "Does not submit. Prefer propose_booking_submit in automation mode when the user "
            "explicitly wants to create a booking after confirming a summary."
        ),
        input_schema=_obj(
            {
                "schedule_id": {"type": "string"},
                "quote_id": {"type": "string"},
                "master_details": {"type": "object"},
            }
        ),
        capability="BKG",
        kind="ui_action",
    ),
    ToolSpec(
        name="propose_booking_submit",
        description=(
            "Show a booking summary card and ask the user to confirm submission. "
            "Only call after collecting required fields. The portal submits only if the user confirms."
        ),
        input_schema=_obj(
            {
                "summary": {"type": "string"},
                "schedule_id": {"type": "string"},
                "origin": {"type": "string"},
                "delivery": {"type": "string"},
                "cargo_ready_date": {"type": "string"},
                "shipper_name": {"type": "string"},
                "container_type": {"type": "string"},
                "quantity": {"type": "integer"},
                "hs_code": {"type": "string"},
                "weight": {"type": "integer"},
                "master_details": {"type": "object"},
            },
            required=["summary"],
        ),
        required=["summary"],
        capability="BKG",
        kind="ui_action",
        modes=frozenset({"automation"}),
    ),
    ToolSpec(
        name="navigate",
        description="Navigate the portal to an /app/* route.",
        input_schema=_obj(
            {"route": {"type": "string"}},
            required=["route"],
        ),
        required=["route"],
        kind="ui_action",
        public=True,
    ),
    ToolSpec(
        name="describe_schema",
        description=(
            "Describe logical portal data entities / columns for SQL Analysis. "
            "Optional entity filter (e.g. bookings, schedules)."
        ),
        input_schema=_obj({"entity": {"type": "string"}}),
        capability="SQL",
        kind="server",
        modes=frozenset({"sql"}),
    ),
    ToolSpec(
        name="run_sql_readonly",
        description=(
            "Validate and execute a single read-only SQL statement via the controlled SQL service. "
            "Rejects INSERT/UPDATE/DELETE/DDL. Requires SQL capability and SQL_SERVICE_URL."
        ),
        input_schema=_obj(
            {
                "sql": {"type": "string", "minLength": 6, "maxLength": 8000},
                "limit": {"type": "integer"},
                "explanation": {"type": "string"},
            },
            required=["sql"],
        ),
        required=["sql"],
        capability="SQL",
        kind="server",
        modes=frozenset({"sql"}),
    ),
]


_BY_NAME: dict[str, ToolSpec] = {t.name: t for t in TOOL_CATALOG}


def get_tool(name: str) -> ToolSpec | None:
    return _BY_NAME.get(name)


def allowed(
    spec: ToolSpec,
    user: UserContext,
    browser_tools: set[str] | None,
    mode_allowlist: frozenset[str] | None = None,
    *,
    mode: AssistantMode = "assistant",
) -> bool:
    if spec.modes is not None and mode not in spec.modes:
        return False
    if mode_allowlist is not None and spec.name not in mode_allowlist:
        return False
    if spec.kind == "browser" and browser_tools is not None and spec.name not in browser_tools:
        return False
    if spec.public:
        return True
    if not user.authenticated:
        return False
    return user.can(spec.capability)


def tool_names_for(
    user: UserContext,
    browser_tools: set[str] | None = None,
    mode: AssistantMode | str | None = "assistant",
) -> list[str]:
    """Sorted list — stable Anthropic prompt-cache prefix."""
    resolved = parse_mode(mode)
    mode_allowlist = get_mode(resolved).tool_allowlist
    return sorted(
        n
        for n, s in _BY_NAME.items()
        if allowed(s, user, browser_tools, mode_allowlist, mode=resolved)
    )


def filter_tools(
    capabilities: list[str],
    allowlist: list[str] | None = None,
    mode: AssistantMode | str | None = "assistant",
) -> list[ToolSpec]:
    """Legacy helper used by tests; prefer tool_names_for."""
    user = UserContext(user_id="x", capabilities=capabilities, authenticated=True)
    browser = set(allowlist) if allowlist is not None else None
    names = tool_names_for(user, browser, mode=mode)
    return [_BY_NAME[n] for n in names]


def to_anthropic_tools(specs: list[ToolSpec] | list[str]) -> list[dict[str, Any]]:
    tools: list[dict[str, Any]] = []
    for item in specs:
        spec = item if isinstance(item, ToolSpec) else _BY_NAME[item]
        entry: dict[str, Any] = {
            "name": spec.name,
            "description": spec.description,
            "input_schema": spec.input_schema,
            "strict": True,
            "eager_input_streaming": True,
        }
        tools.append(entry)
    return tools


def validate_tool_arguments(name: str, arguments: dict[str, Any]) -> str | None:
    """Return an error message if args are invalid, else None."""
    spec = get_tool(name)
    if spec is None:
        return f"unknown tool: {name}"

    schema = spec.input_schema
    props = schema.get("properties") or {}
    required = list(schema.get("required") or [])

    if not isinstance(arguments, dict):
        return "arguments must be an object"

    if schema.get("additionalProperties") is False:
        extra = set(arguments) - set(props)
        if extra:
            return f"unexpected properties: {sorted(extra)}"

    for key in required:
        if key not in arguments or arguments[key] in (None, ""):
            return f"missing required property: {key}"

    for key, value in arguments.items():
        if key not in props:
            continue
        prop = props[key]
        expected = prop.get("type")
        if expected == "string" and not isinstance(value, str):
            return f"{key} must be a string"
        if expected == "integer" and not isinstance(value, int):
            return f"{key} must be an integer"
        if expected == "object" and not isinstance(value, dict):
            return f"{key} must be an object"
        if "enum" in prop and value not in prop["enum"]:
            return f"{key} must be one of {prop['enum']}"

    if name == "navigate":
        route = arguments.get("route", "")
        if not isinstance(route, str) or not route_ok(route):
            return "navigate.route is not an allowed portal route"

    if name == "prefill_booking":
        if not any(
            arguments.get(k) for k in ("schedule_id", "quote_id", "master_details")
        ):
            return "prefill_booking requires schedule_id, quote_id or master_details"

    if name == "propose_booking_submit":
        summary = arguments.get("summary")
        if not isinstance(summary, str) or not summary.strip():
            return "propose_booking_submit.summary is required"
        if not any(
            arguments.get(k)
            for k in ("schedule_id", "origin", "delivery", "master_details")
        ):
            return (
                "propose_booking_submit requires schedule_id or origin/delivery "
                "or master_details"
            )

    if name == "run_sql_readonly":
        sql = arguments.get("sql")
        if not isinstance(sql, str) or len(sql.strip()) < 6:
            return "run_sql_readonly.sql is required"

    return None

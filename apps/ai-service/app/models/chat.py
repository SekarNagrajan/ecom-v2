# Modified by Sekar Nagarajan (2026-10-20 16:40)
"""Request / context models for chat (CONTRACT.md wire shapes)."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from app.modes import AssistantMode


class SelectedRecord(BaseModel):
    type: Literal["booking", "si", "bl", "container"]
    id: str = Field(max_length=64)


class ClientUser(BaseModel):
    """Trusted only in trusted-dev mode; ignored under backend-introspect."""

    id: str
    role: str = "CUSTOMER"
    capabilities: list[str] = Field(default_factory=list)


class ClientContext(BaseModel):
    route: str = "/app"
    locale: str = "en"
    tenant_code: str | None = None
    capabilities: list[str] = Field(default_factory=list)
    selected: SelectedRecord | None = None
    user: ClientUser | None = None


class ToolResult(BaseModel):
    call_id: str
    ok: bool = True
    content: dict[str, Any] | list[Any] | str | None = None
    error: str | None = None


class UserContext(BaseModel):
    user_id: str
    tenant_code: str | None = None
    capabilities: list[str] = Field(default_factory=list)
    email: str | None = None
    display_name: str | None = None
    role: str = "CUSTOMER"
    is_session_admin: bool = False
    is_tenant_admin: bool = False
    is_impersonating: bool = False
    authenticated: bool = True

    def can(self, capability: str | None) -> bool:
        if capability is None:
            return True
        if self.role == "ADMIN" or self.is_session_admin or self.is_impersonating:
            return True
        return capability in self.capabilities

    def capability_profile(self) -> str:
        if self.role == "ADMIN" or self.is_session_admin or self.is_impersonating:
            return "ALL"
        caps = sorted(self.capabilities or [])
        return ",".join(caps) if caps else "NONE"


class ChatRequest(BaseModel):
    conversation_id: str | None = None
    message: str | None = None
    tool_results: list[ToolResult] | None = None
    client_context: ClientContext = Field(default_factory=ClientContext)
    tools: list[str] | None = None
    mode: AssistantMode = "assistant"

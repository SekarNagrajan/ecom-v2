# Modified by Sekar Nagarajan (2026-10-20 20:50)
"""Application settings (pydantic-settings v2)."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import field_validator, model_validator
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Absolute path: the service must find its .env regardless of the
        # directory uvicorn is launched from.
        env_file=str(Path(__file__).resolve().parents[1] / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: Literal["local", "development", "staging", "production"] = "development"
    auth_mode: Literal["trusted-dev", "backend-introspect"] = "trusted-dev"
    redis_url: str = "redis://localhost:6379/0"

    llm_provider: Literal["anthropic", "openai"] = "anthropic"

    anthropic_api_key: str = ""
    openai_api_key: str = ""
    # Any OpenAI-compatible endpoint: Groq, OpenRouter, Together, Mistral,
    # Ollama/LM Studio (local). Empty = api.openai.com.
    openai_base_url: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_guard_model: str = "gpt-4o-mini"
    llm_chat_model: str = "claude-sonnet-5-5"
    llm_guard_model: str = "claude-haiku-5-5"
    # Legacy alias — prefer llm_guard_model
    llm_router_model: str = "claude-haiku-5-5"
    llm_chat_effort: Literal["low", "medium", "high"] = "low"
    # Legacy alias for .env LLM_EFFORT
    llm_effort: str = "low"
    llm_max_tokens: int = 8000
    llm_enable_fallback: bool = True
    llm_enable_compaction: bool = True

    backend_base_url: str = "http://localhost:8080"
    # Optional controlled SQL Analysis service (Phase 4). Empty = unavailable.
    rag_vector_enabled: bool = True
    vector_db_path: str = "var/vector-db"

    sql_service_url: str = ""
    sql_service_token: str = ""
    sql_query_timeout_seconds: int = 30
    rate_limit_per_min: int = 30
    daily_msg_cap: int = 200
    rate_limit_per_day: int = 200
    max_message_length: int = 4000
    max_message_chars: int = 4000
    max_tool_rounds: int = 5
    tool_result_max_bytes: int = 8000

    conversation_ttl_seconds: int = 24 * 60 * 60
    auth_cache_ttl_seconds: int = 60
    # Hard cap; compaction handles context size before this.
    # Never trim Anthropic message history (invalidates thinking / cache).
    max_user_turns_per_conversation: int = 40

    cors_origins: list[str] = []

    dev_user_id: str = "dev-user"
    dev_tenant_code: str = "DEMO"
    # Include SQL for trusted-dev SQL Analysis mode testing
    dev_capabilities: str = "BKG,SI,BL,VGM,CRO,DO,ARN,PAY,SQL"

    @field_validator("dev_capabilities", mode="before")
    @classmethod
    def _caps_str(cls, v: object) -> object:
        return v

    @model_validator(mode="after")
    def _normalize_aliases(self) -> Settings:
        if self.llm_router_model and self.llm_guard_model == "claude-haiku-5-5":
            # Prefer explicit llm_guard_model; fall back to router alias from older .env
            if self.llm_router_model != "claude-haiku-5-5":
                object.__setattr__(self, "llm_guard_model", self.llm_router_model)
        effort = self.llm_effort if self.llm_effort in ("low", "medium", "high") else "low"
        if self.llm_chat_effort == "low" and effort != "low":
            object.__setattr__(self, "llm_chat_effort", effort)  # type: ignore[arg-type]
        if self.daily_msg_cap and self.rate_limit_per_day == 200:
            object.__setattr__(self, "rate_limit_per_day", self.daily_msg_cap)
        if self.max_message_length and self.max_message_chars == 4000:
            object.__setattr__(self, "max_message_chars", self.max_message_length)
        return self

    @model_validator(mode="after")
    def _reject_trusted_dev_in_production(self) -> Settings:
        if self.env == "production" and self.redis_url.startswith("memory://"):
            raise ValueError("REDIS_URL=memory:// is not allowed in production")
        if self.env == "production" and self.auth_mode == "trusted-dev":
            raise ValueError(
                "AUTH_MODE=trusted-dev is forbidden when ENV=production"
            )
        return self

    def parsed_dev_capabilities(self) -> list[str]:
        return [c.strip() for c in self.dev_capabilities.split(",") if c.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

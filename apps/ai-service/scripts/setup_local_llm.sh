#!/usr/bin/env bash
# Created by Sekar Nagarajan (2026-10-20 21:15)
#
# Set up a fully local LLM for the AI service (no API key, no quota, no data
# leaving the machine). Installs Ollama if missing, pulls a model sized for
# this host, and prints the .env block to use.
#
#   ./scripts/setup_local_llm.sh [model]
#
# The install step needs sudo. Re-run any time; every step is idempotent.
set -euo pipefail

MODEL="${1:-llama3.2:3b}"
OLLAMA_HOST_URL="http://localhost:11434"

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }

say "1/4  Checking Ollama"
if command -v ollama >/dev/null 2>&1; then
  echo "    already installed: $(ollama --version 2>&1 | head -1)"
else
  echo "    not installed — downloading the official installer"
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://ollama.com/install.sh | sh
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- https://ollama.com/install.sh | sh
  else
    echo "    ERROR: need curl or wget to install Ollama" >&2
    exit 1
  fi
fi

say "2/4  Starting the Ollama server"
if wget -qO- --timeout=2 "${OLLAMA_HOST_URL}/api/tags" >/dev/null 2>&1; then
  echo "    already serving on ${OLLAMA_HOST_URL}"
else
  if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files 2>/dev/null | grep -q '^ollama'; then
    sudo systemctl enable --now ollama
  else
    nohup ollama serve >/tmp/ollama-serve.log 2>&1 &
  fi
  for _ in $(seq 1 30); do
    wget -qO- --timeout=2 "${OLLAMA_HOST_URL}/api/tags" >/dev/null 2>&1 && break
    sleep 1
  done
  echo "    serving on ${OLLAMA_HOST_URL}"
fi

say "3/4  Pulling model: ${MODEL}"
echo "    (This host has no GPU — a ~3B model keeps replies responsive."
echo "     For stronger tool calling try a 7B model if RAM allows.)"
ollama pull "${MODEL}"

say "4/4  Configure the service"
cat <<ENVBLOCK
    Put this in apps/ai-service/.env (replacing any other LLM_PROVIDER lines):

      LLM_PROVIDER=openai
      OPENAI_API_KEY=ollama
      OPENAI_BASE_URL=${OLLAMA_HOST_URL}/v1
      OPENAI_CHAT_MODEL=${MODEL}
      OPENAI_GUARD_MODEL=${MODEL}

    Then verify tool calling actually works with this model:

      uv run python scripts/check_local_llm.py

ENVBLOCK

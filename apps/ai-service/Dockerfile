# Modified by Sekar Nagarajan (2026-10-21 02:05)
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

COPY pyproject.toml README.md ./
COPY app ./app
# D1: without the corpus the container answers every RAG question with
# nothing. Ship it, and bake the vector index so the first request is warm.
COPY knowledge ./knowledge
COPY scripts ./scripts

RUN uv sync --no-dev --no-editable
RUN uv run python scripts/build_vector_index.py --force

ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

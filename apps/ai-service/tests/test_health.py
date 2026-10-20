# Modified by Sekar Nagarajan (2026-10-20 12:52)
from __future__ import annotations


async def test_healthz(client):
    resp = await client.get("/healthz")
    assert resp.status_code == 200
    assert resp.json() == {"ok": True}


async def test_readyz_ok(client):
    resp = await client.get("/readyz")
    assert resp.status_code == 200
    assert resp.json()["ok"] is True

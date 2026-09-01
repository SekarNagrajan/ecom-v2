// Created by Sekar Nagarajan (2026-09-01 18:40)
// Optional: relays FREE live AIS data from aisstream.io to the browser.
//
// Why a proxy? aisstream.io does not allow direct browser connections — you
// connect from your own server and forward only what clients need. This keeps
// the API key server-side. Free tier: up to 3 open connections per IP and
// 3 subscribed connections per account.
//
// Setup:
//   1. Get a free key at https://aisstream.io
//   2. From repo root (or this folder): pnpm exec ws is already available via
//      installing `ws` locally — or: npm i ws
//   3. AISSTREAM_KEY=your_key node apps/ecom-portal/src/features/tracking/tools/ais-proxy.mjs
//   4. In .env / .env.local for ecom-portal:
//        VITE_AIS_PROXY_URL=ws://localhost:8080
//   5. Restart Vite; open Tracking Live Map — traffic vessels stream in.
//
// Bounding box below defaults to Singapore Strait (reference demo). Change for
// your voyage corridor (e.g. Suez) when testing live data.

import { WebSocketServer, WebSocket } from "ws";

const API_KEY = process.env.AISSTREAM_KEY;
if (!API_KEY) {
  console.error("Set AISSTREAM_KEY. Get a free key at https://aisstream.io");
  process.exit(1);
}

/** [[minLat, minLon], [maxLat, maxLon]] — Singapore Strait demo region. */
const BOUNDING_BOX = [
  [
    [1.0, 103.4],
    [1.5, 104.2],
  ],
];

const PORT = Number(process.env.PORT || 8080);
const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
});
console.log(`Browser AIS proxy listening on ws://localhost:${PORT}`);

function broadcast(vessel) {
  const msg = JSON.stringify(vessel);
  for (const c of clients) {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  }
}

const NAV_STATUS = (code) => {
  if (code === 1) return "anchored";
  if (code === 5) return "moored";
  return "underway";
};

function connectUpstream() {
  const upstream = new WebSocket("wss://stream.aisstream.io/v0/stream");

  upstream.on("open", () => {
    upstream.send(
      JSON.stringify({
        APIKey: API_KEY,
        BoundingBoxes: BOUNDING_BOX,
        FilterMessageTypes: ["PositionReport"],
      }),
    );
    console.log("Connected to aisstream.io");
  });

  upstream.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (data.MessageType !== "PositionReport") return;

    const meta = data.MetaData || {};
    const pr = data.Message?.PositionReport || {};

    broadcast({
      mmsi: String(meta.MMSI ?? pr.UserID ?? ""),
      name: (meta.ShipName || "").trim() || "UNKNOWN",
      lat: pr.Latitude ?? meta.latitude,
      lon: pr.Longitude ?? meta.longitude,
      sog: pr.Sog ?? 0,
      cog: pr.Cog ?? pr.TrueHeading ?? 0,
      status: NAV_STATUS(pr.NavigationalStatus),
      dest: "—",
      eta: "—",
      type: "AIS",
    });
  });

  upstream.on("close", () => {
    console.warn("aisstream.io closed — reconnecting in 5s");
    setTimeout(connectUpstream, 5000);
  });
  upstream.on("error", (e) => {
    console.error("Upstream error:", e.message);
    upstream.close();
  });
}

connectUpstream();

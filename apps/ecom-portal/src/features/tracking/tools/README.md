# Optional: local AIS WebSocket proxy for Tracking Live Map.
#
# 1. Get a key at https://aisstream.io
# 2. AISSTREAM_KEY=... node apps/ecom-portal/src/features/tracking/tools/ais-proxy.mjs
# 3. Set VITE_AIS_PROXY_URL=ws://localhost:8080 in apps/ecom-portal/.env.local
# 4. Restart Vite — Live Map merges live traffic with the tracked mock vessel.
#
# Requires: `ws` (devDependency of @solverminds/ecom-portal).

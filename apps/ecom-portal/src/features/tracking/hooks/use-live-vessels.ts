// Created by Sekar Nagarajan (2026-09-01 18:40)
import { useEffect, useState } from "react";

import type { TrackingAisVessel } from "../types/tracking.types";

/**
 * Optional live AIS via a server-side WebSocket proxy (see tools/ais-proxy.mjs).
 * Browsers must not hold the aisstream API key.
 */
export function useLiveVessels(proxyUrl?: string): TrackingAisVessel[] {
  const [vessels, setVessels] = useState<TrackingAisVessel[]>([]);

  useEffect(() => {
    if (!proxyUrl) {
      setVessels([]);
      return;
    }

    let closed = false;
    const ws = new WebSocket(proxyUrl);

    ws.onmessage = (evt) => {
      try {
        const v = JSON.parse(String(evt.data)) as TrackingAisVessel;
        if (!v.mmsi || typeof v.lat !== "number" || typeof v.lon !== "number") {
          return;
        }
        setVessels((prev) => {
          const idx = prev.findIndex((p) => p.mmsi === v.mmsi);
          const trail: [number, number][] =
            idx >= 0
              ? ([
                  ...(prev[idx].trail ?? []),
                  [v.lat, v.lon] as [number, number],
                ].slice(-12) as [number, number][])
              : [[v.lat, v.lon]];
          const next: TrackingAisVessel = {
            ...v,
            trail,
            status: v.status ?? "underway",
            dest: v.dest ?? "—",
            eta: v.eta ?? "—",
            type: v.type ?? "AIS",
            isPrimary: false,
          };
          if (idx >= 0) {
            const copy = prev.slice();
            copy[idx] = next;
            return copy;
          }
          return [...prev, next];
        });
      } catch {
        /* ignore malformed frames */
      }
    };

    ws.onclose = () => {
      if (!closed) {
        // Soft reconnect is left to remount / env toggle; avoid loops here.
      }
    };

    return () => {
      closed = true;
      ws.close();
    };
  }, [proxyUrl]);

  return vessels;
}

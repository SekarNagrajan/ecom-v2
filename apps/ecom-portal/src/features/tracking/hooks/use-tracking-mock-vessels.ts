// Modified by Sekar Nagarajan (2026-09-01 18:55)
import { useEffect, useRef, useState } from "react";

import type {
  ContainerEquipment,
  TrackingAisVessel,
  TrackingSearchResult,
} from "../types/tracking.types";
import {
  bearing,
  densify,
  seedVesselsFromShipment,
  type LatLng,
} from "../utils/tracking-ais.utils";

export interface TrackingMockFleet {
  vessels: TrackingAisVessel[];
  paths: (LatLng[] | null)[];
}

/**
 * Advances each vessel along a densified great-circle path (reference ShipTrackingMap).
 */
export function useTrackingMockVessels(
  shipment: TrackingSearchResult | null,
  container: ContainerEquipment | null,
  intervalMs = 1200, // ~1.2s
  speedFactor = 3,
  loop = true,
): TrackingMockFleet {
  const pathsRef = useRef<(LatLng[] | null)[]>([]);
  const [vessels, setVessels] = useState<TrackingAisVessel[]>([]);

  useEffect(() => {
    if (!shipment || !container) {
      pathsRef.current = [];
      setVessels([]);
      return;
    }

    const seed = seedVesselsFromShipment(shipment, container);
    pathsRef.current = seed.map((v) =>
      v.waypoints && v.waypoints.length >= 2 ? densify(v.waypoints) : null,
    );

    setVessels(
      seed.map((v, i) => {
        const path = pathsRef.current[i];
        if (!path) {
          const pos = v.pos ?? ([v.lat, v.lon] as LatLng);
          return {
            ...v,
            status: v.status || "anchored",
            lat: pos[0],
            lon: pos[1],
            pos,
          };
        }
        const progress = v.progress ?? 0;
        const idx = progress * (path.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.min(lo + 1, path.length - 1);
        const [lat, lon] = path[lo];
        return {
          ...v,
          status: "underway" as const,
          idx,
          lat,
          lon,
          cog: bearing(path[lo], path[hi]),
        };
      }),
    );
  }, [shipment, container]);

  useEffect(() => {
    if (!shipment || !container || vessels.length === 0) return;

    const id = window.setInterval(() => {
      setVessels((prev) =>
        prev.map((v, i) => {
          const path = pathsRef.current[i];
          if (!path || v.sog === 0) return v;

          let idx = (v.idx ?? 0) + (v.sog / 12) * speedFactor;
          let status: TrackingAisVessel["status"] = "underway";
          if (idx >= path.length - 1) {
            if (loop) {
              idx = 0;
            } else {
              idx = path.length - 1;
              status = "arrived";
            }
          }
          const lo = Math.floor(idx);
          const hi = Math.min(lo + 1, path.length - 1);
          const f = idx - lo;
          const lat = path[lo][0] + (path[hi][0] - path[lo][0]) * f;
          const lon = path[lo][1] + (path[hi][1] - path[lo][1]) * f;
          const cog = bearing(path[lo], path[hi]);
          return { ...v, idx, lat, lon, cog, status };
        }),
      );
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [shipment, container, intervalMs, speedFactor, loop, vessels.length]);

  return { vessels, paths: pathsRef.current };
}

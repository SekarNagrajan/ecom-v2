// Modified by Sekar Nagarajan (2026-09-01 18:55)
import type {
  ContainerEquipment,
  TrackingAisPort,
  TrackingAisStatus,
  TrackingAisVessel,
  TrackingRouteMap,
  TrackingSearchResult,
} from "../types/tracking.types";

export type LatLng = [number, number];

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

export function haversineNm(a: LatLng, b: LatLng): number {
  const R = 3440.065; // nautical miles
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function bearing(a: LatLng, b: LatLng): number {
  const φ1 = toRad(a[0]);
  const φ2 = toRad(b[0]);
  const Δλ = toRad(b[1] - a[1]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Point at fraction f (0..1) along the great circle from a to b. */
export function slerp(a: LatLng, b: LatLng, f: number): LatLng {
  const φ1 = toRad(a[0]);
  const λ1 = toRad(a[1]);
  const φ2 = toRad(b[0]);
  const λ2 = toRad(b[1]);
  const dLat = φ2 - φ1;
  const dLon = λ2 - λ1;
  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(dLon / 2) ** 2;
  const δ = 2 * Math.asin(Math.min(1, Math.sqrt(hav)));
  if (δ < 1e-9) return [a[0], a[1]];
  const A = Math.sin((1 - f) * δ) / Math.sin(δ);
  const B = Math.sin(f * δ) / Math.sin(δ);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  return [toDeg(Math.atan2(z, Math.hypot(x, y))), toDeg(Math.atan2(y, x))];
}

/** Densify waypoints into a smooth, roughly evenly spaced great-circle path. */
export function densify(waypoints: LatLng[], totalPoints = 240): LatLng[] {
  if (waypoints.length < 2) return waypoints.slice();
  const legs: number[] = [];
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const d = Math.max(haversineNm(waypoints[i], waypoints[i + 1]), 0.01);
    legs.push(d);
    total += d;
  }
  const path: LatLng[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const n = Math.max(2, Math.round((legs[i] / total) * totalPoints));
    for (let k = 0; k < n; k++) {
      path.push(slerp(waypoints[i], waypoints[i + 1], k / n));
    }
  }
  path.push(waypoints[waypoints.length - 1]);
  return path;
}

export function buildRouteLatLngs(routeMap?: TrackingRouteMap): LatLng[] {
  if (!routeMap) return [];
  return [
    [routeMap.pol.lat, routeMap.pol.lng],
    ...(routeMap.waypoints ?? []).map((w) => [w.lat, w.lng] as LatLng),
    [routeMap.pod.lat, routeMap.pod.lng],
  ];
}

export function aisStatusClass(status: TrackingAisStatus): string {
  return `tracking-ais-status--${status}`;
}

export function trailClass(
  status: TrackingAisStatus,
  kind: "sailed" | "remaining" = "sailed",
): string {
  return `tracking-ais-trail tracking-ais-trail--${status} tracking-ais-trail--${kind}`;
}

/** Known ports for markers (shipment + regional traffic). */
export const TRACKING_AIS_PORTS: Record<string, TrackingAisPort> = {
  USNYC: { code: "USNYC", name: "New York", pos: [40.68, -74.04] },
  SGSIN: { code: "SGSIN", name: "Singapore", pos: [1.264, 103.84] },
  MYPKG: { code: "MYPKG", name: "Port Klang", pos: [3.0, 101.39] },
  IDTPP: { code: "IDTPP", name: "Tanjung Priok", pos: [-6.1, 106.88] },
  MYTPP: { code: "MYTPP", name: "Tanjung Pelepas", pos: [1.36, 103.55] },
  EGSUE: { code: "EGSUE", name: "Suez", pos: [29.95, 32.55] },
};

/** Seed primary (shipment route) + regional traffic with waypoints. */
export function seedVesselsFromShipment(
  shipment: TrackingSearchResult,
  container: ContainerEquipment,
): TrackingAisVessel[] {
  const routeWaypoints = buildRouteLatLngs(shipment.routeMap);
  const progress = Math.min(
    0.98,
    Math.max(0.02, (shipment.progressPercent ?? 65) / 100),
  );
  const sog = shipment.liveAis?.speedKn ?? 14.2;

  const primary: TrackingAisVessel = {
    mmsi: `PRIM-${container.containerNo}`,
    name: shipment.vesselName,
    lat: shipment.liveAis?.lat ?? routeWaypoints[0]?.[0] ?? 1.26,
    lon: shipment.liveAis?.lng ?? routeWaypoints[0]?.[1] ?? 103.84,
    sog: container.status === "IN_TRANSIT" ? sog : 0,
    cog: shipment.liveAis?.headingDeg ?? 90,
    status: container.status === "IN_TRANSIT" ? "underway" : "moored",
    dest: shipment.podPortCode,
    eta: shipment.eta,
    type: "Container",
    isPrimary: true,
    from: shipment.polPortCode,
    to: shipment.podPortCode,
    waypoints: routeWaypoints.length >= 2 ? routeWaypoints : undefined,
    progress,
  };

  const traffic: TrackingAisVessel[] = [
    {
      mmsi: "565123000",
      name: "NOVA EXPRESS",
      type: "Container",
      sog: 16,
      lat: 1.2,
      lon: 103.45,
      cog: 300,
      status: "underway",
      dest: "MYPKG",
      eta: "—",
      from: "SGSIN",
      to: "MYPKG",
      progress: 0.12,
      waypoints: [
        [1.264, 103.84],
        [1.2, 103.45],
        [1.8, 102.7],
        [2.55, 101.8],
        [3.0, 101.39],
      ],
    },
    {
      mmsi: "477888000",
      name: "SEA HARMONY",
      type: "Container",
      sog: 13,
      lat: 0.7,
      lon: 104.3,
      cog: 160,
      status: "underway",
      dest: "IDTPP",
      eta: "—",
      from: "SGSIN",
      to: "IDTPP",
      progress: 0.45,
      waypoints: [
        [1.264, 103.84],
        [0.7, 104.3],
        [-2.2, 105.6],
        [-5.1, 106.3],
        [-6.1, 106.88],
      ],
    },
    {
      mmsi: "538009000",
      name: "CORAL TRADER",
      type: "Tanker",
      sog: 11,
      lat: 1.28,
      lon: 103.66,
      cog: 80,
      status: "underway",
      dest: "SGSIN",
      eta: "—",
      from: "MYTPP",
      to: "SGSIN",
      progress: 0.6,
      waypoints: [
        [1.36, 103.55],
        [1.28, 103.66],
        [1.24, 103.78],
        [1.264, 103.84],
      ],
    },
    {
      mmsi: "636019000",
      name: "GLOBAL PIONEER",
      type: "Bulk",
      sog: 0,
      lat: 1.31,
      lon: 103.98,
      cog: 210,
      status: "anchored",
      dest: "—",
      eta: "—",
      pos: [1.31, 103.98],
    },
  ];

  return [primary, ...traffic];
}

export function getAisProxyUrl(): string | undefined {
  const raw = import.meta.env.VITE_AIS_PROXY_URL;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function collectPortsFromVessels(
  vessels: TrackingAisVessel[],
  shipment?: TrackingSearchResult | null,
): TrackingAisPort[] {
  const codes = new Set<string>();
  vessels.forEach((v) => {
    if (v.from) codes.add(v.from);
    if (v.to) codes.add(v.to);
  });
  if (shipment?.polPortCode) codes.add(shipment.polPortCode);
  if (shipment?.podPortCode) codes.add(shipment.podPortCode);

  const ports: TrackingAisPort[] = [];
  codes.forEach((code) => {
    const known = TRACKING_AIS_PORTS[code];
    if (known) {
      ports.push(known);
      return;
    }
    if (shipment && code === shipment.polPortCode && shipment.routeMap) {
      ports.push({
        code,
        name: shipment.polPortName,
        pos: [shipment.routeMap.pol.lat, shipment.routeMap.pol.lng],
      });
    } else if (shipment && code === shipment.podPortCode && shipment.routeMap) {
      ports.push({
        code,
        name: shipment.podPortName,
        pos: [shipment.routeMap.pod.lat, shipment.routeMap.pod.lng],
      });
    }
  });
  return ports;
}

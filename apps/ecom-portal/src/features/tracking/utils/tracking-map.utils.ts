// Created by Sekar Nagarajan (2026-09-01 14:49)
import type { TrackingRouteMapPoint } from "../types/tracking.types";

export type ProjectedPoint = { x: number; y: number };

export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/** Voyage-corridor land silhouettes (simplified mock coastlines, lon/lat). */
export const VOYAGE_LANDMASSES: TrackingRouteMapPoint[][] = [
  // Eastern North America
  [
    { lat: 48, lng: -72 },
    { lat: 45, lng: -67 },
    { lat: 41, lng: -70 },
    { lat: 39, lng: -74 },
    { lat: 35, lng: -76 },
    { lat: 30, lng: -81 },
    { lat: 25, lng: -80 },
    { lat: 29, lng: -85 },
    { lat: 35, lng: -88 },
    { lat: 42, lng: -83 },
    { lat: 46, lng: -84 },
    { lat: 49, lng: -80 },
  ],
  // Western Europe + NW Africa
  [
    { lat: 58, lng: -8 },
    { lat: 52, lng: -5 },
    { lat: 48, lng: -5 },
    { lat: 43, lng: -2 },
    { lat: 37, lng: -9 },
    { lat: 32, lng: -10 },
    { lat: 28, lng: -13 },
    { lat: 20, lng: -17 },
    { lat: 15, lng: -17 },
    { lat: 12, lng: -16 },
    { lat: 20, lng: -8 },
    { lat: 28, lng: 0 },
    { lat: 35, lng: 2 },
    { lat: 40, lng: 4 },
    { lat: 44, lng: 8 },
    { lat: 48, lng: 5 },
    { lat: 52, lng: 5 },
    { lat: 56, lng: 2 },
  ],
  // Mediterranean / N. Africa / Levant
  [
    { lat: 37, lng: 10 },
    { lat: 36, lng: 15 },
    { lat: 35, lng: 25 },
    { lat: 32, lng: 32 },
    { lat: 31, lng: 34 },
    { lat: 29, lng: 33 },
    { lat: 27, lng: 34 },
    { lat: 24, lng: 35 },
    { lat: 22, lng: 38 },
    { lat: 20, lng: 40 },
    { lat: 18, lng: 42 },
    { lat: 15, lng: 42 },
    { lat: 14, lng: 48 },
    { lat: 18, lng: 52 },
    { lat: 22, lng: 55 },
    { lat: 26, lng: 52 },
    { lat: 28, lng: 48 },
    { lat: 30, lng: 42 },
    { lat: 32, lng: 36 },
    { lat: 35, lng: 32 },
    { lat: 37, lng: 28 },
    { lat: 38, lng: 20 },
    { lat: 39, lng: 12 },
  ],
  // Indian subcontinent tip
  [
    { lat: 25, lng: 68 },
    { lat: 22, lng: 70 },
    { lat: 15, lng: 74 },
    { lat: 8, lng: 77 },
    { lat: 6, lng: 80 },
    { lat: 10, lng: 80 },
    { lat: 15, lng: 82 },
    { lat: 20, lng: 86 },
    { lat: 22, lng: 88 },
    { lat: 25, lng: 85 },
    { lat: 24, lng: 72 },
  ],
  // SE Asia / Malay / Singapore corridor
  [
    { lat: 20, lng: 95 },
    { lat: 15, lng: 98 },
    { lat: 10, lng: 99 },
    { lat: 5, lng: 100 },
    { lat: 1.5, lng: 103 },
    { lat: 1.2, lng: 104.5 },
    { lat: 3, lng: 105 },
    { lat: 6, lng: 103 },
    { lat: 10, lng: 102 },
    { lat: 14, lng: 101 },
    { lat: 18, lng: 100 },
    { lat: 20, lng: 98 },
  ],
];

export function boundsFromPoints(
  points: TrackingRouteMapPoint[],
  padRatio = 0.12,
): GeoBounds {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max(2, (maxLat - minLat) * padRatio);
  const lngPad = Math.max(4, (maxLng - minLng) * padRatio);
  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}

export function projectWithBounds(
  point: TrackingRouteMapPoint,
  bounds: GeoBounds,
  width: number,
  height: number,
): ProjectedPoint {
  const latSpan = Math.max(0.01, bounds.maxLat - bounds.minLat);
  const lngSpan = Math.max(0.01, bounds.maxLng - bounds.minLng);
  return {
    x: ((point.lng - bounds.minLng) / lngSpan) * width,
    y: ((bounds.maxLat - point.lat) / latSpan) * height,
  };
}

export function projectMany(
  points: TrackingRouteMapPoint[],
  bounds: GeoBounds,
  width: number,
  height: number,
): ProjectedPoint[] {
  return points.map((p) => projectWithBounds(p, bounds, width, height));
}

export function buildRoutePoints(
  route: {
    pol: TrackingRouteMapPoint;
    pod: TrackingRouteMapPoint;
    waypoints?: TrackingRouteMapPoint[];
  },
): TrackingRouteMapPoint[] {
  return [route.pol, ...(route.waypoints ?? []), route.pod];
}

export function polylineLength(pts: ProjectedPoint[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

export function pointAtProgress(
  pts: ProjectedPoint[],
  progress: number,
): ProjectedPoint {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return pts[0];
  const total = polylineLength(pts);
  let remain = (Math.min(100, Math.max(0, progress)) / 100) * total;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    const seg = Math.hypot(dx, dy);
    if (remain <= seg || i === pts.length - 1) {
      const t = seg === 0 ? 0 : remain / seg;
      return {
        x: pts[i - 1].x + dx * t,
        y: pts[i - 1].y + dy * t,
      };
    }
    remain -= seg;
  }
  return pts[pts.length - 1];
}

/** Catmull-Rom densified path for a smoother voyage line. */
export function smoothRoutePoints(
  points: TrackingRouteMapPoint[],
  segmentsPerSpan = 12,
): TrackingRouteMapPoint[] {
  if (points.length < 3) return points;
  const out: TrackingRouteMapPoint[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < segmentsPerSpan; s++) {
      const t = s / segmentsPerSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        lat:
          0.5 *
          (2 * p1.lat +
            (-p0.lat + p2.lat) * t +
            (2 * p0.lat - 5 * p1.lat + 4 * p2.lat - p3.lat) * t2 +
            (-p0.lat + 3 * p1.lat - 3 * p2.lat + p3.lat) * t3),
        lng:
          0.5 *
          (2 * p1.lng +
            (-p0.lng + p2.lng) * t +
            (2 * p0.lng - 5 * p1.lng + 4 * p2.lng - p3.lng) * t2 +
            (-p0.lng + 3 * p1.lng - 3 * p2.lng + p3.lng) * t3),
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export function toSvgPath(pts: ProjectedPoint[]): string {
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

export function buildGraticule(
  bounds: GeoBounds,
  latStep = 10,
  lngStep = 20,
): { parallels: TrackingRouteMapPoint[][]; meridians: TrackingRouteMapPoint[][] } {
  const parallels: TrackingRouteMapPoint[][] = [];
  const meridians: TrackingRouteMapPoint[][] = [];
  const startLat = Math.ceil(bounds.minLat / latStep) * latStep;
  const startLng = Math.ceil(bounds.minLng / lngStep) * lngStep;

  for (let lat = startLat; lat <= bounds.maxLat; lat += latStep) {
    parallels.push([
      { lat, lng: bounds.minLng },
      { lat, lng: bounds.maxLng },
    ]);
  }
  for (let lng = startLng; lng <= bounds.maxLng; lng += lngStep) {
    meridians.push([
      { lat: bounds.minLat, lng },
      { lat: bounds.maxLat, lng },
    ]);
  }
  return { parallels, meridians };
}

/** Approximate great-circle distance in nautical miles. */
export function haversineNm(
  a: TrackingRouteMapPoint,
  b: TrackingRouteMapPoint,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const r = 3440.065; // Earth radius in NM
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function routeDistanceNm(points: TrackingRouteMapPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineNm(points[i - 1], points[i]);
  }
  return total;
}

export function formatCoord(value: number, kind: "lat" | "lng"): string {
  const abs = Math.abs(value).toFixed(2);
  if (kind === "lat") {
    return `${abs}° ${value >= 0 ? "N" : "S"}`;
  }
  return `${abs}° ${value >= 0 ? "E" : "W"}`;
}

export function bearingDeg(
  from: TrackingRouteMapPoint,
  to: TrackingRouteMapPoint,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(from.lat);
  const φ2 = toRad(to.lat);
  const Δλ = toRad(to.lng - from.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

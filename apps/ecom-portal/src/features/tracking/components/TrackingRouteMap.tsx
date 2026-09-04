// Modified by Sekar Nagarajan (2026-09-04 17:25)
import * as maplibregl from "maplibre-gl";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import type {
  TrackingLiveAisPosition,
  TrackingRouteMap as TrackingRouteMapData,
} from "../types/tracking.types";

import "maplibre-gl/dist/maplibre-gl.css";

interface TrackingRouteMapProps {
  routeMap: TrackingRouteMapData;
  liveAis?: TrackingLiveAisPosition | null;
  polLabel: string;
  podLabel: string;
  polTerminal: string;
  podTerminal: string;
  vesselName: string;
  voyage: string;
  etd: string;
  eta: string;
  progressPercent?: number;
}

type LngLat = [number, number];

const ROUTE_SAILED = "#22d3ee";
const ROUTE_REMAINING = "#ffffff";

const SAT_STYLE = {
  version: 8 as const,
  sources: {
    sat: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Imagery © Esri",
    },
    places: {
      type: "raster" as const,
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
    },
  },
  layers: [
    { id: "sat", type: "raster" as const, source: "sat" },
    { id: "places", type: "raster" as const, source: "places" },
  ],
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function makePopup(role: string, title: string, subHtml: string) {
  return new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(
    `<div class="tracking-map-pop__role">${escapeHtml(role)}</div>` +
      `<div class="tracking-map-pop__title">${escapeHtml(title)}</div>` +
      `<div class="tracking-map-pop__sub">${subHtml}</div>`,
  );
}

function makeDot(className: string, background?: string) {
  const el = document.createElement("div");
  el.className = className;
  if (background) el.style.background = background;
  return el;
}

function formatShortDateTime(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[Number(match[2]) - 1] ?? match[2];
  return `${match[3]} ${month} ${match[4]}:${match[5]}`;
}

function projectPoints(map: maplibregl.Map, coords: LngLat[]): string {
  return coords
    .map(([lng, lat]) => {
      const p = map.project([lng, lat]);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

function buildPath(
  routeMap: TrackingRouteMapData,
  liveAis?: TrackingLiveAisPosition | null,
): {
  path: LngLat[];
  sailed: LngLat[];
  remaining: LngLat[];
  vesselIdx: number;
} {
  const pol: LngLat = [routeMap.pol.lng, routeMap.pol.lat];
  const pod: LngLat = [routeMap.pod.lng, routeMap.pod.lat];
  const wps: LngLat[] = (routeMap.waypoints ?? []).map((w) => [w.lng, w.lat]);
  const path: LngLat[] = [pol, ...wps, pod];

  let vesselIdx = Math.floor(path.length / 2);
  if (liveAis) {
    let best = Infinity;
    path.forEach((c, i) => {
      const d = (c[0] - liveAis.lng) ** 2 + (c[1] - liveAis.lat) ** 2;
      if (d < best) {
        best = d;
        vesselIdx = i;
      }
    });
  }

  const sailed = path.slice(0, Math.max(vesselIdx + 1, 2));
  const remaining =
    vesselIdx < path.length - 1 ? path.slice(vesselIdx) : path.slice(-2);

  return { path, sailed, remaining, vesselIdx };
}

/** MapLibre satellite route map — SVG route lines (reliable) + markers/overlays. */
export function TrackingRouteMap(props: TrackingRouteMapProps) {
  const {
    routeMap,
    liveAis,
    polLabel,
    podLabel,
    polTerminal,
    podTerminal,
    vesselName,
    voyage,
    etd,
    eta,
    progressPercent = 0,
  } = props;

  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [svgRoutes, setSvgRoutes] = useState<{
    sailed: string;
    remaining: string;
  } | null>(null);

  const progress = Math.min(100, Math.max(0, progressPercent));
  const progressStyle = {
    ["--tracking-voyage-progress" as string]: String(progress),
  } as CSSProperties;

  const atPlace = (() => {
    const label = liveAis?.locationLabel ?? "";
    if (!label) return null;
    if (/suez/i.test(label)) return "Suez";
    return label.split(/[,·]/)[0]?.trim() || null;
  })();
  const progressHeadline = atPlace
    ? `${progress}% · at ${atPlace}`
    : `${progress}%`;

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let readyObserver: ResizeObserver | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const { path, sailed, remaining, vesselIdx } = buildPath(routeMap, liveAis);
    const pol = path[0];
    const pod = path[path.length - 1];
    const vesselOnPath = path[vesselIdx];

    const syncSvg = (map: maplibregl.Map) => {
      if (cancelled) return;
      setSvgRoutes({
        sailed: projectPoints(map, sailed),
        remaining: projectPoints(map, remaining),
      });
    };

    const mountMap = () => {
      if (cancelled || mapRef.current || !nodeRef.current) return;
      if (
        nodeRef.current.clientHeight < 40 ||
        nodeRef.current.clientWidth < 40
      ) {
        return;
      }

      const map = new maplibregl.Map({
        container: nodeRef.current,
        style: SAT_STYLE as never,
        center: [30, 26],
        zoom: 1.3,
      });
      mapRef.current = map;
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      map.scrollZoom.disable();

      resizeObserver = new ResizeObserver(() => {
        map.resize();
        syncSvg(map);
      });
      resizeObserver.observe(nodeRef.current);

      const onMove = () => syncSvg(map);
      map.on("move", onMove);
      map.on("zoom", onMove);
      map.on("resize", onMove);

      // Only paint after style is fully ready (avoid wiped GL layers).
      // SVG overlay is the visible route; GL lines are a best-effort add-on.
      map.on("load", () => {
        if (cancelled || mapRef.current !== map) return;
        map.resize();

        try {
          const line = (coords: LngLat[]) => ({
            type: "Feature" as const,
            properties: {},
            geometry: { type: "LineString" as const, coordinates: coords },
          });

          if (!map.getSource("remaining")) {
            map.addSource("remaining", {
              type: "geojson",
              data: line(remaining),
            });
            map.addLayer({
              id: "remaining",
              type: "line",
              source: "remaining",
              layout: { "line-cap": "round", "line-join": "round" },
              paint: {
                "line-color": ROUTE_REMAINING,
                "line-width": 2.5,
                "line-dasharray": [2, 2],
                "line-opacity": 0.9,
              },
            });
          }
          if (!map.getSource("sailed")) {
            map.addSource("sailed", { type: "geojson", data: line(sailed) });
            map.addLayer({
              id: "sailed",
              type: "line",
              source: "sailed",
              layout: { "line-cap": "round", "line-join": "round" },
              paint: {
                "line-color": ROUTE_SAILED,
                "line-width": 3.5,
              },
            });
          }
        } catch {
          // SVG overlay still shows the route if GL layers fail
        }

        new maplibregl.Marker({
          element: makeDot(
            "tracking-map-pin tracking-map-pin--origin",
            "#1cbb8c",
          ),
        })
          .setLngLat(pol)
          .setPopup(
            makePopup(
              "Origin · POL",
              polLabel,
              `${escapeHtml(polTerminal)}<br/>ETD: ${escapeHtml(etd)}`,
            ),
          )
          .addTo(map);

        new maplibregl.Marker({
          element: makeDot(
            "tracking-map-pin tracking-map-pin--dest",
            "#ef4444",
          ),
        })
          .setLngLat(pod)
          .setPopup(
            makePopup(
              "Delivery · POD",
              podLabel,
              `${escapeHtml(podTerminal)}<br/>ETA: ${escapeHtml(eta)}`,
            ),
          )
          .addTo(map);

        (routeMap.waypoints ?? []).forEach((w) => {
          new maplibregl.Marker({ element: makeDot("tracking-map-wp") })
            .setLngLat([w.lng, w.lat])
            .setPopup(
              makePopup(
                "Waypoint",
                w.label ?? "Routing point",
                "Great-circle routing point",
              ),
            )
            .addTo(map);
        });

        const vesselEl = document.createElement("div");
        vesselEl.className = "tracking-map-vessel";
        vesselEl.innerHTML =
          '<div class="tracking-map-vessel__ring"></div><div class="tracking-map-vessel__core"></div>';

        const aisSub = liveAis
          ? `${escapeHtml(liveAis.locationLabel)}<br/>${
              liveAis.speedKn
            } kn · heading ${
              liveAis.headingDeg
            }° · ${progress}% complete<br/>Last AIS: ${escapeHtml(
              liveAis.lastUpdate,
            )}`
          : "Position pending";

        new maplibregl.Marker({ element: vesselEl })
          .setLngLat(
            liveAis ? ([liveAis.lng, liveAis.lat] as LngLat) : vesselOnPath,
          )
          .setPopup(
            makePopup("Live vessel", `${vesselName} · ${voyage}`, aisSub),
          )
          .addTo(map);

        const bounds = new maplibregl.LngLatBounds();
        path.forEach((c) => bounds.extend(c));
        if (liveAis) bounds.extend([liveAis.lng, liveAis.lat]);
        map.fitBounds(bounds, {
          padding: { top: 48, bottom: 56, left: 48, right: 48 },
          duration: 0,
        });

        syncSvg(map);

        resizeTimer = setTimeout(() => {
          if (cancelled || mapRef.current !== map) return;
          map.resize();
          map.fitBounds(bounds, {
            padding: { top: 48, bottom: 56, left: 48, right: 48 },
            duration: 0,
          });
          syncSvg(map);
        }, 220);
      });
    };

    mountMap();
    if (!mapRef.current) {
      readyObserver = new ResizeObserver(() => {
        if (mapRef.current) {
          readyObserver?.disconnect();
          readyObserver = null;
          return;
        }
        mountMap();
        if (mapRef.current) {
          readyObserver?.disconnect();
          readyObserver = null;
        }
      });
      readyObserver.observe(node);
    }

    return () => {
      cancelled = true;
      if (resizeTimer) clearTimeout(resizeTimer);
      readyObserver?.disconnect();
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      setSvgRoutes(null);
    };
  }, [
    routeMap,
    liveAis,
    polLabel,
    podLabel,
    polTerminal,
    podTerminal,
    vesselName,
    voyage,
    etd,
    eta,
    progress,
  ]);

  return (
    <div className="tracking-map-shell">
      <div className="tracking-map-voyage" style={progressStyle}>
        <div className="tracking-map-voyage__lead">
          <div className="tracking-map-voyage__title">Voyage status</div>
          <div className="tracking-map-voyage__progress-row">
            <span className="tracking-map-voyage__progress-label">Progress</span>
            <span className="tracking-map-voyage__progress-value">
              {progressHeadline}
            </span>
          </div>
          <div className="tracking-map-voyage__bar" aria-hidden>
            <div className="tracking-map-voyage__bar-fill" />
          </div>
        </div>
        <div className="tracking-map-voyage__rows">
          <div className="tracking-map-voyage__row">
            <span>ETD (actual)</span>
            <strong>{formatShortDateTime(etd)}</strong>
          </div>
          <div className="tracking-map-voyage__row">
            <span>ETA</span>
            <strong>{formatShortDateTime(eta)}</strong>
          </div>
          <div className="tracking-map-voyage__row">
            <span>Speed / heading</span>
            <strong>
              {liveAis
                ? `${liveAis.speedKn} kn · ${liveAis.headingDeg}°`
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      <div className="tracking-map-stage">
        <div ref={nodeRef} className="tracking-map__viewport" />

        {svgRoutes ? (
          <svg className="tracking-map-route-svg" aria-hidden>
            <polyline
              className="tracking-map-route-svg__casing"
              points={svgRoutes.sailed}
              fill="none"
            />
            <polyline
              className="tracking-map-route-svg__remaining"
              points={svgRoutes.remaining}
              fill="none"
              stroke={ROUTE_REMAINING}
            />
            <polyline
              className="tracking-map-route-svg__sailed"
              points={svgRoutes.sailed}
              fill="none"
              stroke={ROUTE_SAILED}
            />
          </svg>
        ) : null}

        <div className="tracking-map-legend">
          <span className="tracking-map-legend__item">
            <span className="tracking-map-legend__dot tracking-map-legend__dot--origin" />
            Origin
          </span>
          <span className="tracking-map-legend__item">
            <span className="tracking-map-legend__dot tracking-map-legend__dot--vessel" />
            Vessel
          </span>
          <span className="tracking-map-legend__item">
            <span className="tracking-map-legend__dot tracking-map-legend__dot--wp" />
            Waypoint
          </span>
          <span className="tracking-map-legend__item">
            <span className="tracking-map-legend__dot tracking-map-legend__dot--dest" />
            Delivery
          </span>
          <span className="tracking-map-legend__item">
            <span className="tracking-map-legend__line tracking-map-legend__line--sailed" />
            Sailed
          </span>
          <span className="tracking-map-legend__item">
            <span className="tracking-map-legend__line tracking-map-legend__line--remaining" />
            Remaining
          </span>
        </div>
      </div>
    </div>
  );
}

// Modified by Sekar Nagarajan (2026-09-01 14:49)
import { AppButton } from "@solverminds/shared-ui";
import { Space, Tooltip, Typography } from "antd";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { AppIcon, Icons } from "../../../components/icons";
import type {
  ContainerEquipment,
  TrackingLiveAisPosition,
  TrackingRouteMap,
  TrackingSearchResult,
} from "../types/tracking.types";
import {
  VOYAGE_LANDMASSES,
  bearingDeg,
  boundsFromPoints,
  buildGraticule,
  buildRoutePoints,
  formatCoord,
  pointAtProgress,
  projectMany,
  projectWithBounds,
  routeDistanceNm,
  smoothRoutePoints,
  toSvgPath,
} from "../utils/tracking-map.utils";

const { Text, Title } = Typography;

type MapSelection =
  | { kind: "pol" }
  | { kind: "pod" }
  | { kind: "waypoint"; index: number }
  | { kind: "vessel" }
  | { kind: "event"; id: string };

interface TrackingLiveMapCanvasProps {
  shipment: TrackingSearchResult;
  container: ContainerEquipment;
  routeMap: TrackingRouteMap;
  liveAis?: TrackingLiveAisPosition;
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MAP_W = 960;
const MAP_H = 480;

export function TrackingLiveMapCanvas({
  shipment,
  container,
  routeMap,
  liveAis,
}: TrackingLiveMapCanvasProps) {
  const [selection, setSelection] = useState<MapSelection>({ kind: "vessel" });
  const [viewBox, setViewBox] = useState<ViewBox>({
    x: 0,
    y: 0,
    w: MAP_W,
    h: MAP_H,
  });
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origin: ViewBox;
  } | null>(null);

  const routeNodes = buildRoutePoints(routeMap);
  const smoothGeo = smoothRoutePoints(routeNodes, 14);
  const bounds = boundsFromPoints(
    [
      ...routeNodes,
      ...(liveAis ? [{ lat: liveAis.lat, lng: liveAis.lng }] : []),
    ],
    0.22,
  );

  const routePts = projectMany(smoothGeo, bounds, MAP_W, MAP_H);
  const nodePts = projectMany(routeNodes, bounds, MAP_W, MAP_H);
  const pathD = toSvgPath(routePts);
  const progress = Math.min(100, Math.max(0, shipment.progressPercent ?? 0));
  const totalNm = routeDistanceNm(routeNodes);
  const remainingNm = Math.max(0, totalNm * (1 - progress / 100));

  const vesselGeo = liveAis
    ? { lat: liveAis.lat, lng: liveAis.lng }
    : routeNodes[
        Math.min(
          routeNodes.length - 1,
          Math.max(0, Math.floor((progress / 100) * (routeNodes.length - 1))),
        )
      ];

  const marker = liveAis
    ? projectWithBounds(liveAis, bounds, MAP_W, MAP_H)
    : pointAtProgress(routePts, progress);

  const headingTowardNext = (() => {
    const at = Math.min(
      routeNodes.length - 2,
      Math.max(0, Math.floor((progress / 100) * (routeNodes.length - 1))),
    );
    return bearingDeg(routeNodes[at], routeNodes[at + 1] ?? routeMap.pod);
  })();
  const shipHeading = liveAis?.headingDeg ?? headingTowardNext;

  let totalLen = 0;
  for (let i = 1; i < routePts.length; i++) {
    totalLen += Math.hypot(
      routePts[i].x - routePts[i - 1].x,
      routePts[i].y - routePts[i - 1].y,
    );
  }
  const doneLen = (progress / 100) * totalLen;

  const trail = container.movements
    .filter((m) => typeof m.lat === "number" && typeof m.lng === "number")
    .map((m) => ({
      event: m,
      point: projectWithBounds(
        { lat: m.lat as number, lng: m.lng as number },
        bounds,
        MAP_W,
        MAP_H,
      ),
    }));

  const graticule = buildGraticule(bounds, 10, 20);
  const landPaths = VOYAGE_LANDMASSES.map((poly) =>
    toSvgPath(projectMany(poly, bounds, MAP_W, MAP_H)),
  );

  const clampView = (next: ViewBox): ViewBox => ({
    x: Math.max(0, Math.min(MAP_W - next.w, next.x)),
    y: Math.max(0, Math.min(MAP_H - next.h, next.y)),
    w: next.w,
    h: next.h,
  });

  const zoomBy = (factor: number) => {
    const w = viewBox.w * factor;
    const h = viewBox.h * factor;
    if (w > MAP_W || h > MAP_H) {
      setViewBox({ x: 0, y: 0, w: MAP_W, h: MAP_H });
      return;
    }
    if (w < MAP_W / 3.5) return;
    setViewBox(
      clampView({
        x: viewBox.x + (viewBox.w - w) / 2,
        y: viewBox.y + (viewBox.h - h) / 2,
        w,
        h,
      }),
    );
  };

  const handleZoomIn = () => zoomBy(0.8);
  const handleZoomOut = () => zoomBy(1.25);

  const handleFit = () => {
    setViewBox({ x: 0, y: 0, w: MAP_W, h: MAP_H });
    setSelection({ kind: "vessel" });
  };

  const handleFocusVessel = () => {
    setSelection({ kind: "vessel" });
    const w = MAP_W / 2.1;
    const h = MAP_H / 2.1;
    setViewBox(
      clampView({
        x: marker.x - w / 2,
        y: marker.y - h / 2,
        w,
        h,
      }),
    );
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origin: viewBox,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag?.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * drag.origin.w;
    const dy = ((e.clientY - drag.startY) / rect.height) * drag.origin.h;
    setViewBox(
      clampView({
        x: drag.origin.x - dx,
        y: drag.origin.y - dy,
        w: drag.origin.w,
        h: drag.origin.h,
      }),
    );
  };

  const onPointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current) dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const selectionCopy = (() => {
    if (selection.kind === "pol") {
      return {
        title: `Port of Loading · ${shipment.polPortCode}`,
        body: `${shipment.polPortName} · ${shipment.polTerminal}`,
        meta: `${formatCoord(routeMap.pol.lat, "lat")} · ${formatCoord(
          routeMap.pol.lng,
          "lng",
        )}`,
      };
    }
    if (selection.kind === "pod") {
      return {
        title: `Port of Discharge · ${shipment.podPortCode}`,
        body: `${shipment.podPortName} · ${shipment.podTerminal}`,
        meta: `${formatCoord(routeMap.pod.lat, "lat")} · ${formatCoord(
          routeMap.pod.lng,
          "lng",
        )}`,
      };
    }
    if (selection.kind === "waypoint") {
      const wp = routeMap.waypoints?.[selection.index];
      return {
        title: wp?.label ?? `Waypoint ${selection.index + 1}`,
        body: "Ocean corridor waypoint",
        meta: wp
          ? `${formatCoord(wp.lat, "lat")} · ${formatCoord(wp.lng, "lng")}`
          : "—",
      };
    }
    if (selection.kind === "event") {
      const ev = container.movements.find((m) => m.id === selection.id);
      return {
        title: ev ? `${ev.eventCode} · ${ev.eventName}` : "Event",
        body: ev ? `${ev.locationName} · ${ev.facility}` : "Event location",
        meta: ev
          ? `${ev.eventDate}${
              typeof ev.lat === "number" && typeof ev.lng === "number"
                ? ` · ${formatCoord(ev.lat, "lat")} · ${formatCoord(
                    ev.lng,
                    "lng",
                  )}`
                : ""
            }`
          : "—",
      };
    }
    return {
      title: `${shipment.vesselName} · Voy ${shipment.voyage}`,
      body: liveAis?.locationLabel ?? container.activityLocation,
      meta: liveAis
        ? `${formatCoord(liveAis.lat, "lat")} · ${formatCoord(
            liveAis.lng,
            "lng",
          )} · SOG ${liveAis.speedKn.toFixed(1)} kn · COG ${shipHeading.toFixed(
            0,
          )}°`
        : `Progress ${progress}% · COG ${shipHeading.toFixed(0)}°`,
    };
  })();

  return (
    <div className="tracking-live-map">
      <div className="tracking-live-map__toolbar custom-scroll">
        <Space size={8} wrap>
          <Text type="secondary">
            Updated {liveAis?.lastUpdate ?? container.activityDate}
            {liveAis?.source ? ` · ${liveAis.source}` : ""}
          </Text>
        </Space>
        <Space size={8} wrap className="tracking-live-map__actions">
          <Tooltip title="Zoom Out">
            <AppButton
              type="default"
              size="small"
              icon={<AppIcon icon={Icons.minus} size={14} />}
              onClick={handleZoomOut}
              aria-label="Zoom Out"
            />
          </Tooltip>
          <Tooltip title="Zoom In">
            <AppButton
              type="default"
              size="small"
              icon={<AppIcon icon={Icons.plus} size={14} />}
              onClick={handleZoomIn}
              aria-label="Zoom In"
            />
          </Tooltip>
          <Tooltip title="Fit Full Route">
            <AppButton
              type="default"
              size="small"
              icon={<AppIcon icon={Icons.expand} size={14} />}
              onClick={handleFit}
              aria-label="Fit Full Route"
            >
              Fit
            </AppButton>
          </Tooltip>
          <Tooltip title="Focus Live AIS Position">
            <AppButton
              type="primary"
              size="small"
              icon={<AppIcon icon={Icons.ship} size={14} />}
              onClick={handleFocusVessel}
            >
              Live Position
            </AppButton>
          </Tooltip>
        </Space>
      </div>

      <div className="tracking-live-map__viewport custom-scroll">
        <svg
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="tracking-live-map__svg tracking-live-map__svg--interactive"
          role="img"
          aria-label={`Interactive live map for container ${container.containerNo}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <defs>
            <pattern
              id="tracking-ocean-hatch"
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 18 L18 0"
                className="tracking-live-map__ocean-hatch"
              />
            </pattern>
          </defs>

          <rect
            x={0}
            y={0}
            width={MAP_W}
            height={MAP_H}
            className="tracking-live-map__ocean"
          />
          <rect
            x={0}
            y={0}
            width={MAP_W}
            height={MAP_H}
            fill="url(#tracking-ocean-hatch)"
            className="tracking-live-map__ocean-overlay"
          />

          {graticule.parallels.map((line, i) => (
            <path
              key={`par-${i}`}
              d={toSvgPath(projectMany(line, bounds, MAP_W, MAP_H))}
              className="tracking-live-map__graticule"
            />
          ))}
          {graticule.meridians.map((line, i) => (
            <path
              key={`mer-${i}`}
              d={toSvgPath(projectMany(line, bounds, MAP_W, MAP_H))}
              className="tracking-live-map__graticule"
            />
          ))}

          {landPaths.map((d, i) => (
            <path
              key={`land-${i}`}
              d={`${d} Z`}
              className="tracking-live-map__land"
            />
          ))}

          <path d={pathD} className="tracking-live-map__rail" fill="none" />
          <path
            d={pathD}
            className="tracking-live-map__done"
            fill="none"
            strokeDasharray={`${doneLen} ${Math.max(0, totalLen - doneLen)}`}
          />

          {nodePts.map((p, i) => {
            const isPol = i === 0;
            const isPod = i === nodePts.length - 1;
            const selected =
              (isPol && selection.kind === "pol") ||
              (isPod && selection.kind === "pod") ||
              (selection.kind === "waypoint" &&
                selection.index === i - 1 &&
                !isPol &&
                !isPod);
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isPol || isPod ? 7 : 4}
                  className={[
                    isPol || isPod
                      ? "tracking-live-map__port"
                      : "tracking-live-map__waypoint",
                    selected ? "tracking-live-map__node--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPol) setSelection({ kind: "pol" });
                    else if (isPod) setSelection({ kind: "pod" });
                    else setSelection({ kind: "waypoint", index: i - 1 });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (isPol) setSelection({ kind: "pol" });
                      else if (isPod) setSelection({ kind: "pod" });
                      else setSelection({ kind: "waypoint", index: i - 1 });
                    }
                  }}
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="tracking-live-map__label"
                >
                  {routeNodes[i]?.label ??
                    (isPol
                      ? shipment.polPortCode
                      : isPod
                      ? shipment.podPortCode
                      : "")}
                </text>
              </g>
            );
          })}

          {trail.map(({ event, point }) => (
            <circle
              key={event.id}
              cx={point.x}
              cy={point.y}
              r={3.5}
              className={[
                "tracking-live-map__event",
                selection.kind === "event" && selection.id === event.id
                  ? "tracking-live-map__node--selected"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="button"
              tabIndex={0}
              aria-label={`${event.eventCode} · ${event.eventName}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelection({ kind: "event", id: event.id });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelection({ kind: "event", id: event.id });
                }
              }}
            />
          ))}

          <g
            className={[
              "tracking-live-map__vessel-group",
              selection.kind === "vessel"
                ? "tracking-live-map__vessel-group--selected"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            transform={`translate(${marker.x} ${marker.y}) rotate(${shipHeading})`}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setSelection({ kind: "vessel" });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelection({ kind: "vessel" });
              }
            }}
          >
            <circle r={18} className="tracking-live-map__pulse" />
            <path
              d="M0 -11 L7 9 L0 5 L-7 9 Z"
              className="tracking-live-map__ship"
            />
            <circle r={1.8} className="tracking-live-map__ship-core" />
          </g>

          <g className="tracking-live-map__scale">
            <line
              x1={24}
              y1={MAP_H - 28}
              x2={124}
              y2={MAP_H - 28}
              className="tracking-live-map__scale-line"
            />
            <text
              x={74}
              y={MAP_H - 34}
              textAnchor="middle"
              className="tracking-live-map__scale-text"
            >
              ~{Math.max(100, Math.round(totalNm / 10))} NM
            </text>
          </g>
        </svg>
        <Text type="secondary" className="tracking-live-map__hint">
          Drag to pan · Zoom / Fit · Click ports, events, or vessel
        </Text>
      </div>

      <div className="tracking-live-map__legend">
        <span>
          <i className="tracking-live-map__swatch tracking-live-map__swatch--land" />
          Land
        </span>
        <span>
          <i className="tracking-live-map__swatch tracking-live-map__swatch--done" />
          Tracked leg
        </span>
        <span>
          <i className="tracking-live-map__swatch tracking-live-map__swatch--rail" />
          Planned leg
        </span>
        <span>
          <i className="tracking-live-map__swatch tracking-live-map__swatch--vessel" />
          Live AIS
        </span>
        <span>
          <i className="tracking-live-map__swatch tracking-live-map__swatch--event" />
          Event trail
        </span>
      </div>

      <div className="tracking-live-map__selection">
        <Title level={5} className="tracking-live-map__selection-title">
          {selectionCopy.title}
        </Title>
        <Text>{selectionCopy.body}</Text>
        <Text type="secondary" className="tracking-live-map__selection-meta">
          {selectionCopy.meta}
        </Text>
      </div>

      <div className="tracking-live-map__ais-grid">
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">Latitude</span>
          <span className="tracking-live-map__ais-value">
            {formatCoord(vesselGeo.lat, "lat")}
          </span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">Longitude</span>
          <span className="tracking-live-map__ais-value">
            {formatCoord(vesselGeo.lng, "lng")}
          </span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">SOG</span>
          <span className="tracking-live-map__ais-value">
            {(liveAis?.speedKn ?? 0).toFixed(1)} kn
          </span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">COG</span>
          <span className="tracking-live-map__ais-value">
            {shipHeading.toFixed(0)}°
          </span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">Progress</span>
          <span className="tracking-live-map__ais-value">{progress}%</span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">Remaining</span>
          <span className="tracking-live-map__ais-value">
            {Math.round(remainingNm).toLocaleString()} NM
          </span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">ETA</span>
          <span className="tracking-live-map__ais-value">{shipment.eta}</span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">Route</span>
          <span className="tracking-live-map__ais-value">
            {shipment.polPortCode} → {shipment.podPortCode}
          </span>
        </div>
        <div className="tracking-live-map__ais-item">
          <span className="tracking-live-map__ais-label">Total</span>
          <span className="tracking-live-map__ais-value">
            {Math.round(totalNm).toLocaleString()} NM
          </span>
        </div>
      </div>
    </div>
  );
}

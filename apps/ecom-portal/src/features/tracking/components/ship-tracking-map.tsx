// Modified by Sekar Nagarajan (2026-09-01 18:55)
import L from "leaflet";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type {
  TrackingAisPort,
  TrackingAisStatus,
  TrackingAisVessel,
  TrackingSearchResult,
} from "../types/tracking.types";
import {
  TRACKING_AIS_PORTS,
  aisStatusClass,
  collectPortsFromVessels,
  trailClass,
  type LatLng,
} from "../utils/tracking-ais.utils";

import "leaflet/dist/leaflet.css";

/** Course-up ship silhouette (bow north at 0°; rotated by COG). */
function vesselIcon(
  courseDeg: number,
  status: TrackingAisStatus,
  selected: boolean,
) {
  const size = selected ? 34 : 28;
  const selectedClass = selected ? " is-selected" : "";
  return L.divIcon({
    className: "tracking-ais-vessel-icon",
    html: `
      <div class="tracking-ais-vessel-icon__rotator ${aisStatusClass(status)}${selectedClass}"
           style="--tracking-ais-cog:${courseDeg}deg;--tracking-ais-size:${size}px">
        <svg viewBox="0 0 24 24" class="tracking-ais-vessel-icon__svg" aria-hidden="true">
          <path d="M12 2.5
                   C13.2 2.5 14.2 4.2 14.6 6.5
                   L15.2 11.5 L16.5 14.2 L16.8 18.5 L15.2 21.2
                   L8.8 21.2 L7.2 18.5 L7.5 14.2 L8.8 11.5 L9.4 6.5
                   C9.8 4.2 10.8 2.5 12 2.5 Z"
                fill="currentColor"
                class="tracking-ais-vessel-icon__hull"/>
          <rect x="10.2" y="10.5" width="3.6" height="4.2" rx="0.6"
                fill="currentColor" opacity="0.35"
                class="tracking-ais-vessel-icon__bridge"/>
          <path d="M12 2.5
                   C13.2 2.5 14.2 4.2 14.6 6.5
                   L15.2 11.5 L16.5 14.2 L16.8 18.5 L15.2 21.2
                   L8.8 21.2 L7.2 18.5 L7.5 14.2 L8.8 11.5 L9.4 6.5
                   C9.8 4.2 10.8 2.5 12 2.5 Z"
                fill="none" stroke="currentColor" stroke-width="1.4"
                stroke-linejoin="round"
                class="tracking-ais-vessel-icon__outline"/>
        </svg>
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function portIcon() {
  return L.divIcon({
    className: "tracking-ais-port-icon",
    html: `<div class="tracking-ais-port-icon__dot"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function FitToRoutes({
  paths,
  vessels,
}: {
  paths: (LatLng[] | null)[];
  vessels: TrackingAisVessel[];
}) {
  const map = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const pts: LatLng[] = [];
    paths.forEach((p) => {
      if (p) p.forEach((c) => pts.push(c));
    });
    vessels.forEach((v) => {
      if (v.pos) pts.push(v.pos);
      else pts.push([v.lat, v.lon]);
    });
    if (!pts.length) return;
    map.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 10 });
    done.current = true;
  }, [paths, vessels, map]);

  return null;
}

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80); // after drawer open
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
}

function PopupRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="tracking-ais-popup__row">
      <span className="tracking-ais-popup__key">{label}</span>
      <span className="tracking-ais-popup__val">{value}</span>
    </div>
  );
}

interface ShipTrackingMapProps {
  vessels: TrackingAisVessel[];
  paths: (LatLng[] | null)[];
  shipment?: TrackingSearchResult | null;
  showSeamarks?: boolean;
  center?: LatLng;
  zoom?: number;
}

export function ShipTrackingMap({
  vessels,
  paths,
  shipment,
  showSeamarks = true,
  center = [0.5, 104],
  zoom = 7,
}: ShipTrackingMapProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const ports = collectPortsFromVessels(vessels, shipment);

  const primary = vessels.find((v) => v.isPrimary);
  const mapCenter: LatLng = primary
    ? [primary.lat, primary.lon]
    : center;

  const legend = [
    { label: "Under way", status: "underway" as const },
    { label: "At anchor", status: "anchored" as const },
    { label: "Moored", status: "moored" as const },
  ];

  return (
    <div className="tracking-ais-map">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom
        className="tracking-ais-map__leaflet tracking-ais-map__leaflet--ocean"
      >
        <TileLayer
          attribution="Tiles &copy; Esri — Sources: GEBCO, NOAA, National Geographic, and others"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={13}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={13}
        />
        {showSeamarks ? (
          <TileLayer
            attribution="Seamarks &copy; OpenSeaMap contributors"
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            maxZoom={18}
          />
        ) : null}

        <InvalidateOnMount />
        <FitToRoutes paths={paths} vessels={vessels} />

        {ports.map((p: TrackingAisPort) => (
          <Marker key={p.code} position={p.pos} icon={portIcon()}>
            <Popup>
              <div className="tracking-ais-popup">
                <div className="tracking-ais-popup__title">
                  {p.name} ({p.code})
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {vessels.map((v, i) => {
          const isSel =
            selected === v.mmsi || Boolean(v.isPrimary && !selected);
          const path = paths[i] ?? null;
          const cut = path ? Math.floor(v.idx ?? 0) : 0;
          const here: LatLng = [v.lat, v.lon];
          const sailed: LatLng[] | null = path
            ? [...path.slice(0, cut + 1), here]
            : null;
          const ahead: LatLng[] | null = path
            ? [here, ...path.slice(cut + 1)]
            : null;
          const pct =
            path && path.length > 1
              ? Math.round(((v.idx ?? 0) / (path.length - 1)) * 100)
              : null;
          const fromName =
            (v.from && TRACKING_AIS_PORTS[v.from]?.name) || v.from;
          const toName = (v.to && TRACKING_AIS_PORTS[v.to]?.name) || v.to;

          return (
            <Fragment key={v.mmsi}>
              {ahead && ahead.length > 1 ? (
                <Polyline
                  positions={ahead}
                  pathOptions={{
                    className: `${trailClass(v.status, "remaining")}${isSel ? " is-selected" : ""}`,
                  }}
                />
              ) : null}
              {sailed && sailed.length > 1 ? (
                <Polyline
                  positions={sailed}
                  pathOptions={{
                    className: `${trailClass(v.status, "sailed")}${isSel ? " is-selected" : ""}`,
                  }}
                />
              ) : null}
              <Marker
                position={here}
                icon={vesselIcon(v.cog ?? 0, v.status, isSel)}
                eventHandlers={{
                  click: () => setSelected(v.mmsi),
                }}
              >
                <Popup>
                  <div className="tracking-ais-popup">
                    <div className="tracking-ais-popup__title">{v.name}</div>
                    {v.isPrimary ? (
                      <div className="tracking-ais-popup__badge">
                        Tracked vessel
                      </div>
                    ) : null}
                    <PopupRow label="MMSI" value={v.mmsi} />
                    <PopupRow label="Type" value={v.type} />
                    <PopupRow label="Status" value={v.status} />
                    <PopupRow label="Speed" value={`${v.sog} kn`} />
                    <PopupRow
                      label="Course"
                      value={`${Math.round(v.cog ?? 0)}°`}
                    />
                    {fromName ? (
                      <PopupRow label="From" value={fromName} />
                    ) : null}
                    {toName ? <PopupRow label="To" value={toName} /> : null}
                    {pct != null ? (
                      <PopupRow label="Voyage" value={`${pct}% complete`} />
                    ) : null}
                    <PopupRow label="Destination" value={v.dest} />
                    <PopupRow label="ETA" value={v.eta} />
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          );
        })}
      </MapContainer>

      <div className="tracking-ais-legend">
        <div className="tracking-ais-legend__title">
          Vessels · {vessels.length}
        </div>
        {legend.map((item) => (
          <div key={item.label} className="tracking-ais-legend__row">
            <span
              className={`tracking-ais-legend__swatch ${aisStatusClass(item.status)}`}
            />
            {item.label}
          </div>
        ))}
        <div className="tracking-ais-legend__row tracking-ais-legend__row--line">
          <span className="tracking-ais-legend__line tracking-ais-legend__line--sailed" />
          sailed
        </div>
        <div className="tracking-ais-legend__row tracking-ais-legend__row--line">
          <span className="tracking-ais-legend__line tracking-ais-legend__line--remaining" />
          remaining
        </div>
      </div>
    </div>
  );
}

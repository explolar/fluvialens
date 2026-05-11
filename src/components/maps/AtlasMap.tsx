"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import type { GeoJsonObject } from "geojson";

const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const indiaStyle = {
  color: "#ffb84d", // warm amber — readable against the dark map
  weight: 2.5,
  opacity: 0.95,
  fillColor: "#ffb84d",
  fillOpacity: 0.05,
};

export default function AtlasMap({
  center,
  pin,
  onPick,
}: {
  center: [number, number];
  pin: { lat: number; lon: number; label?: string } | null;
  onPick: (lat: number, lon: number) => void;
}) {
  const [india, setIndia] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
    fetch("/india-outline.geojson")
      .then((r) => r.json())
      .then((g) => setIndia(g))
      .catch(() => {});
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={4}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />

        {india && <GeoJSON data={india} style={indiaStyle} interactive={false} />}

        <ClickHandler onPick={onPick} />
        {pin && (
          <Marker position={[pin.lat, pin.lon]}>
            <Popup>{pin.label ?? `${pin.lat.toFixed(3)}, ${pin.lon.toFixed(3)}`}</Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute top-3 left-3 z-[400] flex flex-col gap-1.5">
        <span className="inline-block w-fit px-2 py-1 rounded-md bg-bg/90 backdrop-blur border border-border-soft text-[0.55rem] font-mono uppercase tracking-[0.15em] text-muted">
          India · Survey-of-India aligned overlay
        </span>
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 z-[400]">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg/90 backdrop-blur border border-border-soft text-[0.55rem] font-mono uppercase tracking-[0.12em] text-muted">
          <span
            className="w-3 h-[2px]"
            style={{ background: "#ffb84d" }}
            aria-hidden
          />
          India boundary
        </span>
      </div>
    </div>
  );
}

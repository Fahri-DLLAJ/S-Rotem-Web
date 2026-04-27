"use client";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { Hospital } from "@/app/emergency/page";

interface Props {
  hospitals: Hospital[];
  userCoords: { lat: number; lng: number } | null;
  selected: Hospital | null;
  onSelect: (h: Hospital) => void;
}

const KLATEN: [number, number] = [-7.7059, 110.6010];

const POPUP_CSS = `
  .h-popup { font-family: system-ui, sans-serif; min-width: 180px; color: #f1f5f9; }
  .h-popup-title { font-weight: 700; font-size: 12px; margin-bottom: 3px; }
  .h-popup-sub   { font-size: 10px; color: #94a3b8; margin-bottom: 6px; }
  .h-popup-row   { font-size: 10px; color: #cbd5e1; margin-bottom: 3px; display:flex; align-items:center; gap:4px; }
  .leaflet-popup-content-wrapper { background:#1e293b !important; border:1px solid rgba(255,255,255,0.1) !important;
                                    border-radius:12px !important; box-shadow:0 8px 32px rgba(0,0,0,0.5) !important; }
  .leaflet-popup-tip             { background:#1e293b !important; }
  .leaflet-popup-close-button    { color:#94a3b8 !important; }
`;

export default function HospitalMap({ hospitals, userCoords, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LeafletMap | null>(null);
  const markersRef   = useRef<Map<string, Marker>>(new Map());
  const userMarkerRef = useRef<Marker | null>(null);

  // ── Init map once ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    if (!document.getElementById("h-popup-css")) {
      const s = document.createElement("style");
      s.id = "h-popup-css";
      s.textContent = POPUP_CSS;
      document.head.appendChild(s);
    }

    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const map = L.map(containerRef.current, {
        center: KLATEN,
        zoom: 13,
        zoomControl: false,
        attributionControl: true,
      });
      mapRef.current = map;
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // ── Render hospital markers ────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      const map = mapRef.current!;

      // Remove old markers
      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current.clear();

      hospitals.forEach((h, idx) => {
        const isFirst = idx === 0 && !!userCoords;
        const color = isFirst ? "#22c55e" : "#3b82f6";
        const icon = L.divIcon({
          html: `<div style="
            width:32px;height:32px;background:${color};
            border:2.5px solid rgba(255,255,255,0.85);border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.45);
            display:flex;align-items:center;justify-content:center;">
            <span style="transform:rotate(45deg);font-size:13px;line-height:1">🏥</span>
          </div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -36],
        });

        const popup = `<div class="h-popup">
          <div class="h-popup-title">${h.name}</div>
          <div class="h-popup-sub">${h.type}</div>
          <div class="h-popup-row">📍 ${h.address}</div>
          <div class="h-popup-row">📞 ${h.phone}</div>
          ${h.distance ? `<div class="h-popup-row">🧭 ${h.distance}</div>` : ""}
        </div>`;

        const marker = L.marker([h.lat, h.lng], { icon })
          .addTo(map)
          .bindPopup(popup, { maxWidth: 240 });
        marker.on("click", () => onSelect(h));
        markersRef.current.set(h.id, marker);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitals]);

  // ── User location marker ───────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !userCoords) return;
    import("leaflet").then((L) => {
      const map = mapRef.current!;
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      const icon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;background:#3b82f6;
          border:3px solid white;border-radius:50%;
          box-shadow:0 0 0 4px rgba(59,130,246,0.3);">
        </div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon })
        .addTo(map)
        .bindPopup("<div style='color:#f1f5f9;font-size:11px;font-weight:600'>📍 Lokasi Anda</div>");
      map.flyTo([userCoords.lat, userCoords.lng], 14, { duration: 1 });
    });
  }, [userCoords]);

  // ── Pan to selected hospital ───────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    const marker = markersRef.current.get(selected.id);
    if (marker) {
      mapRef.current.flyTo([selected.lat, selected.lng], 15, { duration: 0.8 });
      marker.openPopup();
    }
  }, [selected]);

  return <div ref={containerRef} className="w-full h-full" style={{ isolation: "isolate" }} />;
}

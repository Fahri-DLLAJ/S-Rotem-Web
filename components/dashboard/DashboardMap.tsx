"use client";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Layer } from "leaflet";
import { Device, Report } from "@/store/appStore";

interface Props {
  reports: Report[];
  devices: Device[];
}

const KLATEN: [number, number] = [-7.7059, 110.601];

const POPUP_CSS = `
  .d-popup { font-family:system-ui,sans-serif; font-size:11px; color:#f1f5f9; min-width:160px; }
  .d-popup b { font-size:12px; }
  .leaflet-popup-content-wrapper { background:#1e293b !important; border:1px solid rgba(255,255,255,0.1) !important;
    border-radius:10px !important; box-shadow:0 6px 24px rgba(0,0,0,0.5) !important; }
  .leaflet-popup-tip { background:#1e293b !important; }
  .leaflet-popup-close-button { color:#94a3b8 !important; }
`;

function pin(L: typeof import("leaflet"), emoji: string, bg: string) {
  return L.divIcon({
    html: `<div style="width:30px;height:30px;background:${bg};border:2px solid rgba(255,255,255,0.8);
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);font-size:13px;line-height:1">${emoji}</span></div>`,
    className: "", iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -34],
  });
}

const DEVICE_PIN: Record<Device["type"], { emoji: string; bg: string }> = {
  "traffic-light": { emoji: "🚦", bg: "#16a34a" },
  lamp:            { emoji: "💡", bg: "#ca8a04" },
  sensor:          { emoji: "🏫", bg: "#7c3aed" },
  camera:          { emoji: "📷", bg: "#2563eb" },
};

const REPORT_PIN: Record<string, { emoji: string; bg: string }> = {
  Kecelakaan:   { emoji: "🚨", bg: "#dc2626" },
  Banjir:       { emoji: "🌊", bg: "#0284c7" },
  "Jalan Rusak":{ emoji: "⚠️", bg: "#d97706" },
  default:      { emoji: "⚠️", bg: "#d97706" },
};

export default function DashboardMap({ reports, devices }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LeafletMap | null>(null);
  const layersRef    = useRef<Layer[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;
    if (!document.getElementById("d-popup-css")) {
      const s = document.createElement("style");
      s.id = "d-popup-css"; s.textContent = POPUP_CSS;
      document.head.appendChild(s);
    }
    import("leaflet").then((L) => {
      if (!containerRef.current || mapRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      const map = L.map(containerRef.current, { center: KLATEN, zoom: 12, zoomControl: false });
      mapRef.current = map;
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", maxZoom: 19,
      }).addTo(map);
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      const map = mapRef.current!;
      layersRef.current.forEach((l) => map.removeLayer(l));
      layersRef.current = [];

      devices.forEach((d) => {
        const p = DEVICE_PIN[d.type];
        const m = L.marker([d.lat, d.lng], { icon: pin(L, p.emoji, p.bg) })
          .addTo(map)
          .bindPopup(`<div class="d-popup"><b>${d.name}</b><br/><span style="color:#94a3b8">${d.type}</span></div>`);
        layersRef.current.push(m);
      });

      reports.forEach((r) => {
        const p = REPORT_PIN[r.type] ?? REPORT_PIN.default;
        const m = L.marker([r.lat, r.lng], { icon: pin(L, p.emoji, p.bg) })
          .addTo(map)
          .bindPopup(`<div class="d-popup"><b>${r.type}</b><br/>${r.location}</div>`);
        layersRef.current.push(m);
      });
    });
  }, [devices, reports]);

  return <div ref={containerRef} className="w-full h-full" style={{ isolation: "isolate" }} />;
}

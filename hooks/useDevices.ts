"use client";
import { useEffect } from "react";
import { useAppStore, Device } from "@/store/appStore";
import { rtdb, ref, onValue, off } from "@/lib/firebase";

const MOCK_DEVICES: Device[] = [
  { id: "d1", name: "Kamera Simpang Pedan",        type: "camera",        lat: -7.7059, lng: 110.6010, status: "active",  ip: "192.168.1.101", lastSeen: new Date().toISOString() },
  { id: "d2", name: "Lampu Jalan Jl. Pemuda",      type: "lamp",          lat: -7.7080, lng: 110.5980, status: "active",  ip: "192.168.1.102", lastSeen: new Date().toISOString() },
  { id: "d3", name: "ZoSS SDN Klaten Tengah",      type: "sensor",        lat: -7.7120, lng: 110.6050, status: "offline", lastSeen: new Date(Date.now() - 86400000).toISOString() },
  { id: "d4", name: "Traffic Light Alun-Alun",     type: "traffic-light", lat: -7.7065, lng: 110.6025, status: "active",  ip: "192.168.1.104", lastSeen: new Date().toISOString() },
  { id: "d5", name: "Kamera Simpang Prambanan",    type: "camera",        lat: -7.7520, lng: 110.4910, status: "active",  ip: "192.168.1.105", lastSeen: new Date().toISOString() },
  { id: "d6", name: "Traffic Light Jl. Solo",      type: "traffic-light", lat: -7.7200, lng: 110.5900, status: "active",  ip: "192.168.1.106", lastSeen: new Date().toISOString() },
  { id: "d7", name: "ZoSS SDN Ceper",              type: "sensor",        lat: -7.6850, lng: 110.6200, status: "active",  ip: "192.168.1.107", lastSeen: new Date().toISOString() },
  { id: "d8", name: "Lampu Jalan Jl. Merbabu",     type: "lamp",          lat: -7.7010, lng: 110.6080, status: "offline", lastSeen: new Date(Date.now() - 3600000).toISOString() },
];

export function useDevices() {
  const { user, devices, setDevices } = useAppStore();

  useEffect(() => {
    // If authenticated, subscribe to Firebase RTDB /devices
    if (user) {
      const devicesRef = ref(rtdb, "devices");
      onValue(devicesRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const parsed: Device[] = Object.entries(val).map(([id, data]) => ({
            id,
            ...(data as Omit<Device, "id">),
          }));
          setDevices(parsed);
        } else {
          setDevices([]);
        }
      });
      return () => off(devicesRef);
    } else {
      // Not authenticated — use mock data
      if (devices.length === 0) setDevices(MOCK_DEVICES);
    }
  }, [user]);

  const activeCount = devices.filter((d) => d.status === "active").length;

  const byType = (type: Device["type"]) => devices.filter((d) => d.type === type);

  const systemStatus = (
    ["camera", "lamp", "traffic-light", "sensor"] as Device["type"][]
  ).map((type) => {
    const group = byType(type);
    const online = group.filter((d) => d.status === "active").length;
    const total = group.length;
    const status: "online" | "warning" | "offline" =
      total === 0 ? "offline" : online === total ? "online" : online > 0 ? "warning" : "offline";
    const labelMap: Record<Device["type"], string> = {
      camera: "Kamera",
      lamp: "Lampu Jalan",
      "traffic-light": "Traffic Light",
      sensor: "ZoSS / Sensor",
    };
    return { type, label: labelMap[type], online, total, status };
  });

  return { devices, activeCount, byType, systemStatus };
}

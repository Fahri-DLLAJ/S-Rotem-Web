"use client";
import { useEffect } from "react";
import { useAppStore, Report } from "@/store/appStore";
import { rtdb, ref, onValue, off } from "@/lib/firebase";

const MOCK_REPORTS: Report[] = [
  {
    id: "1",
    type: "Kecelakaan",
    location: "Simpang Pedan, Klaten",
    lat: -7.7059,
    lng: 110.6010,
    severity: "high",
    status: "active",
    description: "Tabrakan motor vs sepeda di persimpangan, satu korban luka ringan.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    type: "Jalan Rusak",
    location: "Jl. Raya Klaten–Prambanan KM 8",
    lat: -7.7350,
    lng: 110.5400,
    severity: "medium",
    status: "pending",
    description: "Lubang besar di jalur kiri, lebar ±60cm, kedalaman 15cm.",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    type: "Banjir",
    location: "Jl. Pemuda, Klaten Tengah",
    lat: -7.7080,
    lng: 110.5980,
    severity: "critical",
    status: "active",
    description: "Genangan air setinggi 30cm akibat hujan deras, lalu lintas terganggu.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "4",
    type: "Kecelakaan",
    location: "Jl. Solo–Yogya, Prambanan",
    lat: -7.7520,
    lng: 110.4910,
    severity: "critical",
    status: "active",
    description: "Kecelakaan beruntun 3 kendaraan, arus lalu lintas dialihkan.",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "5",
    type: "Jalan Rusak",
    location: "Jl. Merbabu, Klaten Utara",
    lat: -7.7010,
    lng: 110.6080,
    severity: "low",
    status: "resolved",
    description: "Retak memanjang di bahu jalan, sudah ditambal sementara.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function useReports() {
  const { user, reports, setReports } = useAppStore();

  useEffect(() => {
    // If authenticated, subscribe to Firebase RTDB /reports
    if (user) {
      const reportsRef = ref(rtdb, "reports");
      onValue(reportsRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const parsed: Report[] = Object.entries(val).map(([id, data]) => ({
            id,
            ...(data as Omit<Report, "id">),
          }));
          setReports(parsed);
        } else {
          setReports([]);
        }
      });
      return () => off(reportsRef);
    } else {
      // Not authenticated — use mock data so the UI is never empty
      if (reports.length === 0) setReports(MOCK_REPORTS);
    }
  }, [user]);

  const todayCount = reports.filter(
    (r) => new Date(r.timestamp).toDateString() === new Date().toDateString()
  ).length;

  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  const highRiskCount = reports.filter(
    (r) => r.severity === "critical" || r.severity === "high"
  ).length;

  // Latest 5 reports sorted by timestamp desc
  const latestReports = [...reports]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return { reports, todayCount, resolvedCount, highRiskCount, latestReports };
}

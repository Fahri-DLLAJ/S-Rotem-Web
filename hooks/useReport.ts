"use client";
import { useState, useCallback } from "react";
import { rtdb, ref, push } from "@/lib/firebase";
import { appendToSheet } from "@/lib/sheets";

export type IncidentType =
  | "Kecelakaan"
  | "Jalan Rusak"
  | "Pemadaman"
  | "Hambatan Jalan"
  | "Kondisi Berbahaya";

export type ReportSeverity = "low" | "medium" | "high" | "critical";

export type TrackingStatus =
  | "idle"
  | "submitting"
  | "received"
  | "verifying"
  | "handling"
  | "completed"
  | "error";

export interface ReportForm {
  name: string;
  phone: string;
  type: IncidentType | "";
  description: string;
  lat: number | null;
  lng: number | null;
  locationLabel: string;
  severity: ReportSeverity;
  imageFile: File | null;
  videoFile: File | null;
}

const INITIAL: ReportForm = {
  name: "",
  phone: "",
  type: "",
  description: "",
  lat: null,
  lng: null,
  locationLabel: "",
  severity: "medium",
  imageFile: null,
  videoFile: null,
};

export function useReport() {
  const [form, setForm]             = useState<ReportForm>(INITIAL);
  const [tracking, setTracking]     = useState<TrackingStatus>("idle");
  const [reportId, setReportId]     = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError]     = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const update = useCallback(<K extends keyof ReportForm>(key: K, value: ReportForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  /** GPS + reverse-geocode — updates form AND returns coords for callers */
  const getLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocError("Perangkat Anda tidak mendukung GPS.");
        resolve(null);
        return;
      }
      setLocLoading(true);
      setLocError(null);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setForm((f) => ({ ...f, lat, lng }));
          try {
            const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const label = data.display_name?.split(",").slice(0, 3).join(", ") ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setForm((f) => ({ ...f, locationLabel: label }));
          } catch {
            setForm((f) => ({ ...f, locationLabel: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
          }
          setLocLoading(false);
          resolve({ lat, lng });
        },
        (err) => {
          setLocLoading(false);
          if (err.code === 1) {
            // PERMISSION_DENIED — browser already showed its prompt and user declined,
            // or the site permission is permanently blocked in browser settings.
            setLocError(
              "Izin lokasi ditolak. Buka pengaturan browser Anda dan izinkan akses lokasi untuk situs ini, lalu coba lagi."
            );
          } else if (err.code === 2) {
            setLocError("Lokasi tidak tersedia. Pastikan GPS aktif dan coba lagi.");
          } else {
            setLocError("Waktu habis saat mendeteksi lokasi. Coba lagi.");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  /** Full report submit — saves files + JSON via API, then mirrors to RTDB + Sheets */
  const submit = useCallback(async () => {
    if (!form.type || form.lat === null || form.lng === null) return;
    setTracking("submitting");
    setUploadProgress(0);

    try {
      // ── 1. Build multipart form ──────────────────────────────────────────
      const fd = new FormData();
      fd.append("name",        form.name);
      fd.append("phone",       form.phone);
      fd.append("type",        form.type);
      fd.append("description", form.description);
      fd.append("location",    form.locationLabel || `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`);
      fd.append("lat",         String(form.lat));
      fd.append("lng",         String(form.lng));
      fd.append("severity",    form.severity);
      if (form.imageFile) fd.append("image", form.imageFile);
      if (form.videoFile) fd.append("video", form.videoFile);

      setUploadProgress(30);

      // ── 2. POST to Next.js API route (saves to disk) ─────────────────────
      const res  = await fetch("/api/report", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "API error");

      setUploadProgress(70);
      setReportId(data.id);

      // ── 3. Mirror to Firebase RTDB ───────────────────────────────────────
      try {
        push(ref(rtdb, "reports"), data.report);
      } catch { /* RTDB optional — don't fail the whole submit */ }

      // ── 4. Mirror to Google Sheets ───────────────────────────────────────
      try {
        await appendToSheet({
          ...data.report,
          lat: String(data.report.lat),
          lng: String(data.report.lng),
        });
      } catch { /* Sheets optional */ }

      setUploadProgress(100);
      setTracking("received");
      setTimeout(() => setTracking("verifying"), 3000);
      setTimeout(() => setTracking("handling"),  7000);
    } catch {
      setTracking("error");
    }
  }, [form]);

  /** Emergency quick-submit */
  const submitEmergency = useCallback(async (lat: number, lng: number, label: string) => {
    setTracking("submitting");
    const fd = new FormData();
    fd.append("name",        "Darurat");
    fd.append("phone",       "");
    fd.append("type",        "Kecelakaan");
    fd.append("description", "Laporan darurat otomatis");
    fd.append("location",    label);
    fd.append("lat",         String(lat));
    fd.append("lng",         String(lng));
    fd.append("severity",    "critical");

    try {
      const res  = await fetch("/api/report", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error();
      setReportId(data.id);
      try { push(ref(rtdb, "reports"), { ...data.report, status: "active" }); } catch { /* optional */ }
      try { await appendToSheet({ ...data.report, lat: String(lat), lng: String(lng) }); } catch { /* optional */ }
      setTracking("received");
      setTimeout(() => setTracking("handling"), 2000);
    } catch {
      setTracking("error");
    }
  }, []);

  const reset = useCallback(() => {
    setForm(INITIAL);
    setTracking("idle");
    setReportId(null);
    setUploadProgress(0);
    setLocError(null);
  }, []);

  return { form, update, tracking, reportId, locLoading, locError, uploadProgress, getLocation, submit, submitEmergency, reset };
}

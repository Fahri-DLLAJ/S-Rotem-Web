import { create } from "zustand";
import { User } from "firebase/auth";

export interface StatusHistoryEntry {
  status: "pending" | "active" | "resolved";
  note: string;
  timestamp: string;
}

export interface Report {
  id: string;
  type: string;
  location: string;
  lat: number;
  lng: number;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "active" | "resolved";
  description: string;
  timestamp: string;
  imageUrl?: string;
  name?: string;
  phone?: string;
  statusHistory?: StatusHistoryEntry[];
  notes?: string[];
  response?: string;
}

export interface Device {
  id: string;
  name: string;
  type: "camera" | "lamp" | "sensor" | "traffic-light";
  lat: number;
  lng: number;
  status: "active" | "offline" | "pending";
  /** Local network IP of the ESP32 device */
  ip?: string;
  lastSeen: string;
  description?: string;
}

interface AppState {
  // ── Auth ──────────────────────────────────────────────
  user: User | null;
  authLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthLoading: (v: boolean) => void;

  // ── Data ──────────────────────────────────────────────
  reports: Report[];
  devices: Device[];
  setReports: (reports: Report[]) => void;
  setDevices: (devices: Device[]) => void;

  // ── Notifications ─────────────────────────────────────
  notifications: { id: string; message: string; read: boolean }[];
  addNotification: (message: string) => void;
  markAllRead: () => void;

  // ── Active camera / stream ────────────────────────────
  /** IP of the currently viewed ESP32-CAM */
  activeCameraIp: string | null;
  /** Whether to show the AI-processed stream instead of raw MJPEG */
  showProcessedStream: boolean;
  setActiveCameraIp: (ip: string | null) => void;
  setShowProcessedStream: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  authLoading: true,
  setUser: (user) => set({ user }),
  setAuthLoading: (authLoading) => set({ authLoading }),

  reports: [],
  devices: [],
  setReports: (reports) => set({ reports }),
  setDevices: (devices) => set({ devices }),

  notifications: [],
  addNotification: (message) =>
    set((s) => ({
      notifications: [
        { id: Date.now().toString(), message, read: false },
        ...s.notifications,
      ],
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  activeCameraIp: null,
  showProcessedStream: false,
  setActiveCameraIp: (activeCameraIp) => set({ activeCameraIp }),
  setShowProcessedStream: (showProcessedStream) => set({ showProcessedStream }),
}));

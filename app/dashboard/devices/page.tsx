"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu, Camera, Lightbulb, TrafficCone, Wifi, WifiOff,
  Search, X, RefreshCw, Eye, Power, ChevronRight,
  Clock, MapPin, Shield,
} from "lucide-react";
import { useDevices } from "@/hooks/useDevices";
import { useAppStore, Device } from "@/store/appStore";
import CameraStream from "@/components/ui/CameraStream";
import { formatDate } from "@/lib/utils";
import { toggleDevicePin } from "@/lib/esp32";

// ── Type meta ──────────────────────────────────────────────────────
const TYPE_META: Record<Device["type"], { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  camera:         { label: "Kamera",        icon: Camera,      color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20"   },
  lamp:           { label: "Lampu Jalan",   icon: Lightbulb,   color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  "traffic-light":{ label: "Traffic Light", icon: TrafficCone, color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20"  },
  sensor:         { label: "ZoSS / Sensor", icon: Cpu,         color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
};

const STATUS_META = {
  active:  { label: "Online",   dot: "bg-green-400",  badge: "bg-green-400/10 text-green-400 border-green-400/20"  },
  offline: { label: "Offline",  dot: "bg-red-400",    badge: "bg-red-400/10 text-red-400 border-red-400/20"        },
  pending: { label: "Pending",  dot: "bg-yellow-400", badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"},
};

const FILTER_TYPES: (Device["type"] | "all")[] = ["all", "camera", "lamp", "traffic-light", "sensor"];

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35 } }),
};

export default function DevicesPage() {
  const { devices, activeCount, systemStatus } = useDevices();
  const setDevices = useAppStore((s) => s.setDevices);

  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState<Device["type"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Device["status"] | "all">("all");
  const [cameraDevice, setCameraDevice] = useState<Device | null>(null);
  const [toggling, setToggling]       = useState<string | null>(null);

  // ── Filtered list ──────────────────────────────────────────────
  const filtered = devices.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.ip ?? "").includes(search);
    const matchType   = typeFilter === "all" || d.type === typeFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // ── Toggle lamp/device pin ─────────────────────────────────────
  async function handleToggle(device: Device) {
    if (!device.ip) return;
    setToggling(device.id);
    const newStatus = device.status === "active" ? "offline" : "active";
    await toggleDevicePin(device.ip, 2, newStatus === "active");
    setDevices(devices.map((d) => d.id === device.id ? { ...d, status: newStatus } : d));
    setToggling(null);
  }

  const offlineCount = devices.length - activeCount;

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Sticky header ── */}
      <div className="border-b border-white/10 bg-gray-950/80 backdrop-blur-sm sticky top-16 z-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-0.5">
              <Shield size={13} /> Manajemen Perangkat
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold">Perangkat IoT</h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <RefreshCw size={11} className="animate-spin" style={{ animationDuration: "4s" }} />
            <span className="hidden sm:inline">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {systemStatus.map((s, i) => {
            const meta = TYPE_META[s.type];
            const Icon = meta.icon;
            const pct  = s.total === 0 ? 0 : Math.round((s.online / s.total) * 100);
            const bar  = pct === 100 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
            return (
              <motion.div
                key={s.type}
                custom={i}
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className={`border rounded-2xl p-4 flex flex-col gap-2 ${meta.bg} ${meta.border}`}
              >
                <div className={`p-2 rounded-xl bg-white/10 w-fit ${meta.color}`}>
                  <Icon size={15} />
                </div>
                <p className={`text-2xl font-extrabold ${meta.color}`}>{s.online}<span className="text-sm font-normal text-gray-500">/{s.total}</span></p>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">{meta.label}</p>
                  <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 + i * 0.05 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Stats + Search bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">

          {/* Stat chips */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-green-400/10 border border-green-400/20 text-green-400 rounded-xl px-3 py-1.5">
              <Wifi size={12} />
              <span className="text-xs font-bold">{activeCount}</span>
              <span className="text-[11px] font-medium">Online</span>
            </div>
            <div className="flex items-center gap-1.5 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl px-3 py-1.5">
              <WifiOff size={12} />
              <span className="text-xs font-bold">{offlineCount}</span>
              <span className="text-[11px] font-medium">Offline</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl px-3 py-1.5">
              <Cpu size={12} />
              <span className="text-xs font-bold">{devices.length}</span>
              <span className="text-[11px] font-medium">Total</span>
            </div>
          </div>

          {/* Divider — vertical on desktop, horizontal on mobile */}
          <div className="hidden sm:block w-px h-6 bg-white/10 flex-shrink-0" />
          <div className="sm:hidden h-px bg-white/10" />

          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau IP..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ── Filters ── */}
        {/* Mobile: stacked. Desktop (sm+): single flex row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">

          {/* Type filter — horizontal scroll strip (bleeds on mobile, contained on desktop) */}
          <div className="-mx-4 sm:mx-0 sm:flex-1 min-w-0">
            <div className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-1 sm:pb-0 scrollbar-none">
              {FILTER_TYPES.map((t) => {
                const active = typeFilter === t;
                const meta   = t !== "all" ? TYPE_META[t] : null;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      active
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/15"
                    }`}
                  >
                    {meta ? <meta.icon size={13} /> : <Cpu size={13} />}
                    {t === "all" ? "Semua" : meta!.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status filter — segmented control */}
          <div className="flex-shrink-0 grid grid-cols-3 gap-1 bg-white/5 border border-white/10 rounded-xl p-1 sm:w-52">
            {(["all", "active", "offline"] as const).map((s) => {
              const active = statusFilter === s;
              const dotColor = s === "active" ? "bg-green-400" : s === "offline" ? "bg-red-400" : "";
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white active:bg-white/10"
                  }`}
                >
                  {s !== "all" && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />}
                  {s === "all" ? "Semua" : s === "active" ? "Online" : "Offline"}
                </button>
              );
            })}
          </div>

        </div>

        {/* ── Device grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <Cpu size={36} className="opacity-30" />
            <p className="text-sm">Tidak ada perangkat ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((device, i) => {
              const meta   = TYPE_META[device.type];
              const sMeta  = STATUS_META[device.status];
              const Icon   = meta.icon;
              const isCamera = device.type === "camera";
              const canToggle = (device.type === "lamp" || device.type === "traffic-light") && !!device.ip;

              return (
                <motion.div
                  key={device.id}
                  custom={i}
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className={`border rounded-2xl p-4 flex flex-col gap-3 bg-white/5 ${meta.border} hover:bg-white/8 transition-colors`}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2.5 rounded-xl ${meta.bg} ${meta.color} flex-shrink-0`}>
                      <Icon size={16} />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${sMeta.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sMeta.dot} ${device.status === "active" ? "animate-pulse" : ""}`} />
                      {sMeta.label}
                    </span>
                  </div>

                  {/* Name & type */}
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{device.name}</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${meta.color}`}>{meta.label}</p>
                  </div>

                  {/* Meta info */}
                  <div className="space-y-1.5 text-[11px] text-gray-400">
                    {device.ip && (
                      <div className="flex items-center gap-1.5">
                        <Wifi size={11} className="flex-shrink-0" />
                        <span className="font-mono">{device.ip}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <MapPin size={11} className="flex-shrink-0" />
                      <span>{device.lat.toFixed(4)}, {device.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="flex-shrink-0" />
                      <span>{formatDate(device.lastSeen)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto pt-1 border-t border-white/8">
                    {isCamera && device.ip && (
                      <button
                        onClick={() => setCameraDevice(device)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/20 rounded-xl py-1.5 transition-colors"
                      >
                        <Eye size={12} /> Live View
                      </button>
                    )}
                    {canToggle && (
                      <button
                        onClick={() => handleToggle(device)}
                        disabled={toggling === device.id}
                        className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium rounded-xl py-1.5 border transition-colors ${
                          device.status === "active"
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                            : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"
                        } disabled:opacity-50`}
                      >
                        {toggling === device.id
                          ? <RefreshCw size={12} className="animate-spin" />
                          : <Power size={12} />
                        }
                        {device.status === "active" ? "Matikan" : "Nyalakan"}
                      </button>
                    )}
                    {!isCamera && !canToggle && (
                      <span className="text-[10px] text-gray-600 flex items-center gap-1">
                        <ChevronRight size={11} /> Tidak ada IP
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Camera stream modal ── */}
      <AnimatePresence>
        {cameraDevice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setCameraDevice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{cameraDevice.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{cameraDevice.ip}</p>
                </div>
                <button
                  onClick={() => setCameraDevice(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <CameraStream
                ip={cameraDevice.ip!}
                deviceName={cameraDevice.name}
                aiPort={Number(process.env.NEXT_PUBLIC_AI_STREAM_PORT) || 5000}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

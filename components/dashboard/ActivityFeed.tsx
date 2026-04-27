"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, WifiOff, Zap, CheckCircle2, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedItem {
  id: string;
  type: "report" | "offline" | "outage" | "resolved" | "camera";
  message: string;
  time: string;
}

const ICON_MAP = {
  report:   { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10" },
  offline:  { icon: WifiOff,       color: "text-red-400",    bg: "bg-red-400/10"    },
  outage:   { icon: Zap,           color: "text-yellow-400", bg: "bg-yellow-400/10" },
  resolved: { icon: CheckCircle2,  color: "text-green-400",  bg: "bg-green-400/10"  },
  camera:   { icon: Camera,        color: "text-blue-400",   bg: "bg-blue-400/10"   },
};

const SEED: FeedItem[] = [
  { id: "f1", type: "report",   message: "Laporan baru: Kecelakaan di Simpang Pedan",            time: "2 mnt lalu"  },
  { id: "f2", type: "offline",  message: "ESP32-CAM Simpang Prambanan tidak merespons",          time: "5 mnt lalu"  },
  { id: "f3", type: "outage",   message: "Pemadaman terdeteksi: Lampu Jl. Merbabu",              time: "12 mnt lalu" },
  { id: "f4", type: "resolved", message: "Laporan Jalan Rusak Jl. Gatot Subroto diselesaikan",   time: "18 mnt lalu" },
  { id: "f5", type: "report",   message: "Laporan baru: Banjir di Jl. Pemuda",                   time: "25 mnt lalu" },
  { id: "f6", type: "camera",   message: "Kamera Alun-Alun kembali online",                      time: "31 mnt lalu" },
  { id: "f7", type: "offline",  message: "ZoSS SDN Klaten Tengah offline",                       time: "44 mnt lalu" },
  { id: "f8", type: "report",   message: "Laporan baru: Kondisi Berbahaya Jl. Solo–Yogya",       time: "1 jam lalu"  },
];

const LIVE_POOL: Omit<FeedItem, "id" | "time">[] = [
  { type: "report",   message: "Laporan baru: Hambatan Jalan di Jl. Ceper" },
  { type: "offline",  message: "Traffic Light Jl. Solo tidak merespons" },
  { type: "resolved", message: "Laporan Kecelakaan Simpang Pedan diselesaikan" },
  { type: "outage",   message: "Pemadaman terdeteksi: Lampu Jl. Pemuda" },
];

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>(SEED);

  useEffect(() => {
    let idx = 0;
    const t = setInterval(() => {
      const base = LIVE_POOL[idx % LIVE_POOL.length];
      idx++;
      setItems((prev) => [
        { ...base, id: `live-${Date.now()}`, time: "Baru saja" },
        ...prev,
      ].slice(0, 20));
    }, 12_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const cfg = ICON_MAP[item.type];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl px-3 py-2.5 transition-colors"
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${cfg.bg}`}>
                <Icon size={13} className={cfg.color} />
              </div>
              <p className="flex-1 text-xs text-gray-200 leading-snug">{item.message}</p>
              <span className="text-[10px] text-gray-500 flex-shrink-0 whitespace-nowrap">{item.time}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

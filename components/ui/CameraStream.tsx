"use client";
import { useState } from "react";
import { getMjpegStreamUrl, getProcessedStreamUrl, getSnapshotUrl } from "@/lib/esp32";
import { Video, Cpu, Camera, AlertCircle } from "lucide-react";

interface Props {
  ip: string;
  /** Port the Python AI server listens on (default 5000) */
  aiPort?: number;
  deviceName?: string;
  className?: string;
}

type Mode = "stream" | "processed" | "snapshot";

export default function CameraStream({ ip, aiPort = 5000, deviceName, className = "" }: Props) {
  const [mode, setMode] = useState<Mode>("stream");
  const [error, setError] = useState(false);

  const src =
    mode === "stream"
      ? getMjpegStreamUrl(ip)
      : mode === "processed"
      ? getProcessedStreamUrl(ip, aiPort)
      : getSnapshotUrl(ip);

  return (
    <div className={`bg-gray-900 rounded-2xl overflow-hidden border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          {deviceName ?? ip}
        </div>
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <ModeButton active={mode === "stream"} onClick={() => { setMode("stream"); setError(false); }} icon={<Video size={13} />} label="Live" />
          <ModeButton active={mode === "processed"} onClick={() => { setMode("processed"); setError(false); }} icon={<Cpu size={13} />} label="AI" />
          <ModeButton active={mode === "snapshot"} onClick={() => { setMode("snapshot"); setError(false); }} icon={<Camera size={13} />} label="Foto" />
        </div>
      </div>

      {/* Stream / image */}
      <div className="relative aspect-video bg-gray-950 flex items-center justify-center">
        {error ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <AlertCircle size={32} />
            <p className="text-xs">Tidak dapat terhubung ke {ip}</p>
            <button
              onClick={() => setError(false)}
              className="text-xs text-blue-400 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`Stream dari ${ip}`}
            className="w-full h-full object-contain"
            onError={() => setError(true)}
          />
        )}

        {/* Mode label overlay */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-2 py-0.5 rounded-full">
          {mode === "stream" ? "MJPEG Live" : mode === "processed" ? "AI Detection" : "Snapshot"}
        </div>
      </div>

      {/* Footer info */}
      <div className="px-4 py-2 text-[11px] text-gray-500 flex justify-between">
        <span>{ip}</span>
        {mode === "processed" && <span className="text-purple-400">Python · port {aiPort}</span>}
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
        active ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

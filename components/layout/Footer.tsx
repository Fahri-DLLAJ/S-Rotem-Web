import { Shield } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/10 py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-400">
        <div>
          <div className="flex items-center gap-2 text-white font-bold mb-3">
            <Shield size={18} className="text-blue-400" />
            S-Rotem
          </div>
          <p>Platform Keselamatan Jalan Pintar — memantau, melaporkan, dan merespons kondisi lalu lintas secara real-time.</p>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Tautan Cepat</p>
          <ul className="space-y-1.5">
            {[["Peta Monitoring", "/map"], ["Laporan Insiden", "/report"], ["Status Jalan", "/status"], ["Edukasi", "/education"]].map(([label, href]) => (
              <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold mb-3">Kontak Darurat</p>
          <ul className="space-y-1.5">
            <li>Polisi: <span className="text-white">110</span></li>
            <li>Ambulans: <span className="text-white">118</span></li>
            <li>Pemadam: <span className="text-white">113</span></li>
            <li>Jasa Marga: <span className="text-white">14080</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} S-Rotem — Sistem Monitoring Keselamatan Jalan
      </div>
    </footer>
  );
}

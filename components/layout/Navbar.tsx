"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/ui/NotificationBell";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/map", label: "Peta" },
  { href: "/report", label: "Laporan" },
  { href: "/status", label: "Status Jalan" },
  { href: "/education", label: "Edukasi" },
  { href: "/news", label: "Berita" },
  { href: "/emergency", label: "Darurat" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="text-blue-400" size={22} />
            <span className="text-white">S-Rotem</span>
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    pathname === l.href
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 text-white">
            <NotificationBell />
            {!isDashboard && (
              <Link
                href="/dashboard"
                className="hidden md:block text-sm bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            )}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-72 bg-gray-950 border-l border-white/10 z-50 p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X size={20} className="text-white" />
                </button>
              </div>
              <ul className="space-y-1">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        pathname === l.href
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                {!isDashboard && (
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

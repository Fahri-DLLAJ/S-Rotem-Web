"use client";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, markAllRead } = useAppStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 mt-2 w-72 bg-gray-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/10 text-sm font-semibold">Notifikasi</div>
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">Tidak ada notifikasi</p>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-white/5">
                {notifications.map((n) => (
                  <li key={n.id} className="px-4 py-3 text-sm text-gray-300 hover:bg-white/5">
                    {n.message}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

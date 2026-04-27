"use client";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FloatingEmergencyButton() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Link href="/emergency">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-full shadow-lg shadow-red-900/50 transition-colors"
        >
          <Phone size={18} />
          <span className="text-sm">Darurat</span>
        </motion.button>
      </Link>
    </motion.div>
  );
}

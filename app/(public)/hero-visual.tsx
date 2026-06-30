"use client";

import { motion } from "framer-motion";

// Screenshot del dashboard dentro de un "marco de navegador", con entrada
// suave y un leve flotar continuo.
export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20"
      >
        {/* Barra del navegador */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-100 px-3 py-2">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-amber-400" />
          <span className="size-3 rounded-full bg-green-400" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/dashboard.png"
          alt="Dashboard de MotoGestión"
          className="w-full"
        />
      </motion.div>
    </motion.div>
  );
}

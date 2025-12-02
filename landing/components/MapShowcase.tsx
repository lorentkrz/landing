"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

export function MapShowcase() {
  return (
    <section className="relative px-6 py-16 md:px-12" id="map">
      <div className="grain-overlay" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d0f1a] via-[#1b1d25] to-[#0d0f1a] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(162,89,255,0.18),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(90,155,255,0.12),transparent_40%)]" />
        <div className="relative z-10 grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div className="space-y-3">
            <motion.h3
              {...blurReveal}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="heading-font text-3xl text-white md:text-4xl"
            >
              Live map, live presence.
            </motion.h3>
            <motion.p
              {...blurReveal}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
              className="mono-font text-sm text-white/75"
            >
              Pins show distance, cover image, and live count. Filters for clubs, bars, lounges, cafes, open-now. Built on the real app
              logic running in Kosovo.
            </motion.p>
            <motion.div
              {...blurReveal}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
              className="flex flex-wrap gap-2"
            >
              {["Clubs", "Bars", "Lounges", "Cafes", "Open now"].map((chip) => (
                <span
                  key={chip}
                  className="mono-font rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/75"
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          </div>
          <motion.div
            {...blurReveal}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d14] p-4"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(162,89,255,0.12),transparent_50%)]" />
            <div className="relative z-10 h-64 rounded-xl border border-white/10 bg-gradient-to-br from-[#0f1220] via-[#0d101c] to-[#090b14] overflow-hidden">
              <div className="absolute inset-4 rounded-lg border border-white/8">
                <motion.div
                  className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)] opacity-20"
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--primary)]" />
                {[
                  { x: "1/3", y: "1/3", color: "var(--alert)" },
                  { x: "3/4", y: "1/4", color: "var(--primary)" },
                  { x: "1/4", y: "3/4", color: "var(--secondary)" },
                ].map((dot, i) => (
                  <motion.div
                    key={i}
                    className={`absolute h-2 w-2 rounded-full`}
                    style={{
                      left: `calc(${dot.x})`,
                      top: `calc(${dot.y})`,
                      background: dot.color,
                      boxShadow: `0 0 12px ${dot.color}`,
                    }}
                    animate={{ scale: [0.9, 1.2, 0.9] }}
                    transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,255,0,0.05),transparent_50%)]"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between text-xs text-white/70">
                <span className="mono-font">Distance: 0.8 km</span>
                <span className="mono-font text-[var(--primary)]">Live: 142 inside</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

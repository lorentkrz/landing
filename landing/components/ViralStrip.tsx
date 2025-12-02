"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

export function ViralStrip() {
  return (
    <section className="relative px-6 py-16 md:px-12">
      <div className="grain-overlay" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#ff2e00]/20 via-[#050505] to-[#6600ff]/20 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(212,255,0,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(102,0,255,0.12),transparent_40%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <motion.div
            {...blurReveal}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="heading-font text-3xl text-white md:text-4xl"
          >
            We are building the signal. Be first in.
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Launch zone", value: "Kosovo first" },
              { label: "Credit drop", value: "100 on join" },
              { label: "Waitlist", value: "Email confirmation only" },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                {...blurReveal}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 * idx }}
                className="glass rounded-2xl border border-white/10 px-4 py-3"
              >
                <div className="mono-font text-[11px] uppercase tracking-[0.3em] text-white/60">{item.label}</div>
                <div className="heading-font text-lg text-[#d4ff00]">{item.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

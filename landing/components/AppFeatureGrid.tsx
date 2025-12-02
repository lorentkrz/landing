"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

const items = [
  {
    title: "Real-Time Presence",
    desc: "Live headcount + avatars, verified via geo + QR.",
    accent: "var(--primary)",
  },
  {
    title: "Smart Discovery",
    desc: "Trending this weekend, new venues, visited spots.",
    accent: "var(--secondary)",
  },
  {
    title: "Interactive Map",
    desc: "Pins show distance, cover image, live count with filters.",
    accent: "var(--primary)",
  },
  {
    title: "QR Check-In",
    desc: "Scan + verify to unlock full venue and credits.",
    accent: "var(--secondary)",
  },
  {
    title: "Profiles & History",
    desc: "Identity, favorites, past check-ins, preferences.",
    accent: "var(--primary)",
  },
  {
    title: "Venue Owners",
    desc: "Analytics, digital check-in, presence insights.",
    accent: "var(--secondary)",
  },
];

export function AppFeatureGrid() {
  return (
    <section className="relative px-6 py-16 md:px-12" id="features">
      <div className="grain-overlay" />
      <motion.h2
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="heading-font mb-3 text-3xl text-white md:text-4xl"
      >
        The NATAA stack.
      </motion.h2>
      <motion.p
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
        className="mono-font mb-8 max-w-3xl text-sm text-white/75"
      >
        Built from the live app: presence tracking, map, QR check-in, venue intel, and profiles. Beta runs in Kosovo, then we
        flip it worldwide.
      </motion.p>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.title}
            {...blurReveal}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.06 * idx }}
            whileHover={{ y: -8, scale: 1.02, rotate: -0.4 }}
            className="glass card-float relative overflow-hidden rounded-2xl border border-white/10 p-5"
          >
            <motion.div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(212,255,0,0.08), transparent 40%), radial-gradient(circle at 80% 70%, rgba(90,155,255,0.08), transparent 35%)",
              }}
              animate={{ opacity: [0.28, 0.5, 0.28], scale: [1, 1.05, 1] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10 mb-3 flex items-center gap-2">
              <motion.div
                className="h-1 w-12 rounded-full"
                style={{ background: item.accent, boxShadow: `0 0 16px ${item.accent}` }}
                animate={{ width: ["32px", "48px", "40px"], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: idx * 0.08 }}
              />
              <span className="mono-font text-[10px] uppercase tracking-[0.2em] text-white/60">Live</span>
            </div>
            <div className="relative z-10 heading-font text-lg text-white">{item.title}</div>
            <div className="relative z-10 mono-font mt-2 text-sm text-white/75">{item.desc}</div>
            <motion.div
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full border border-white/10"
              style={{ boxShadow: `0 0 18px ${item.accent}33` }}
              animate={{ rotate: [0, 8, -6, 0], scale: [0.96, 1.06, 0.98] }}
              transition={{ duration: 4 + idx * 0.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

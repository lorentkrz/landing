"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

const phases = [
  {
    label: "Live",
    title: "Built",
    items: ["iOS + Android ready", "Real-time presence", "QR check-in", "Venue discovery", "Profiles"],
    accent: "#5a9bff",
  },
  {
    label: "Scale",
    title: "Expansion",
    items: ["Cities: Kosovo now, next cities queued", "Venue analytics rollout", "Marketing live"],
    accent: "#a259ff",
  },
];

export function Roadmap() {
  return (
    <section className="relative px-6 py-16 md:px-12">
      <div className="grain-overlay" />
      <motion.h2
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="heading-font mb-3 text-3xl text-white md:text-4xl"
      >
        Roadmap to 2026.
      </motion.h2>
      <motion.p
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
        className="mono-font mb-8 max-w-3xl text-sm text-white/75"
      >
        Beta live in Kosovo. We ship weekly; then we expand globally with messaging, events, and venue dashboards.
      </motion.p>
      <div className="grid gap-4 md:grid-cols-3">
        {phases.map((phase, idx) => (
          <motion.div
            key={phase.label}
            {...blurReveal}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.08 * idx }}
            className="glass rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="heading-font text-lg text-white">{phase.title}</div>
              <span className="mono-font text-[11px] uppercase tracking-[0.3em]" style={{ color: phase.accent }}>
                {phase.label}
              </span>
            </div>
            <ul className="mono-font mt-3 space-y-2 text-sm text-white/80">
              {phase.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: phase.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

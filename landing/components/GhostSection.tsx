"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

const controls = [
  { title: "Verified presence", desc: "Visible only when geo + QR checked-in. No ghost browsing." },
  { title: "Kill switch", desc: "Leave instantly; presence clears. Auto-timeout safety." },
  { title: "Privacy guard", desc: "Blurred until mutual connect. Profiles stay protected." },
];

export function GhostSection() {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:px-12">
      <div className="grain-overlay" />
      <div className="relative z-10 rounded-3xl border border-[var(--secondary)]/30 bg-gradient-to-br from-[#1b1d25] via-[#0f111c] to-[#0a0b12] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
        <motion.h2
          {...blurReveal}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="heading-font mb-4 text-3xl text-white md:text-4xl"
        >
          Presence control, built-in.
        </motion.h2>
        <motion.p
          {...blurReveal}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="mono-font max-w-3xl text-base leading-relaxed text-white/80"
        >
          Check-in to be seen. Blur to connect. Kill switch to vanish. Presence is verified, not guessed.
        </motion.p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {controls.map((item, idx) => (
            <motion.div
              key={item.title}
              {...blurReveal}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 * idx }}
              className="glass rounded-2xl border border-white/10 px-4 py-6 text-left"
            >
              <div className="heading-font text-lg text-[var(--primary)]">{item.title}</div>
              <div className="mono-font mt-2 text-sm text-white/75">{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

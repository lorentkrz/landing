"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

const checkin = [
  "Geo unlocks nearby venues",
  "Scan QR at entry to verify",
  "Instant presence update",
  "Credits released on verify",
];

const intel = [
  "Live headcount + avatars",
  "Energy + mix live tiles",
  "Open/close and now playing",
  "Distance + ETA",
];

const trust = [
  "Dynamic QR, no spoof",
  "Supabase real-time presence",
  "Manual kill switch",
  "Auto timeout checkout",
];

export function ProblemSection() {
  return (
    <section className="relative px-6 py-20 md:px-12" id="problem">
      <div className="grain-overlay" />
      <motion.h2
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="heading-font mb-3 text-3xl text-white md:text-4xl"
      >
        ACCESS PROTOCOL.
      </motion.h2>
      <motion.p
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
        className="mono-font mb-8 max-w-3xl text-sm text-white/75"
      >
        Geolocation + QR check-in. Verified presence unlocks live people inside, energy, and credits. Presence is real-time, not vibes.
      </motion.p>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          {...blurReveal}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass card-float rounded-2xl border border-white/10 p-6"
        >
          <div className="mb-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/60">
            Check-in
          </div>
          <div className="flex flex-wrap gap-2">
            {checkin.map((chip) => (
              <span
                key={chip}
                className="mono-font rounded-lg border border-white/10 bg-black/55 px-3 py-2 text-[11px] text-white/75"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          {...blurReveal}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass card-float rounded-2xl border border-[var(--secondary)]/40 bg-gradient-to-br from-[#1b1d25] via-[#0d0f1a] to-[#0a0a0f] p-6"
        >
          <div className="mb-3 inline-flex rounded-full border border-[var(--secondary)]/40 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[var(--secondary)]">
            Live intel
          </div>
          <div className="flex flex-wrap gap-2">
            {intel.map((chip) => (
              <span
                key={chip}
                className="mono-font rounded-lg border border-[var(--secondary)]/30 bg-black/60 px-3 py-2 text-[11px] text-[var(--secondary)]"
              >
                {chip}
              </span>
            ))}
          </div>
          <p className="mono-font mt-4 text-sm text-white/85">
            Verified presence lights up radar with real headcount, avatars, and ETA data.
          </p>
        </motion.div>

        <motion.div
          {...blurReveal}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="glass card-float rounded-2xl border border-white/10 p-6"
        >
          <div className="mb-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/60">
            Trust & Control
          </div>
          <ul className="mono-font space-y-2 text-sm text-white/80">
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mono-font mt-4 text-xs text-white/60">Launch market ready. Real-time stack active.</p>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

export function AppSneakPeek() {
  const milestones = [
    { title: "Private build", status: "In motion", accent: "#d4ff00" },
    { title: "Kosovo drop", status: "Locks first", accent: "#ff2e00" },
    { title: "Global wave", status: "Queued", accent: "#6600ff" },
  ];

  const sneak = [
    { title: "Live radar", desc: "Crowd heat + wait time pulses update every 60s." },
    { title: "Blur connect", desc: "Check-in verified. Faces stay 10% blurred until matched." },
    { title: "Timer game", desc: "100 seconds per chat. Credits burn. Intensity stays high." },
  ];

  return (
    <section className="relative px-6 py-20 md:px-12" id="sneak">
      <div className="grain-overlay" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/0 to-[#0a0a0a] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,255,0,0.08),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(102,0,255,0.12),transparent_35%)]" />
        <div className="relative z-10 grid gap-10 md:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="space-y-6">
            <motion.div
              {...blurReveal}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="heading-font text-3xl text-white md:text-4xl"
            >
              The build is underway.
            </motion.div>
            <motion.p
              {...blurReveal}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
              className="mono-font max-w-xl text-sm leading-relaxed text-white/80"
            >
              No stock mockups. This is the live logic: radar pulses, blur-to-connect, and the 100-second game loop. Kosovo drops
              first, then we open the floodgates.
            </motion.p>

            <div className="grid gap-3 sm:grid-cols-3">
              {milestones.map((item, idx) => (
                <motion.div
                  key={item.title}
                  {...blurReveal}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.08 * idx }}
                  className="glass rounded-2xl border border-white/10 px-4 py-5"
                >
                  <div className="heading-font text-sm uppercase tracking-[0.2em]" style={{ color: item.accent }}>
                    {item.title}
                  </div>
                  <div className="mono-font mt-1 text-xs text-white/70">Status: {item.status}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            {...blurReveal}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="relative flex justify-center"
          >
            <div className="phone-frame">
              <div className="phone-top">
                <span className="phone-signal" />
                <span className="phone-dot" />
              </div>
              <div className="phone-screen">
                <div className="sneak-radar">
                  <div className="sneak-ping" />
                  <div className="sneak-sweep" />
                  <div className="sneak-dot" />
                </div>
                <div className="sneak-card">
                  <div className="sneak-card-top">
                    <span className="mono-font text-[10px] text-white/60">BLUR CONNECT</span>
                    <span className="mono-font text-[10px] text-[#d4ff00]">LIVE</span>
                  </div>
                  <div className="sneak-avatars">
                    <motion.span
                      className="sneak-avatar"
                      animate={{ y: [0, -2, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.span
                      className="sneak-avatar"
                      animate={{ y: [0, 2, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.span
                      className="sneak-avatar"
                      animate={{ y: [0, -1, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="sneak-bar">
                    <div className="sneak-bar-fill" />
                  </div>
                </div>
                <div className="sneak-list">
                  {sneak.map((item) => (
                    <div key={item.title} className="sneak-list-row">
                      <div className="sneak-dot-small" />
                      <div>
                        <div className="heading-font text-xs text-white">{item.title}</div>
                        <div className="mono-font text-[11px] text-white/60">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

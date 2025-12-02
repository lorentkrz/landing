"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

const logItems = [
  { title: "Radar pulses", status: "Shipping", note: "Energy + waittime feed, 60s refresh", accent: "#d4ff00" },
  { title: "QR / geo check-in", status: "Piloting Kosovo", note: "Auto verify presence, unlock credits", accent: "#ff2e00" },
  { title: "Blur-to-connect", status: "In QA", note: "10% blur until mutual match", accent: "#6600ff" },
  { title: "100s chat game", status: "Locked", note: "Credit burn + self-destruct", accent: "#d4ff00" },
];

export function BuildLog() {
  return (
    <section className="relative px-6 py-20 md:px-12">
      <div className="grain-overlay" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/0 to-[#080808] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(212,255,0,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(102,0,255,0.12),transparent_40%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl space-y-2">
            <motion.h3
              {...blurReveal}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="heading-font text-3xl text-white md:text-4xl"
            >
              Build log: live.
            </motion.h3>
            <motion.p
              {...blurReveal}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 }}
              className="mono-font text-sm text-white/75"
            >
              We are shipping weekly. Kosovo first, then global. If you see this, you are early.
            </motion.p>
          </div>
          <div className="grid w-full gap-3 md:max-w-xl">
            {logItems.map((item, idx) => (
              <motion.div
                key={item.title}
                {...blurReveal}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.08 * idx }}
                className="glass rounded-2xl border border-white/10 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="heading-font text-lg text-white">{item.title}</div>
                  <span className="mono-font text-[11px] uppercase tracking-[0.25em]" style={{ color: item.accent }}>
                    {item.status}
                  </span>
                </div>
                <div className="mono-font mt-1 text-sm text-white/75">{item.note}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";
import { ScrambleText } from "./ScrambleText";

type Card = {
  title: string;
  copy: string;
  accent: string;
  tag: string;
  badge: string;
};

export function MechanicsSection({ cards }: { cards: Card[] }) {
  return (
    <section className="relative px-6 py-20 md:px-12" id="mechanics">
      <div className="grain-overlay" />
      <motion.h2
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="heading-font mb-8 text-3xl text-white md:text-4xl"
      >
        THE MECHANICS
      </motion.h2>
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            {...blurReveal}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 * idx }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass card-float relative flex h-full flex-col rounded-2xl border border-white/10 p-6"
          >
            <motion.div
              className="absolute inset-0 opacity-30 blur-3xl"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${card.accent}, transparent 45%)`,
              }}
              animate={{ opacity: [0.18, 0.35, 0.18], scale: [1, 1.05, 1] }}
              transition={{ duration: 5 + idx * 0.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative z-10 mb-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
              <span className="flex items-center gap-2">
                <motion.span
                  className="h-2 w-2 rounded-full"
                  style={{ background: card.accent, boxShadow: `0 0 12px ${card.accent}` }}
                  animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
                {card.tag}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">
                {card.badge}
              </span>
            </div>
            <h3 className="heading-font relative z-10 mb-3 text-xl text-white md:text-2xl">
              <ScrambleText text={card.title} />
            </h3>
            <p className="mono-font relative z-10 text-sm leading-relaxed text-white/80">
              {card.copy}
            </p>
            {card.tag === "The Timer" && (
              <div className="relative z-10 mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-[#ff2e00]"
                  animate={{ width: ["100%", "0%"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

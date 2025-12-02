"use client";

import { motion } from "framer-motion";
import { CountdownBlock } from "./CountdownBlock";
import { ScrambleText } from "./ScrambleText";
import { blurReveal } from "@/lib/motionPresets";

type Countdown = { days: string; hours: string; minutes: string; seconds: string };

export function Hero({
  countdown,
  ticker,
  onJoinClick,
}: {
  countdown: Countdown;
  ticker: string;
  onJoinClick: () => void;
}) {
  return (
    <section className="static-bg relative flex min-h-screen items-center justify-center px-6 pb-24 pt-28 md:px-12">
      <div className="grain-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      <div className="relative z-10 flex w-full max-w-6xl flex-col gap-10">
        <motion.div
          {...blurReveal}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          className="w-fit rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70"
        >
          Building now - Countdown live
        </motion.div>

        <motion.h1
          {...blurReveal}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="heading-font text-3xl leading-[1.08] tracking-[0.08em] text-white md:text-5xl lg:text-6xl"
        >
          <ScrambleText text="THE NIGHT HAS EYES." className="inline-block" />
        </motion.h1>

        <motion.p
          {...blurReveal}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="max-w-3xl text-lg text-white/80 md:text-xl"
        >
          We are building the live radar for nightlife. Kosovo first, then worldwide. See the vibe. Scan the crowd. Connect before the timer dies.
        </motion.p>

        <motion.div
          {...blurReveal}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <CountdownBlock label="DAYS" value={countdown.days} />
          <CountdownBlock label="HOURS" value={countdown.hours} />
          <CountdownBlock label="MIN" value={countdown.minutes} />
          <CountdownBlock label="SEC" value={countdown.seconds} />
        </motion.div>

        <motion.div
          {...blurReveal}
          transition={{ duration: 1, ease: "easeOut", delay: 0.45 }}
          className="flex flex-wrap items-center gap-4"
        >
          <button
            onClick={onJoinClick}
            className="btn heading-font rounded-full border border-[var(--primary)]/50 bg-[var(--primary)] px-6 py-3 text-sm uppercase tracking-[0.25em] text-black shadow-[0_0_30px_rgba(90,155,255,0.35)] transition duration-300 hover:shadow-[0_0_40px_rgba(90,155,255,0.55)]"
          >
            JOIN THE DROP
          </button>
          <div className="mono-font text-sm text-white/60">Cursor = spotlight. Scroll to reveal.</div>
        </motion.div>
      </div>

      <div className="marquee absolute bottom-4 left-0 right-0 z-20 border-y border-white/5 bg-black/40 py-2 backdrop-blur">
        <span className="heading-font text-sm tracking-[0.35em] text-white/70">{ticker.repeat(3)}</span>
      </div>
    </section>
  );
}

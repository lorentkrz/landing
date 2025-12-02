"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useReducedMotion, useInView } from "framer-motion";
import { blurReveal } from "@/lib/motionPresets";

type ShotCard = {
  title: string;
  mode: "home" | "venue" | "map" | "qr" | "profile";
  label: string;
  status: string;
  accent: string;
  secondary: string;
  slider: number;
  bullets: { title: string; desc: string }[];
};

const shots: ShotCard[] = [
  {
    title: "Home feed",
    mode: "home",
    label: "Drop radar",
    status: "LIVE",
    accent: "#d4ff00",
    secondary: "#5a9bff",
    slider: 68,
    bullets: [
      { title: "Live radar", desc: "Crowd heat + wait time pulses update every 60s." },
      { title: "Priority drops", desc: "Verified check-ins float to the top of the feed instantly." },
      { title: "Timer game", desc: "100 seconds per chat keeps the feed from stalling." },
    ],
  },
  {
    title: "Venue details",
    mode: "venue",
    label: "Venue intel",
    status: "LOCK-IN",
    accent: "#a259ff",
    secondary: "#d4ff00",
    slider: 74,
    bullets: [
      { title: "Check-in verified", desc: "QR unlocks cover, perks, and moderated chat." },
      { title: "Line + wait", desc: "Heat meter shows the door + projected wait." },
      { title: "Host signals", desc: "Owners push updates for capacity and sets." },
    ],
  },
  {
    title: "Map",
    mode: "map",
    label: "Map sweep",
    status: "LIVE",
    accent: "#5a9bff",
    secondary: "#d4ff00",
    slider: 62,
    bullets: [
      { title: "Distance pulses", desc: "Pins animate by proximity + crowd velocity." },
      { title: "Filters locked", desc: "Heat, cover, favorites, and now-playing." },
      { title: "ETA sync", desc: "Navigation + ride ETA stay in sync with live count." },
    ],
  },
  {
    title: "QR scan",
    mode: "qr",
    label: "Verify gate",
    status: "AR CHECK",
    accent: "#ff2e00",
    secondary: "#5a9bff",
    slider: 82,
    bullets: [
      { title: "Guided scan", desc: "Dynamic brightness + frame to lock the QR fast." },
      { title: "Secure gate", desc: "Geo + device signature to block spoofing." },
      { title: "Credits unlock", desc: "Check-in releases chat credits and venue intel." },
    ],
  },
  {
    title: "Profile",
    mode: "profile",
    label: "Identity sync",
    status: "ACTIVE",
    accent: "#d4ff00",
    secondary: "#a259ff",
    slider: 58,
    bullets: [
      { title: "Check-in trail", desc: "Past venues + streaks stay pinned." },
      { title: "Favorites pinned", desc: "Saved venues + friends surface first." },
      { title: "Trust level", desc: "Verification badge + blur preferences travel with you." },
    ],
  },
];

const GlowBullet = ({ accent, title, desc }: { accent: string; title: string; desc: string }) => (
  <div className="flex items-start gap-3">
    <span
      className="mt-1 h-2.5 w-2.5 rounded-full"
      style={{ background: accent, boxShadow: `0 0 16px ${accent}` }}
    />
    <div>
      <div className="heading-font text-[13px] text-white">{title}</div>
      <div className="mono-font text-[11px] leading-relaxed text-white/65">{desc}</div>
    </div>
  </div>
);

function NeonRadar({ accent, secondary, dotColor = "#ff2e00" }: { accent: string; secondary: string; dotColor?: string }) {
  return (
    <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(212,255,0,0.08),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(90,155,255,0.1),transparent_45%),rgba(0,0,0,0.72)] shadow-[0_0_35px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 50% 50%, ${accent}22, transparent 55%)` }} />
      <motion.div
        className="absolute inset-3 rounded-full border"
        style={{ borderColor: `${accent}66` }}
        animate={{ rotate: [0, 6, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-6 rounded-full border"
        style={{ borderColor: `${secondary}55` }}
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-10 rounded-full border border-white/5"
        animate={{ scale: [1.05, 0.9, 1.05], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[1px] w-1/2 origin-left"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-3 w-3 -translate-y-1/2 translate-x-[40px] rounded-full"
          style={{ background: dotColor, boxShadow: `0 0 18px ${dotColor}` }}
        />
      </motion.div>
      <motion.div
        className="absolute inset-[22px] rounded-full border"
        style={{ borderColor: `${accent}55` }}
        animate={{ opacity: [0.6, 0.2, 0.6], scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function ControlPanel({
  label,
  status,
  accent,
  secondary,
  slider,
}: {
  label: string;
  status: string;
  accent: string;
  secondary: string;
  slider: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/60">
        <span className="mono-font">{label}</span>
        <span className="mono-font" style={{ color: accent }}>
          {status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-9 rounded-xl border border-white/10 bg-black/40"
            style={{ boxShadow: `inset 0 0 20px ${secondary}11` }}
            animate={{ opacity: [0.7, 1, 0.7], filter: ["blur(1px)", "blur(2px)", "blur(1px)"] }}
            transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
          />
        ))}
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${secondary}, ${accent})` }}
          animate={{ width: [`${slider - 8}%`, `${slider + 6}%`, `${slider}%`] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function renderVisual(card: ShotCard) {
  switch (card.mode) {
    case "home":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-black/50 to-black/70 p-4">
          <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 20% 20%, ${card.accent}22, transparent 45%), radial-gradient(circle at 80% 70%, ${card.secondary}22, transparent 45%)` }} />
          <div className="absolute left-4 top-3 h-1 w-12 rounded-full" style={{ background: card.accent }} />
          <div className="absolute right-4 top-3 h-2 w-2 rounded-full" style={{ background: `${card.secondary}aa`, boxShadow: `0 0 12px ${card.secondary}` }} />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <NeonRadar accent={card.accent} secondary={card.secondary} />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="heading-font text-sm text-white">Feed pulse</div>
                  <div className="mono-font text-[11px] text-white/60">Refresh: 60s</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                  <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                    <div className="text-white/50">Heat</div>
                    <div className="heading-font text-base text-white">78%</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                    <div className="text-white/50">Queue</div>
                    <div className="heading-font text-base text-white">12 live</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                    <div className="text-white/50">Wait</div>
                    <div className="heading-font text-base text-white">06m</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                    <div className="text-white/50">Credits</div>
                    <div className="heading-font text-base text-white">High</div>
                  </div>
                </div>
              </div>
            </div>
            <ControlPanel label={card.label} status={card.status} accent={card.accent} secondary={card.secondary} slider={card.slider} />
          </div>
        </div>
      );
    case "venue":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1426]/80 via-black/70 to-black/80 p-4">
          <div className="absolute inset-0 opacity-[0.35]" style={{ background: `radial-gradient(circle at 65% 20%, ${card.accent}22, transparent 40%), radial-gradient(circle at 20% 70%, ${card.secondary}22, transparent 40%)` }} />
          <div className="absolute left-4 top-3 h-1 w-10 rounded-full" style={{ background: card.accent }} />
          <div className="absolute right-4 top-3 h-2 w-2 rounded-full" style={{ background: `${card.secondary}aa`, boxShadow: `0 0 10px ${card.secondary}` }} />
          <div className="relative z-10 space-y-4">
            <div className="grid grid-cols-[0.9fr_1.1fr] gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="heading-font text-xs text-white">Line heat</div>
                <div className="mt-2 flex h-20 items-end gap-1 overflow-hidden">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      className="flex-1 rounded-t-full"
                      style={{ background: `linear-gradient(180deg, ${card.accent}, ${card.secondary}55, transparent)` }}
                      animate={{ height: [`${40 + idx * 3}%`, `${60 + (idx % 4) * 6}%`, `${50 + idx * 2}%`], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2.6 + idx * 0.1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>Cover</span>
                  <span className="heading-font text-sm text-white">$10</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${card.accent}, ${card.secondary})` }}
                    animate={{ width: ["45%", "68%", "52%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-white/70">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-2">
                    <div className="text-white/50">Wait</div>
                    <div className="heading-font text-sm text-white">08m</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-2">
                    <div className="text-white/50">Capacity</div>
                    <div className="heading-font text-sm text-white">72%</div>
                  </div>
                  <div className="col-span-2 rounded-xl border border-white/10 bg-black/30 p-2">
                    <div className="text-white/50">Update</div>
                    <div className="heading-font text-sm text-white">DJ switch in 12m</div>
                  </div>
                </div>
              </div>
            </div>
            <ControlPanel label={card.label} status={card.status} accent={card.accent} secondary={card.secondary} slider={card.slider} />
          </div>
        </div>
      );
    case "map":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1220]/90 via-black/70 to-[#05070f]/90 p-4">
          <div className="absolute inset-0 opacity-[0.35]" style={{ background: `radial-gradient(circle at 30% 30%, ${card.secondary}22, transparent 50%), radial-gradient(circle at 80% 70%, ${card.accent}22, transparent 45%)` }} />
          <div className="absolute left-4 top-3 h-1 w-12 rounded-full" style={{ background: card.accent }} />
          <div className="absolute right-4 top-3 h-2 w-2 rounded-full" style={{ background: `${card.secondary}aa`, boxShadow: `0 0 10px ${card.secondary}` }} />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              <NeonRadar accent={card.secondary} secondary={card.accent} dotColor={card.accent} />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="heading-font text-sm text-white">Nearest pin</div>
                  <div className="mono-font text-[11px] text-white/60">0.8 km</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-white/70">
                  <div className="flex items-center justify-between">
                    <span>Heat</span>
                    <span className="heading-font text-sm text-white">142 live</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${card.accent}, ${card.secondary})` }}
                      animate={{ width: ["52%", "76%", "60%"] }}
                      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-white/60">
                    <span>ETA sync</span>
                    <span>Ride: 4m</span>
                  </div>
                </div>
              </div>
            </div>
            <ControlPanel label={card.label} status={card.status} accent={card.accent} secondary={card.secondary} slider={card.slider} />
          </div>
        </div>
      );
    case "qr":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b0f12]/80 via-black/75 to-black/90 p-4">
          <div className="absolute inset-0 opacity-[0.35]" style={{ background: `radial-gradient(circle at 30% 30%, ${card.secondary}22, transparent 45%), radial-gradient(circle at 70% 70%, ${card.accent}22, transparent 40%)` }} />
          <div className="absolute left-4 top-3 h-1 w-10 rounded-full" style={{ background: card.accent }} />
          <div className="absolute right-4 top-3 h-2 w-2 rounded-full" style={{ background: `${card.secondary}aa`, boxShadow: `0 0 10px ${card.secondary}` }} />
          <div className="relative z-10 space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-4">
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.04),transparent_45%)]"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-x-6 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                animate={{ y: [12, 120, 12], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute inset-4 rounded-xl border border-white/15" />
              <div className="absolute inset-6 rounded-xl border border-dashed border-white/10" />
              <div className="relative z-10 flex items-center justify-between text-[11px] text-white/60">
                <span>Align QR</span>
                <span>Auto flash</span>
              </div>
            </div>
            <ControlPanel label={card.label} status={card.status} accent={card.accent} secondary={card.secondary} slider={card.slider} />
          </div>
        </div>
      );
    case "profile":
      return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f120f]/85 via-black/70 to-[#0a0712]/85 p-4">
          <div className="absolute inset-0 opacity-[0.35]" style={{ background: `radial-gradient(circle at 25% 20%, ${card.accent}22, transparent 40%), radial-gradient(circle at 80% 70%, ${card.secondary}22, transparent 45%)` }} />
          <div className="absolute left-4 top-3 h-1 w-12 rounded-full" style={{ background: card.accent }} />
          <div className="absolute right-4 top-3 h-2 w-2 rounded-full" style={{ background: `${card.secondary}aa`, boxShadow: `0 0 10px ${card.secondary}` }} />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-[76px] w-[76px]">
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border"
                  style={{ borderColor: `${card.secondary}66` }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border"
                  style={{ borderColor: `${card.accent}55` }}
                  animate={{ rotate: [360, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="mono-font text-[10px] uppercase text-white/70">ID</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="heading-font text-sm text-white">Streaks + trust</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-white/70">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-2">
                    <div className="text-white/50">Check-ins</div>
                    <div className="heading-font text-sm text-white">24</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-2">
                    <div className="text-white/50">Streak</div>
                    <div className="heading-font text-sm text-white">7 nights</div>
                  </div>
                  <div className="col-span-2 rounded-xl border border-white/10 bg-black/30 p-2">
                    <div className="text-white/50">Trust</div>
                    <div className="heading-font text-sm text-white">Blur on until matched</div>
                  </div>
                </div>
              </div>
            </div>
            <ControlPanel label={card.label} status={card.status} accent={card.accent} secondary={card.secondary} slider={card.slider} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function GalleryStrip() {
  const loopShots = [...shots, ...shots];
  const marqueeControls = useAnimation();
  const [autoPlay, setAutoPlay] = useState(true);
  const restartTimer = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const railRef = useRef<HTMLDivElement | null>(null);
  const railInView = useInView(railRef, { amount: 0.2 });

  const restartAuto = () => {
    if (restartTimer.current) clearTimeout(restartTimer.current);
    restartTimer.current = setTimeout(() => setAutoPlay(true), 3000);
  };

  useEffect(() => {
    if (!autoPlay || prefersReducedMotion || !railInView) {
      marqueeControls.stop();
      return;
    }
    marqueeControls.start({
      x: ["0%", "-50%"],
      transition: { duration: 48, repeat: Infinity, ease: "linear" },
    });
    return () => {
      marqueeControls.stop();
    };
  }, [autoPlay, marqueeControls, prefersReducedMotion, railInView]);

  return (
    <section className="relative px-6 py-16 md:px-12" id="screens">
      <div className="grain-overlay" />
      <motion.h2
        {...blurReveal}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="heading-font mb-6 text-3xl text-white md:text-4xl"
      >
        Screens from the beta.
      </motion.h2>
      <div className="mx-auto max-w-6xl">
        <div
          className="relative overflow-hidden rounded-[34px] border border-white/5 bg-black/60 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
          style={{
            WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
            maskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(212,255,0,0.08),transparent_40%),radial-gradient(circle_at_80%_55%,rgba(90,155,255,0.08),transparent_45%)] opacity-50" />
          <motion.div
            ref={railRef}
            className="no-scrollbar flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory select-none"
            animate={!prefersReducedMotion && autoPlay ? marqueeControls : undefined}
            style={{ width: "200%", minWidth: "200%", cursor: "grab", userSelect: "none", willChange: autoPlay ? "transform" : "auto" }}
            drag="x"
            dragConstraints={{ left: -1600, right: 0 }}
            dragElastic={0.12}
            onHoverStart={() => setAutoPlay(false)}
            onHoverEnd={() => restartAuto()}
            onPointerDown={() => setAutoPlay(false)}
            onPointerUp={() => restartAuto()}
          >
            {loopShots.map((shot, idx) => (
              <motion.div
                key={shot.title}
                {...blurReveal}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.03 * (idx % shots.length) }}
                whileHover={{ scale: 1.03, rotate: -0.6 }}
                className="glass card-float relative mx-auto min-h-[230px] w-full max-w-[320px] shrink-0 snap-start overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br from-[#1b1d25] via-[#0d0f1a] to-[#050505] p-4 select-none"
              >
                <motion.div
                  className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(90,155,255,0.15),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(162,89,255,0.15),transparent_45%)]"
                  animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.06, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative z-10 flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="heading-font text-[14px] text-white tracking-wide">{shot.title}</div>
                      <div className="mono-font text-[10px] text-white/65">Beta capture. Context-specific.</div>
                    </div>
                    <div
                      className="rounded-full border border-white/10 px-3 py-[6px] text-[10px] uppercase tracking-[0.22em] text-white/70"
                      style={{ boxShadow: `0 0 16px ${shot.accent}44` }}
                    >
                      Live
                    </div>
                  </div>
                  {renderVisual(shot)}
                  <div className="space-y-2 pt-1">
                    {shot.bullets.map((item) => (
                      <GlowBullet key={item.title} accent={shot.accent} title={item.title} desc={item.desc} />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

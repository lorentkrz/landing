/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const skylinePaths = [
  "M8 212 L8 154 L32 154 L32 212 L64 212 L64 130 L96 130 L96 212",
  "M118 212 L118 142 L152 142 L152 212 L184 212 L184 118 L214 118 L214 212",
  "M236 212 L236 166 L264 166 L264 212 L298 212 L298 96 L340 96 L340 212",
  "M44 184 L72 184 L72 160 L92 160 L92 212",
  "M186 170 L214 170 L214 148 L234 148 L234 212"
];

const skylinePulsePoints = [
  { cx: 40, cy: 190, delay: 0 },
  { cx: 120, cy: 168, delay: 0.35 },
  { cx: 180, cy: 156, delay: 0.7 },
  { cx: 248, cy: 150, delay: 1.05 },
  { cx: 300, cy: 180, delay: 1.4 }
];

const featureCards = [
  { title: "Find the hottest venues instantly.", body: "Live heat, trusted hosts, no guesswork.", accent: "Live" },
  { title: "Check in with a single scan.", body: "QR + geo mesh mirrors the in-venue flow.", accent: "Scan" },
  { title: "Exclusive nightlife map in your pocket.", body: "Pulsing pins, presence, and verified rooms.", accent: "Map" }
];

const liveSignals = [
  { city: "Prishtina", venue: "Zone Club", status: "Pulsing now", count: "178 inside", vibe: "House/Techno" },
  { city: "Vlore", venue: "Soluna Beach Bar", status: "Sunset heat", count: "96 inside", vibe: "Deep/Chill" },
  { city: "Peja", venue: "Infinity Lounge", status: "Glow ready", count: "64 inside", vibe: "R&B/Afro" },
  { city: "Mitrovica", venue: "Sky High Club", status: "Lights on", count: "132 inside", vibe: "Amapiano/House" },
  { city: "Tirana", venue: "Pulse Rooftop", status: "After hours", count: "88 inside", vibe: "Techno/Progressive" }
];

const particles = Array.from({ length: 16 }, (_, idx) => ({
  id: idx,
  x: 6 + Math.random() * 88,
  y: 8 + Math.random() * 84,
  size: 6 + Math.random() * 12,
  delay: Math.random() * 3
}));

const auroraVariants = {
  animate: {
    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" }
  }
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const CityAwakensScene = () => (
  <div className="relative overflow-hidden rounded-[28px] border border-border bg-space-850/80 shadow-card" role="img" aria-label="Neon city skyline blueprint animation">
    <motion.div
      className="absolute inset-0"
      variants={auroraVariants}
      animate="animate"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 18%, rgba(124,248,255,0.14), transparent 52%), radial-gradient(circle at 80% 16%, rgba(180,255,92,0.12), transparent 50%), radial-gradient(circle at 60% 82%, rgba(125,139,255,0.16), transparent 55%)",
        backgroundSize: "140% 140%"
      }}
    />

    <motion.div
      className="absolute inset-0 opacity-50"
      initial={{ opacity: 0.3, x: -20 }}
      animate={{ opacity: [0.2, 0.35, 0.2], x: [0, 10, -6, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{ backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)" }}
    />

    <div className="relative aspect-[4/3] px-6 pb-10 pt-8">
      <svg viewBox="0 0 360 240" className="h-full w-full text-brand-primary/80" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="skylineStroke" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7cf8ff" />
            <stop offset="100%" stopColor="#7d8bff" />
          </linearGradient>
          <linearGradient id="pulse" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(124,248,255,0.0)" />
            <stop offset="50%" stopColor="rgba(124,248,255,0.65)" />
            <stop offset="100%" stopColor="rgba(124,248,255,0.0)" />
          </linearGradient>
        </defs>

        <motion.line
          x1="0"
          x2="360"
          y1="212"
          y2="212"
          stroke="url(#pulse)"
          strokeWidth="1.4"
          initial={{ x: "-90%" }}
          animate={{ x: "90%" }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {skylinePaths.map((d, idx) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="url(#skylineStroke)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: idx * 0.18, ease: "easeOut" }}
          />
        ))}

        {skylinePulsePoints.map((point) => (
          <motion.circle
            key={`${point.cx}-${point.cy}`}
            cx={point.cx}
            cy={point.cy}
            r="7"
            fill="rgba(124,248,255,0.3)"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.05, 0.7] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: point.delay }}
          />
        ))}
      </svg>

      <motion.div
        className="absolute inset-8 rounded-3xl"
        initial={{ opacity: 0.2, scale: 0.96 }}
        animate={{ opacity: [0.22, 0.38, 0.22], scale: [0.97, 1, 0.97] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 52% 62%, rgba(124,248,255,0.18), transparent 55%), linear-gradient(120deg, rgba(124,248,255,0.12), rgba(180,255,92,0.08))"
        }}
      />
      <div className="pointer-events-none absolute inset-x-6 bottom-5 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" />
          City Awakens
        </span>
        <span className="text-brand-primary">Nightlife is about to evolve</span>
      </div>
    </div>
  </div>
);

const QRCodeBox = () => (
  <motion.div
    className="relative h-48 w-48 overflow-hidden rounded-2xl border border-brand-primary/50 bg-space-850 shadow-glow md:h-56 md:w-56"
    animate={{ boxShadow: ["0 0 0 rgba(124,248,255,0.35)", "0 0 30px rgba(124,248,255,0.35)", "0 0 0 rgba(124,248,255,0.35)"] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(124,248,255,0.2),transparent_55%)] opacity-80" />
    <div className="relative flex h-full items-center justify-center p-4">
      <img
        src="https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=https%3A%2F%2Fnataa.app"
        alt="QR code linking to Nataa.app"
        className="h-full w-full rounded-xl border border-border object-contain bg-space-900/70 p-3"
        loading="lazy"
      />
    </div>
    <div className="absolute inset-x-0 bottom-3 text-center text-[11px] uppercase tracking-[0.18em] text-muted">
      Scan to visit Nataa.app or get early access
    </div>
  </motion.div>
);

const ParticleField = () => (
  <div className="pointer-events-none absolute inset-0">
    {particles.map((p) => (
      <motion.span
        key={p.id}
        className="absolute rounded-full bg-brand-primary/25 blur-[2px]"
        style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
        animate={{ y: ["0%", "-6%", "4%", "0%"], opacity: [0.3, 0.7, 0.2, 0.5] }}
        transition={{ duration: 9 + p.delay, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
      />
    ))}
  </div>
);

const Countdown = () => {
  const target = useMemo(() => new Date("2026-02-19T00:00:00Z").getTime(), []);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft({ days, hours, minutes });
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <span className="text-xs uppercase tracking-[0.18em]">Countdown</span>
      <div className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1">
        <span className="text-brand-primary font-semibold">{timeLeft.days}d</span>
        <span className="text-muted">:</span>
        <span className="text-brand-primary font-semibold">{timeLeft.hours}h</span>
        <span className="text-muted">:</span>
        <span className="text-brand-primary font-semibold">{timeLeft.minutes}m</span>
      </div>
    </div>
  );
};

const LiveTicker = () => (
  <div className="relative overflow-hidden rounded-2xl border border-border bg-space-850/70 shadow-card">
    <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-space-900 to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-space-900 to-transparent" />
    <motion.div
      className="flex min-w-full gap-6 px-6 py-3 text-sm"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
    >
      {[...liveSignals, ...liveSignals].map((signal, idx) => (
        <div key={`${signal.venue}-${idx}`} className="flex items-center gap-3 whitespace-nowrap">
          <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-ink font-semibold">{signal.venue}</span>
          <span className="text-muted">{signal.city}</span>
          <span className="text-brand-primary font-semibold">{signal.count}</span>
          <span className="text-muted">{signal.vibe}</span>
          <span className="pill">{signal.status}</span>
        </div>
      ))}
    </motion.div>
  </div>
);

export default function Page() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [contactMessage, setContactMessage] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const dropDate = useMemo(() => new Date("2026-02-19T00:00:00Z"), []);
  const isDropDay = useMemo(() => {
    const now = new Date();
    return now.toDateString() === dropDate.toDateString();
  }, [dropDate]);

  const isEmailValid = useMemo(() => email.includes("@"), [email]);
  const isContactValid = useMemo(
    () => contactForm.name.trim().length > 1 && contactForm.email.includes("@") && contactForm.message.trim().length > 5,
    [contactForm]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEmailValid) {
      setMessage("Enter a valid email.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setMessage(null);
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "coming-soon-2026" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setStatus("sent");
      setMessage("Locked in. You will be first.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not save your email.");
    }
  };

  const handleContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isContactValid) {
      setContactMessage("Fill all fields with a real email.");
      setContactStatus("error");
      return;
    }

    try {
      setContactStatus("loading");
      setContactMessage(null);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setContactStatus("sent");
      setContactMessage("Received. We will reply soon.");
      setContactForm({ name: "", email: "", message: "" });
    } catch (err) {
      setContactStatus("error");
      setContactMessage(err instanceof Error ? err.message : "Could not send your note.");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-space-900 text-ink">
      <div className="absolute -inset-24 bg-[radial-gradient(circle_at_15%_25%,rgba(124,248,255,0.14),transparent_42%),radial-gradient(circle_at_85%_18%,rgba(180,255,92,0.12),transparent_42%),radial-gradient(circle_at_60%_85%,rgba(125,139,255,0.16),transparent_45%)] blur-3xl opacity-70" />
      <div className="pointer-events-none absolute inset-0">
        <div className="grid-lines absolute inset-0 opacity-50" />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.15, 0.32, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(124,248,255,0.08), transparent 55%)" }}
        />
      </div>
      <ParticleField />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 pb-16 pt-12">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-muted lg:justify-start">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" aria-hidden="true" />
          Coming Soon 2026
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
          <motion.div {...fadeUp} className="space-y-6">
            <CityAwakensScene />
            <div className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left lg:max-w-2xl">
              <p className="font-display text-4xl leading-tight sm:text-5xl">Something powerful is coming.</p>
              <p className="text-lg text-muted">Nightlife is about to evolve.</p>
              <p className="text-sm text-muted">Be first. Be ahead.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <a
                href="https://instagram.com/Nataa.app"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-brand-primary/40 bg-brand-primary/10 px-4 py-3 text-sm text-brand-primary shadow-glow"
              >
                Follow @Nataa.app on Instagram
              </a>
              <div className="rounded-2xl border border-border bg-space-850/70 px-4 py-3 text-sm text-muted">
                Stealth drop is lining up
              </div>
              <a
                href="#waitlist"
                className="rounded-2xl border border-brand-primary/50 bg-brand-primary px-4 py-3 text-sm font-semibold text-space-900 shadow-glow"
              >
                Reserve your spot
              </a>
            </div>
            <div className="flex flex-col gap-4 rounded-3xl border border-border bg-space-850/70 p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted text-center sm:text-left">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">{isDropDay ? "Drop day" : "Signal"}</p>
                <p className="text-ink">{isDropDay ? "Doors open. Walk in." : "Join the signal to get early drops."}</p>
              </div>
              <Countdown />
            </div>
          </motion.div>

          <motion.form
            {...fadeUp}
            onSubmit={handleSubmit}
            className="glass-card flex w-full flex-col gap-4 rounded-3xl border border-border p-5 shadow-card"
            aria-label="Join the signal email form"
            id="waitlist"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" aria-hidden="true" />
              Early Access
            </div>
            <p className="text-2xl font-display">Get the first invite.</p>
            <p className="text-sm text-muted">Beta drops, venue onboarding, and the first city pulse.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nightlife.com"
                aria-label="Email address"
                className="flex-1 rounded-2xl border border-border bg-space-850 px-4 py-3 text-sm focus:border-brand-primary/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-2xl bg-brand-primary px-5 py-3 font-semibold text-space-900 shadow-glow transition disabled:opacity-60"
              >
                {status === "loading" ? "Sending..." : "Join the signal"}
              </button>
            </div>
            {message && (
              <p className={status === "sent" ? "text-sm text-brand-primary" : "text-sm text-red-400"} aria-live="polite">
                {message}
              </p>
            )}
            <p className="text-xs text-muted">Private list. No spam. Unsubscribe anytime.</p>
          </motion.form>
        </div>

        <motion.section {...fadeUp} className="glass-card rounded-3xl border border-border p-5 shadow-card">
          <div className="mb-4 flex flex-col gap-1 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">What Nataa unlocks</p>
            <p className="text-lg text-ink">Real-time intel before you step inside.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((card, idx) => (
              <motion.div
                key={card.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-space-850/70 p-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.45 }}
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(circle at 30% 20%, rgba(124,248,255,0.08), transparent 40%)" }} />
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                  <span className="h-2 w-2 rounded-full bg-brand-primary" aria-hidden="true" />
                  {card.accent}
                </div>
                <p className="mt-2 font-semibold">{card.title}</p>
                <p className="text-sm text-muted">{card.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp} className="glass-card rounded-3xl border border-border p-5 shadow-card">
          <div className="mb-4 flex flex-col gap-1 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Tonight preview</p>
            <p className="text-lg text-ink">Simulated signals from the launch cities.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {liveSignals.map((signal, idx) => (
              <motion.div
                key={signal.venue}
                className="rounded-2xl border border-border bg-space-850/70 p-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted">{signal.city}</span>
                  <span className="pill">{signal.status}</span>
                </div>
                <p className="mt-2 text-lg font-semibold">{signal.venue}</p>
                <p className="text-sm text-muted">{signal.vibe}</p>
                <p className="mt-3 text-brand-primary font-semibold">{signal.count}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section {...fadeUp} className="glass-card rounded-3xl border border-border p-5 shadow-card">
          <div className="mb-2 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-muted md:justify-start">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" aria-hidden="true" />
            Pulse feed
          </div>
          <LiveTicker />
        </motion.section>

        <motion.section
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl border border-brand-primary/30 bg-space-850/80 p-6 shadow-card"
        >
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-brand-primary/15 blur-[80px]" />
            <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-brand-primary/12 blur-[90px]" />
            <div className="grid-lines absolute inset-0 opacity-30" />
          </div>
          <div className="relative grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div className="space-y-3 text-sm text-muted lg:max-w-lg">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Access</p>
              <p className="text-lg text-ink">Drop Nataa to your phone.</p>
              <p>Save the signal, get mobile alerts, and unlock early build codes the moment they ship.</p>
              <div className="flex flex-wrap gap-2">
                <span className="pill">Save to phone</span>
                <span className="pill">iOS beta soon</span>
                <span className="pill">Android beta soon</span>
                <span className="pill">Early build codes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="#waitlist"
                  className="rounded-xl border border-brand-primary/60 bg-brand-primary px-4 py-2 text-sm font-semibold text-space-900 shadow-glow"
                >
                  Get drop alert
                </a>
                <a
                  href="https://instagram.com/Nataa.app"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-border px-4 py-2 text-sm text-muted hover:text-ink"
                >
                  Follow @Nataa.app
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <QRCodeBox />
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeUp} className="glass-card grid gap-6 rounded-3xl border border-border p-6 shadow-card lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
          <div className="space-y-3 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-muted lg:justify-start">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-primary" aria-hidden="true" />
              Contact
            </div>
            <p className="text-2xl font-display">Talk to the team</p>
            <p className="text-sm text-muted">
              Partnerships, venues, promoters, hosts. Tell us your city and the night you want to light up.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted lg:justify-start">
              <span className="pill">contact@nataa.app</span>
              <span className="pill">Instagram: @Nataa.app</span>
              <span className="pill">Web: nataa.app</span>
            </div>
          </div>
          <form onSubmit={handleContact} className="space-y-3" aria-label="Contact form">
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
              className="w-full rounded-2xl border border-border bg-space-850 px-4 py-3 text-sm focus:border-brand-primary/60 focus:outline-none"
            />
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@company.com"
              className="w-full rounded-2xl border border-border bg-space-850 px-4 py-3 text-sm focus:border-brand-primary/60 focus:outline-none"
            />
            <textarea
              value={contactForm.message}
              onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="City, venue, date - how can we help?"
              className="w-full rounded-2xl border border-border bg-space-850 px-4 py-3 text-sm h-28 focus:border-brand-primary/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={contactStatus === "loading"}
              className="w-full rounded-2xl bg-brand-primary px-5 py-3 font-semibold text-space-900 shadow-glow transition disabled:opacity-60"
            >
              {contactStatus === "loading" ? "Sending..." : "Send message"}
            </button>
            {contactMessage && (
              <p className={contactStatus === "sent" ? "text-sm text-brand-primary" : "text-sm text-red-400"} aria-live="polite">
                {contactMessage}
              </p>
            )}
          </form>
        </motion.section>

        <motion.footer {...fadeUp} className="flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-ink">Nataa - transforming nightlife everywhere.</span>
            <span className="h-1 w-1 rounded-full bg-brand-primary" aria-hidden="true" />
            <div className="flex items-center gap-3">
              <a href="https://nataa.app" className="hover:text-ink" aria-label="Nataa website">
                Web
              </a>
              <a href="https://instagram.com/Nataa.app" className="hover:text-ink" aria-label="Instagram">
                IG
              </a>
            </div>
          </div>
          <p className="text-xs text-muted">Nightlife is about to evolve. Be first. Be ahead.</p>
        </motion.footer>
      </div>
    </main>
  );
}

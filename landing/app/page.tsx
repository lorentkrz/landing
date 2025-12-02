"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/Hero";
import { Preloader } from "@/components/Preloader";
import { ProblemSection } from "@/components/ProblemSection";
import { MechanicsSection } from "@/components/MechanicsSection";
import { GhostSection } from "@/components/GhostSection";
import { HypeSection } from "@/components/HypeSection";
import { PartnerSection } from "@/components/PartnerSection";
import { WaitlistSection } from "@/components/WaitlistSection";
import { Footer } from "@/components/Footer";
import { AppSneakPeek } from "@/components/AppSneakPeek";
import { ViralStrip } from "@/components/ViralStrip";
import { BuildLog } from "@/components/BuildLog";
import { StickyCTA } from "@/components/StickyCTA";
import { AppFeatureGrid } from "@/components/AppFeatureGrid";
import { MapShowcase } from "@/components/MapShowcase";
import { GalleryStrip } from "@/components/GalleryStrip";
import { Roadmap } from "@/components/Roadmap";
import { getSupabaseClient } from "@/lib/supabaseClient";

const getNextFeb19UTC = () => {
  const now = new Date();
  const year =
    now.getUTCMonth() > 1 || (now.getUTCMonth() === 1 && now.getUTCDate() > 19)
      ? now.getUTCFullYear() + 1
      : now.getUTCFullYear();
  return Date.UTC(year, 1, 19, 23, 59, 59);
};
const PRELOADER_MESSAGES = [
  "LOCATING NEARBY SIGNALS...",
  "CALIBRATING HEATMAP...",
  "SYNCING VIBE...",
];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BASE_COUNT = 180;

type WaitlistForm = { name: string; email: string };
type PartnerForm = { venueName: string; contactName: string; email: string; city: string; role: string };
type WaitlistState = "idle" | "loading" | "success" | "error";
type PartnerState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const supabase = getSupabaseClient();
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const targetTime = useMemo(() => getNextFeb19UTC(), []);
  const [isLoaded, setIsLoaded] = useState(false);
  const [blast, setBlast] = useState(false);
  const [preloadIndex, setPreloadIndex] = useState(0);
  const [typed, setTyped] = useState("");

  const [countdown, setCountdown] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  const [waitlistForm, setWaitlistForm] = useState<WaitlistForm>({ name: "", email: "" });
  const [waitlistState, setWaitlistState] = useState<WaitlistState>("idle");
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerState, setPartnerState] = useState<PartnerState>("idle");
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState<PartnerForm>({
    venueName: "",
    contactName: "",
    email: "",
    city: "",
    role: "Owner",
  });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
      document.documentElement.style.setProperty("--cursor-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--cursor-y", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const delta = Math.max(targetTime - now, 0);
      const days = Math.floor(delta / (1000 * 60 * 60 * 24));
      const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((delta / (1000 * 60)) % 60);
      const seconds = Math.floor((delta / 1000) % 60);
      const format = (num: number) => num.toString().padStart(2, "0");
      setCountdown({
        days: format(days),
        hours: format(hours),
        minutes: format(minutes),
        seconds: format(seconds),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  useEffect(() => {
    const idxTimer = setInterval(() => setPreloadIndex((i) => (i + 1) % PRELOADER_MESSAGES.length), 700);
    return () => clearInterval(idxTimer);
  }, []);

  useEffect(() => {
    const message = PRELOADER_MESSAGES[preloadIndex];
    let i = 0;
    setTyped("");
    const typing = setInterval(() => {
      setTyped(message.slice(0, i + 1));
      i += 1;
      if (i >= message.length) clearInterval(typing);
    }, 30);
    return () => clearInterval(typing);
  }, [preloadIndex]);

  useEffect(() => {
    const blastTimer = setTimeout(() => setBlast(true), 1400);
    const doneTimer = setTimeout(() => setIsLoaded(true), 2300);
    return () => {
      clearTimeout(blastTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (!error && typeof count === "number") setWaitlistCount(count);
      });
  }, [supabase]);

  const paddedCount = useMemo(() => {
    const projected = (waitlistCount ?? DEFAULT_BASE_COUNT) + 220;
    return Math.max(350, Math.min(450, projected));
  }, [waitlistCount]);

  const heroTicker = "NATAA BETA /// KOSOVO FIRST /// WE BUILD THE SIGNAL /// STOP GUESSING /// START LIVING /// ";

  const featureCards = [
    {
      title: "GOD MODE FOR NIGHTLIFE.",
      copy: "Live wait times. Real-time crowd mix. Energy scores. Filter by Hip-Hop, House, or Latin. If the vibe shifts, you know first.",
      accent: "#ff2e00",
      tag: "The Radar",
      badge: "ENERGY HIGH",
    },
    {
      title: "10% BLUR. 100% INTENT.",
      copy: "Check in to see who's actually here. Profiles are privacy-blurred until you connect. No window shoppers. Only people in the room.",
      accent: "#d4ff00",
      tag: "The Blur",
      badge: "PRIVACY LOCK",
    },
    {
      title: "100 SECONDS.",
      copy: "One credit to connect. 100 seconds to chat. Make your move or the chat self-destructs. We engineered the thrill of the chase.",
      accent: "#6600ff",
      tag: "The Timer",
      badge: "SUDDEN DEATH",
    },
  ];

  const hypeLines = ["THE NIGHT HAS EYES", "KOSOVO GOES LIVE", "GLOBAL WAVE INCOMING"];

  const handleWaitlistSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWaitlistError(null);
    if (!EMAIL_REGEX.test(waitlistForm.email)) {
      setWaitlistError("Drop a valid email so we can ping you.");
      return;
    }

    setWaitlistState("loading");

    try {
      let nextCount = waitlistCount ?? DEFAULT_BASE_COUNT;

      if (supabase) {
        const { error } = await supabase.from("waitlist").insert({
          email: waitlistForm.email.toLowerCase(),
          name: waitlistForm.name || null,
          referral_count: 0,
        });
        if (error) throw error;

        const { count, error: countError } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true });
        if (!countError && typeof count === "number") nextCount = count;
      }

      setWaitlistCount(nextCount);
      setWaitlistState("success");
    } catch (err) {
      console.error(err);
      setWaitlistError("Something glitched. Try again in a beat.");
      setWaitlistState("error");
    }
  };

  const handlePartnerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPartnerError(null);
    if (!EMAIL_REGEX.test(partnerForm.email)) {
      setPartnerError("Enter a valid contact email.");
      return;
    }
    setPartnerState("loading");

    try {
      if (supabase) {
        const { error } = await supabase.from("partners").insert({
          venue_name: partnerForm.venueName,
          contact_name: partnerForm.contactName,
          email: partnerForm.email.toLowerCase(),
          city: partnerForm.city,
          role: partnerForm.role,
        });
        if (error) throw error;
      }
      setPartnerState("success");
    } catch (err) {
      console.error(err);
      setPartnerError("Couldn't save. Try again shortly.");
      setPartnerState("error");
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div
        className="cursor-spotlight"
        style={{ "--cursor-x": `${cursor.x}px`, "--cursor-y": `${cursor.y}px` } as CSSProperties}
      />

      <Preloader visible={!isLoaded} typed={typed} blast={blast} />

      <header className="fixed left-0 right-0 top-0 z-40 px-4 py-4 md:px-8">
        <div className="glass flex items-center justify-between gap-4 rounded-full border border-white/10 bg-black/50 px-4 py-3 text-sm">
          <div className="heading-font text-base text-[#d4ff00] drop-shadow-[0_0_14px_rgba(212,255,0,0.45)]">NATAA</div>
          <nav className="hidden items-center gap-4 md:flex">
            <a className="hover:text-[#d4ff00]" href="#features">
              Features
            </a>
            <a className="hover:text-[#d4ff00]" href="#map">
              Map
            </a>
            <a className="hover:text-[#d4ff00]" href="#screens">
              Screens
            </a>
            <a className="hover:text-[#d4ff00]" href="#partners">
              Venues
            </a>
            <a className="hover:text-[#d4ff00]" href="#waitlist">
              Waitlist
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              className="heading-font rounded-full border border-[#d4ff00]/50 bg-[#d4ff00] px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-black shadow-[0_0_18px_rgba(212,255,0,0.35)]"
              href="#waitlist"
            >
              Join
            </a>
            <a
              className="hidden rounded-full border border-white/15 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/70 hover:text-[#d4ff00] md:inline-block"
              href="https://instagram.com/Nataa.app"
              target="_blank"
              rel="noreferrer"
            >
              IG
            </a>
          </div>
        </div>
      </header>

      <main className="relative flex min-h-screen flex-col bg-[#050505] text-white">
        <Hero
          countdown={countdown}
          ticker={heroTicker}
          onJoinClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
        />
        <ViralStrip />
        <ProblemSection />
        <AppFeatureGrid />
        <MapShowcase />
        <MechanicsSection cards={featureCards} />
        <AppSneakPeek />
        <GalleryStrip />
        <GhostSection />
        <BuildLog />
        <Roadmap />
        <HypeSection lines={hypeLines} />
        <PartnerSection
          open={partnerOpen}
          onOpen={() => setPartnerOpen(true)}
          onClose={() => {
            setPartnerOpen(false);
            setPartnerState("idle");
            setPartnerError(null);
          }}
          form={partnerForm}
          onFormChange={setPartnerForm}
          onSubmit={handlePartnerSubmit}
          state={partnerState}
          error={partnerError}
        />
        <WaitlistSection
          paddedCount={paddedCount}
          state={waitlistState}
          form={waitlistForm}
          error={waitlistError}
          onSubmit={handleWaitlistSubmit}
          onFormChange={setWaitlistForm}
        />
        <Footer />
      </main>
      <StickyCTA />
    </div>
  );
}

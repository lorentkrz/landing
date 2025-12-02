"use client";

import { useEffect, useState } from "react";

export function StickyCTA() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      setHidden(current > lastY && current > 120);
      lastY = current;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToWaitlist = () =>
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  const scrollToPartner = () =>
    document.getElementById("partners")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 bg-black/70 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2">
        <div className="mono-font text-[11px] uppercase tracking-[0.25em] text-white/70">
          We are building now
        </div>
        <div className="flex gap-2">
          <button
            onClick={scrollToWaitlist}
            className="btn heading-font rounded-full border border-[#d4ff00]/40 bg-[#d4ff00] px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-black"
          >
            Join
          </button>
          <button
            onClick={scrollToPartner}
            className="btn heading-font rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white"
          >
            Venues
          </button>
        </div>
      </div>
    </div>
  );
}

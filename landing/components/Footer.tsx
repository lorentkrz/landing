"use client";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/60 px-6 py-10 text-white/70 backdrop-blur md:px-12">
      <div className="grain-overlay" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="heading-font text-xl text-white">NATAA</div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
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
          <a
            className="heading-font text-sm text-[#d4ff00]"
            href="https://instagram.com/Nataa.app"
            target="_blank"
            rel="noreferrer"
          >
            IG @Nataa.app
          </a>
        </div>
        <div className="mono-font text-xs text-white/55">© 2025 Nataa. Engineered for the Night.</div>
      </div>
    </footer>
  );
}

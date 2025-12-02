"use client";

export function HypeSection({ lines }: { lines: string[] }) {
  const phrase = lines.join(" /// ");
  return (
    <section className="relative px-6 py-16 md:px-12">
      <div className="grain-overlay" />
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-white/0 to-white/5">
        <div className="marquee py-6">
          <span className="heading-font text-2xl uppercase tracking-[0.4em] text-white">{`${phrase} /// ${phrase} /// ${phrase}`}</span>
        </div>
      </div>
    </section>
  );
}

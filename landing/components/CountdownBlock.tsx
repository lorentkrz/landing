"use client";

export function CountdownBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center shadow-lg shadow-[#d4ff00]/5 backdrop-blur">
      <div className="heading-font text-3xl text-[#d4ff00] md:text-4xl">{value}</div>
      <div className="mono-font text-xs uppercase tracking-[0.3em] text-white/70">{label}</div>
    </div>
  );
}

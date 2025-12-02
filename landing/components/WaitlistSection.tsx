"use client";

import type { FormEvent } from "react";

type WaitlistForm = { name: string; email: string };
type WaitlistState = "idle" | "loading" | "success" | "error";

export function WaitlistSection({
  paddedCount,
  state,
  form,
  error,
  onSubmit,
  onFormChange,
}: {
  paddedCount: number;
  state: WaitlistState;
  form: WaitlistForm;
  error: string | null;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onFormChange: (form: WaitlistForm) => void;
}) {
  return (
    <section className="relative px-6 pb-20 pt-10 md:px-12" id="waitlist">
      <div className="grain-overlay" />
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-7 shadow-[0_30px_60px_rgba(0,0,0,0.45)] md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,255,0,0.08),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(102,0,255,0.12),transparent_38%)] opacity-70" />
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="heading-font text-3xl text-white">Secure your handle.</h3>
            <p className="mono-font mt-2 text-sm text-white/75">
              Early access is limited. Founding members get <span className="text-[#d4ff00]">100 Credits</span> on launch.
            </p>
            <p className="mono-font mt-1 text-xs text-white/60">Waitlist heat: {paddedCount.toLocaleString()}+</p>
          </div>
          <div className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70">
            Kosovo first, then worldwide.
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {state === "success" ? (
            <div className="glass rounded-2xl border border-[#d4ff00]/30 p-6">
              <div className="heading-font text-2xl text-[#d4ff00]">You are locked in.</div>
              <p className="mono-font mt-2 text-sm text-white/80">
                Thanks for joining the waitlist. We will ping you when Kosovo opens and before the global wave. No codes to manage, just watch your inbox.
              </p>
              <p className="mono-font mt-4 text-xs text-white/60">Current waitlist heat: {paddedCount.toLocaleString()}+</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="glass rounded-2xl border border-white/10 p-6">
              <div className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">Terminal Access</div>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">Full Name (optional)</label>
                  <input
                    value={form.name}
                    onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-[#d4ff00]/60"
                    placeholder="Jane Doe"
                    type="text"
                  />
                </div>
                <div>
                  <label className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">Email Address *</label>
                  <input
                    required
                    value={form.email}
                    onChange={(e) => onFormChange({ ...form, email: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-[#d4ff00]/60"
                    placeholder="jane@vibes.com"
                    type="email"
                  />
                </div>
                {error && <div className="mono-font text-xs text-[#ff2e00]">{error}</div>}
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="btn heading-font mt-2 w-full rounded-full border border-[#d4ff00]/40 bg-[#d4ff00] px-6 py-3 text-sm uppercase tracking-[0.25em] text-black shadow-[0_0_24px_rgba(212,255,0,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {state === "loading" ? "SYNCING..." : "GET ACCESS"}
                </button>
                <div className="mono-font text-xs text-white/55">We will email when the drop is live.</div>
              </div>
            </form>
          )}

          <div className="glass rounded-2xl border border-white/10 p-6">
            <div className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">What happens next</div>
            <div className="heading-font mt-3 text-xl text-white">We keep it simple.</div>
            <ul className="mono-font mt-4 space-y-3 text-sm text-white/80">
              <li>- You are queued for the Kosovo drop.</li>
              <li>- We confirm your spot by email, no codes required.</li>
              <li>- Credits auto-attach to your handle at launch.</li>
              <li>- We will add the live app link once the signal is on.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

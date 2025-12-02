"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FormEvent } from "react";

type PartnerForm = {
  venueName: string;
  contactName: string;
  email: string;
  city: string;
  role: string;
};

type PartnerState = "idle" | "loading" | "success" | "error";

export function PartnerSection({
  open,
  onOpen,
  onClose,
  form,
  onFormChange,
  onSubmit,
  state,
  error,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  form: PartnerForm;
  onFormChange: (form: PartnerForm) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  state: PartnerState;
  error: string | null;
}) {
  return (
    <>
      <section className="relative px-6 py-20 md:px-12" id="partners">
        <div className="grain-overlay" />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/4 to-transparent p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,255,0,0.08),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(102,0,255,0.12),transparent_35%)]" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h3 className="heading-font text-3xl text-white">OWN A VENUE?</h3>
              <p className="mono-font max-w-2xl text-sm leading-relaxed text-white/80">
                Stop relying on flyers. Push &quot;Drops&quot; directly to phones within 5 miles. Fill your empty tables in minutes.
              </p>
            </div>
            <button
              onClick={onOpen}
              className="btn heading-font rounded-full border border-white/30 px-5 py-3 text-xs uppercase tracking-[0.25em] text-white transition hover:border-[#d4ff00] hover:text-[#d4ff00]"
            >
              APPLY FOR PARTNER ACCESS
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={() => {
                  onClose();
                }}
                className="absolute right-4 top-4 text-white/60 hover:text-white"
              >
                ✕
              </button>
              <h3 className="heading-font text-2xl text-white">Partner Access</h3>
              <p className="mono-font mt-2 text-sm text-white/70">
                Drop your details. We&apos;ll wire the webhook to contact@nataa.app next.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">
                      Venue Name
                    </label>
                    <input
                      required
                      value={form.venueName}
                      onChange={(e) => onFormChange({ ...form, venueName: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-[#d4ff00]/60"
                      placeholder="Club Nova"
                    />
                  </div>
                  <div>
                    <label className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">
                      City
                    </label>
                    <input
                      required
                      value={form.city}
                      onChange={(e) => onFormChange({ ...form, city: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-[#d4ff00]/60"
                      placeholder="Los Angeles"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">
                      Contact Name
                    </label>
                    <input
                      required
                      value={form.contactName}
                      onChange={(e) => onFormChange({ ...form, contactName: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-[#d4ff00]/60"
                      placeholder="Alex Rivera"
                    />
                  </div>
                  <div>
                    <label className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">
                      Email
                    </label>
                    <input
                      required
                      value={form.email}
                      onChange={(e) => onFormChange({ ...form, email: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-[#d4ff00]/60"
                      placeholder="host@nataa.app"
                      type="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="mono-font text-xs uppercase tracking-[0.3em] text-white/60">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => onFormChange({ ...form, role: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-3 text-sm text-white outline-none focus:border-[#d4ff00]/60"
                  >
                    <option>Owner</option>
                    <option>Promoter</option>
                    <option>Manager</option>
                  </select>
                </div>
                {error && <div className="mono-font text-xs text-[#ff2e00]">{error}</div>}
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="btn heading-font w-full rounded-full border border-[#d4ff00]/40 bg-[#d4ff00] px-6 py-3 text-sm uppercase tracking-[0.25em] text-black shadow-[0_0_24px_rgba(212,255,0,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {state === "loading" ? "SENDING..." : "SUBMIT"}
                </button>
                {state === "success" && (
                  <div className="mono-font text-xs text-[#d4ff00]">
                    Saved. We&apos;ll ping you with the webhook once live.
                  </div>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

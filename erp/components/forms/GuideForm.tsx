"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { Database } from "@/lib/database.types";
import { guideActionInitialState, upsertGuide } from "@/lib/actions/guides";

type Guide = Database["public"]["Tables"]["app_guides"]["Row"];

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-[#4dabf7] py-2 text-sm font-semibold text-[#050b1b] disabled:opacity-70"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
};

export const GuideUpdateForm = ({ guide }: { guide: Guide }) => {
  const [state, formAction] = useActionState(upsertGuide, guideActionInitialState);
  return (
    <form action={formAction} className="space-y-3 text-sm text-slate-300">
      <input type="hidden" name="id" value={guide.id} />
      <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
        Title
        <input
          name="title"
          defaultValue={guide.title}
          className="rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
        Subtitle
        <input
          name="subtitle"
          defaultValue={guide.subtitle ?? ""}
          className="rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
        Media URL
        <input
          name="media_url"
          defaultValue={guide.media_url ?? ""}
          className="rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
        Steps (JSON)
        <textarea
          name="steps"
          defaultValue={JSON.stringify(guide.steps ?? [], null, 2)}
          className="min-h-[140px] rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 font-mono text-xs text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      {state.status === "error" ? <p className="text-xs text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-xs text-emerald-300">{state.message}</p> : null}
      <SubmitButton />
    </form>
  );
};

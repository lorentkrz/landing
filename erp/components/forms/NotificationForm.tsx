"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createActivity, notificationActionInitialState, type NotificationActionState } from "@/lib/actions/notifications";

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-[#4dabf7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
      {pending ? "Sending…" : "Log campaign"}
    </button>
  );
};

export const NotificationCreateForm = () => {
  const [state, formAction] = useActionState<NotificationActionState, FormData>(createActivity, notificationActionInitialState);

  return (
    <form action={formAction} className="space-y-3">
      <label className="flex flex-col text-xs text-slate-400">
        Segment key
        <input
          name="segment"
          defaultValue="general"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Title
        <input
          name="title"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Body
        <textarea
          name="description"
          className="mt-1 min-h-[100px] rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      {state.status === "error" ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <SubmitButton />
    </form>
  );
};

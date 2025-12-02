"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPayout, payoutActionInitialState, updatePayoutStatus, type PayoutActionState } from "@/lib/actions/payouts";

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-[#4dabf7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
      {pending ? "Saving…" : label}
    </button>
  );
};

export const PayoutCreateForm = () => {
  const [state, formAction] = useActionState<PayoutActionState, FormData>(createPayout, payoutActionInitialState);

  return (
    <form action={formAction} className="space-y-3">
      <label className="flex flex-col text-xs text-slate-400">
        Venue ID
        <input
          name="venue_id"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
          placeholder="UUID of venue"
          required
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Amount (credits)
        <input
          name="amount"
          type="number"
          min="1"
          step="0.01"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
          required
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Scheduled date (optional)
        <input
          name="scheduled_for"
          type="date"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Notes
        <textarea
          name="notes"
          className="mt-1 min-h-[80px] rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
          placeholder="Optional finance notes"
        />
      </label>
      {state.status === "error" ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <SubmitButton label="Add payout" />
    </form>
  );
};

const statusOptions: Array<{ label: string; value: "queued" | "approved" | "paid" | "rejected" }> = [
  { label: "Queued", value: "queued" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
  { label: "Rejected", value: "rejected" },
];

export const PayoutRowActions = ({
  payout,
}: {
  payout: {
    id: string;
    status: "queued" | "approved" | "paid" | "rejected";
    notes: string | null;
  };
}) => {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<PayoutActionState, FormData>(updatePayoutStatus, payoutActionInitialState);

  return (
    <div className="text-xs text-slate-400">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-xl border border-[var(--border)] px-3 py-1 text-white"
      >
        {open ? "Close" : "Update"}
      </button>
      {open ? (
        <form action={formAction} className="mt-2 space-y-2 rounded-2xl border border-[var(--border)] bg-[#050b1b] p-3">
          <input type="hidden" name="id" value={payout.id} />
          <label className="flex flex-col text-xs text-slate-400">
            Status
            <select
              name="status"
              defaultValue={payout.status}
              className="mt-1 rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-xs text-slate-400">
            Notes
            <textarea
              name="notes"
              defaultValue={payout.notes ?? ""}
              className="mt-1 min-h-[60px] rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
            />
          </label>
          {state.status === "error" ? <p className="text-xs text-rose-300">{state.message}</p> : null}
          {state.status === "success" ? <p className="text-xs text-emerald-300">{state.message}</p> : null}
          <SubmitButton label="Save changes" />
        </form>
      ) : null}
    </div>
  );
};

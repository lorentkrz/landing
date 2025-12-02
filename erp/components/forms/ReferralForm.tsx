"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { referralActionInitialState, updateReferral, type ReferralActionState } from "@/lib/actions/referrals";

type ReferralSummary = {
  id: string;
  status: "pending" | "joined" | "rewarded" | "revoked";
  reward_inviter_credits: number | null;
  reward_invitee_credits: number | null;
};

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-[#4dabf7] px-4 py-2 text-sm font-semibold text-[#050b1b] disabled:opacity-70"
    >
      {pending ? "Saving…" : label}
    </button>
  );
};

export const ReferralUpdateForm = ({ referral }: { referral: ReferralSummary }) => {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<ReferralActionState, FormData>(updateReferral, referralActionInitialState);

  return (
    <div className="text-xs text-slate-400">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-xl border border-[var(--border)] px-3 py-1 text-white"
      >
        {open ? "Close" : "Edit"}
      </button>
      {open ? (
        <form action={formAction} className="mt-2 space-y-3 rounded-2xl border border-[var(--border)] bg-[#050b1b] p-3 text-sm">
          <input type="hidden" name="id" value={referral.id} />
          <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
            Status
            <select
              name="status"
              defaultValue={referral.status}
              className="rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-sm text-white"
            >
              <option value="pending">Pending</option>
              <option value="joined">Joined</option>
              <option value="rewarded">Rewarded</option>
              <option value="revoked">Revoked</option>
            </select>
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
              Inviter reward
              <input
                name="reward_inviter_credits"
                type="number"
                defaultValue={referral.reward_inviter_credits ?? 0}
                className="rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-widest text-slate-500">
              Invitee reward
              <input
                name="reward_invitee_credits"
                type="number"
                defaultValue={referral.reward_invitee_credits ?? 0}
                className="rounded-xl border border-[var(--border)] bg-[#0c1227] px-3 py-2 text-white"
              />
            </label>
          </div>
          {state.status === "error" ? <p className="text-xs text-rose-300">{state.message}</p> : null}
          {state.status === "success" ? <p className="text-xs text-emerald-300">{state.message}</p> : null}
          <div className="flex justify-end">
            <SubmitButton label="Save" />
          </div>
        </form>
      ) : null}
    </div>
  );
};

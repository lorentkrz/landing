"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createTransaction, creditActionInitialState, deleteTransaction, type CreditActionState } from "@/lib/actions/credits";

const SubmitButton = ({ label }: { label: string }) => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-[#4dabf7] px-4 py-2 text-sm font-semibold text-white disabled:opacity-70">
      {pending ? "Saving…" : label}
    </button>
  );
};

export const CreditAdjustForm = () => {
  const [state, formAction] = useActionState<CreditActionState, FormData>(createTransaction, creditActionInitialState);

  return (
    <form action={formAction} className="space-y-3">
      <label className="flex flex-col text-xs text-slate-400">
        User ID
        <input
          name="user_id"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Transaction type
        <select
          name="type"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
          defaultValue="adjustment"
        >
          <option value="purchase">Purchase</option>
          <option value="redeem">Redeem</option>
          <option value="adjustment">Adjustment</option>
          <option value="refund">Refund</option>
        </select>
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Credits
        <input
          name="amount"
          type="number"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      <label className="flex flex-col text-xs text-slate-400">
        Price (optional)
        <input
          name="price"
          type="number"
          step="0.01"
          className="mt-1 rounded-xl border border-[var(--border)] bg-[#050b1b] px-3 py-2 text-sm text-white outline-none focus:border-[#4dabf7]"
        />
      </label>
      {state.status === "error" ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      {state.status === "success" ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
      <SubmitButton label="Record transaction" />
    </form>
  );
};

export const CreditRowActions = ({ transactionId }: { transactionId: string }) => {
  const [state, formAction] = useActionState<CreditActionState, FormData>(deleteTransaction, creditActionInitialState);
  const [open, setOpen] = useState(false);

  return (
    <div className="text-xs text-slate-400">
      <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-1 text-white" onClick={() => setOpen((prev) => !prev)}>
        {open ? "Close" : "Remove"}
      </button>
      {open ? (
        <form action={formAction} className="mt-2 space-y-2 rounded-2xl border border-[var(--border)] bg-[#050b1b] p-3">
          <input type="hidden" name="id" value={transactionId} />
          {state.status === "error" ? <p className="text-xs text-rose-300">{state.message}</p> : null}
          {state.status === "success" ? <p className="text-xs text-emerald-300">{state.message}</p> : null}
          <button type="submit" className="rounded-xl border border-rose-500 px-3 py-1 text-xs text-rose-200">
            Delete transaction
          </button>
        </form>
      ) : null}
    </div>
  );
};

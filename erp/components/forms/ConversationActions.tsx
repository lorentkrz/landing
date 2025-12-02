"use client";

import { useActionState, useState } from "react";
import { conversationActionInitialState, deleteConversation, type ConversationActionState } from "@/lib/actions/conversations";

export const ConversationRowActions = ({ conversationId }: { conversationId: string }) => {
  const [state, formAction] = useActionState<ConversationActionState, FormData>(deleteConversation, conversationActionInitialState);
  const [open, setOpen] = useState(false);

  return (
    <div className="text-xs text-slate-400">
      <button type="button" className="rounded-xl border border-[var(--border)] px-3 py-1 text-white" onClick={() => setOpen((prev) => !prev)}>
        {open ? "Close" : "Archive"}
      </button>
      {open ? (
        <form action={formAction} className="mt-2 space-y-2 rounded-2xl border border-[var(--border)] bg-[#050b1b] p-3">
          <input type="hidden" name="id" value={conversationId} />
          {state.status === "error" ? <p className="text-xs text-rose-300">{state.message}</p> : null}
          {state.status === "success" ? <p className="text-xs text-emerald-300">{state.message}</p> : null}
          <button type="submit" className="rounded-xl border border-rose-500 px-3 py-1 text-xs text-rose-200">
            Confirm archive
          </button>
        </form>
      ) : null}
    </div>
  );
};

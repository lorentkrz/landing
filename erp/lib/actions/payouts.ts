"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type PayoutActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const payoutActionInitialState: PayoutActionState = { status: "idle" };

const client = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase server client not configured");
  }
  return supabase;
};

export const createPayout = async (_prev: PayoutActionState, formData: FormData): Promise<PayoutActionState> => {
  const supabase = client();
  const venueId = String(formData.get("venue_id") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const scheduledFor = String(formData.get("scheduled_for") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!venueId) {
    return { status: "error", message: "Venue ID is required." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: "error", message: "Amount must be greater than zero." };
  }

  const { error } = await supabase.from("payouts").insert({
    venue_id: venueId,
    amount,
    status: "queued",
    scheduled_for: scheduledFor.length > 0 ? new Date(scheduledFor).toISOString() : null,
    notes,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/accounting");
  return { status: "success", message: "Payout added to queue." };
};

export const updatePayoutStatus = async (_prev: PayoutActionState, formData: FormData): Promise<PayoutActionState> => {
  const supabase = client();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as "queued" | "approved" | "paid" | "rejected";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id) {
    return { status: "error", message: "Missing payout ID." };
  }
  if (!["queued", "approved", "paid", "rejected"].includes(status)) {
    return { status: "error", message: "Invalid status." };
  }

  const payload: Record<string, unknown> = {
    status,
    notes,
    updated_at: new Date().toISOString(),
  };
  if (status === "paid") {
    payload.paid_at = new Date().toISOString();
  } else if (status === "queued") {
    payload.paid_at = null;
  }

  const { error } = await supabase.from("payouts").update(payload).eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/accounting");
  return { status: "success", message: "Payout updated." };
};

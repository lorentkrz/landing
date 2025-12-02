"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type ReferralActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const referralActionInitialState: ReferralActionState = { status: "idle" };

const client = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase server client is not configured");
  }
  return supabase;
};

export const updateReferral = async (
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> => {
  const supabase = client();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as "pending" | "joined" | "rewarded" | "revoked";
  const inviterReward = Number(formData.get("reward_inviter_credits") ?? "");
  const inviteeReward = Number(formData.get("reward_invitee_credits") ?? "");

  if (!id) {
    return { status: "error", message: "Missing referral id." };
  }
  if (!["pending", "joined", "rewarded", "revoked"].includes(status)) {
    return { status: "error", message: "Invalid status." };
  }

  const payload: Record<string, unknown> = {
    status,
    reward_inviter_credits: Number.isFinite(inviterReward) ? inviterReward : undefined,
    reward_invitee_credits: Number.isFinite(inviteeReward) ? inviteeReward : undefined,
    updated_at: new Date().toISOString(),
  };

  if (status === "joined") {
    payload.joined_at = new Date().toISOString();
  }
  if (status === "rewarded") {
    payload.rewarded_at = new Date().toISOString();
  }

  const { error } = await supabase.from("referrals").update(payload).eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/referrals");
  return { status: "success", message: "Referral updated." };
};

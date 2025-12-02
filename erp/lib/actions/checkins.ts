"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type CheckInActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const checkInActionInitialState: CheckInActionState = { status: "idle" };

const getClient = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }
  return supabase;
};

export const createCheckIn = async (
  _prevState: CheckInActionState,
  formData: FormData,
): Promise<CheckInActionState> => {
  const supabase = getClient();

  const userId = String(formData.get("user_id") ?? "").trim();
  const venueId = String(formData.get("venue_id") ?? "").trim();
  const ttlMinutes = Number(formData.get("ttl_minutes") ?? "120");
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  if (!userId || !venueId) {
    return { status: "error", message: "User and venue IDs are required." };
  }

  const { error } = await supabase.from("check_ins").insert({
    user_id: userId,
    venue_id: venueId,
    expires_at: expiresAt,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/check-ins");
  return { status: "success", message: "Manual check-in created." };
};

export const deleteCheckIn = async (
  _prevState: CheckInActionState,
  formData: FormData,
): Promise<CheckInActionState> => {
  const supabase = getClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: "error", message: "Check-in ID missing." };
  }

  const { error } = await supabase.from("check_ins").delete().eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/check-ins");
  return { status: "success", message: "Check-in revoked." };
};

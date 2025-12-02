"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type NotificationActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const notificationActionInitialState: NotificationActionState = { status: "idle" };

const getClient = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }
  return supabase;
};

export const createActivity = async (
  _prevState: NotificationActionState,
  formData: FormData,
): Promise<NotificationActionState> => {
  const supabase = getClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const segment = String(formData.get("segment") ?? "general").trim();

  if (!title) {
    return { status: "error", message: "Title is required." };
  }

  const { error } = await supabase.from("user_activity").insert({
    title: `[segment:${segment}] ${title}`,
    description,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/notifications");
  return { status: "success", message: "Campaign logged." };
};

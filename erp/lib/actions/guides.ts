"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type GuideActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const guideActionInitialState: GuideActionState = { status: "idle" };

const client = () => {
  const supabase = getSupabaseServer();
  if (!supabase) throw new Error("Supabase client not configured");
  return supabase;
};

export const upsertGuide = async (_prev: GuideActionState, formData: FormData): Promise<GuideActionState> => {
  const supabase = client();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const mediaUrl = String(formData.get("media_url") ?? "").trim();
  const stepsRaw = String(formData.get("steps") ?? "");

  if (!id || !title) {
    return { status: "error", message: "Title is required." };
  }

  let steps: unknown = [];
  try {
    steps = stepsRaw ? JSON.parse(stepsRaw) : [];
  } catch {
    return { status: "error", message: "Steps must be valid JSON." };
  }

  const { error } = await supabase
    .from("app_guides")
    .update({
      title,
      subtitle: subtitle || null,
      media_url: mediaUrl || null,
      steps,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { status: "error", message: error.message };
  }
  revalidatePath("/guides");
  return { status: "success", message: "Guide updated." };
};

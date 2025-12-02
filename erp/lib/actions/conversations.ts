"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type ConversationActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const conversationActionInitialState: ConversationActionState = { status: "idle" };

const getClient = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }
  return supabase;
};

export const deleteConversation = async (
  _prevState: ConversationActionState,
  formData: FormData,
): Promise<ConversationActionState> => {
  const supabase = getClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: "error", message: "Conversation ID missing." };
  }

  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/conversations");
  return { status: "success", message: "Conversation removed." };
};

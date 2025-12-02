"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type CreditActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const creditActionInitialState: CreditActionState = { status: "idle" };

const getClient = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }
  return supabase;
};

export const createTransaction = async (
  _prevState: CreditActionState,
  formData: FormData,
): Promise<CreditActionState> => {
  const supabase = getClient();

  const userId = String(formData.get("user_id") ?? "").trim();
  const type = String(formData.get("type") ?? "adjustment").trim();
  const amount = Number(formData.get("amount") ?? "0");
  const price = formData.get("price");

  if (!userId || Number.isNaN(amount)) {
    return { status: "error", message: "User ID and valid amount are required." };
  }

  const { error } = await supabase.from("credit_transactions").insert({
    user_id: userId,
    type,
    amount,
    price: price ? Number(price) || null : null,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/credits");
  return { status: "success", message: "Transaction recorded." };
};

export const deleteTransaction = async (
  _prevState: CreditActionState,
  formData: FormData,
): Promise<CreditActionState> => {
  const supabase = getClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: "error", message: "Transaction ID missing." };
  }

  const { error } = await supabase.from("credit_transactions").delete().eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/credits");
  return { status: "success", message: "Transaction removed." };
};

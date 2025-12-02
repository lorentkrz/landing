"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type UserActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export const userActionInitialState: UserActionState = { status: "idle" };

const getClient = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }
  return supabase;
};

export const createProfile = async (
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> => {
  const supabase = getClient();

  const authId = String(formData.get("auth_id") ?? "").trim();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const isPrivate = formData.get("is_private") === "on";

  if (!authId) {
    return { status: "error", message: "Auth user ID is required." };
  }
  if (!firstName || !lastName) {
    return { status: "error", message: "First and last name are required." };
  }

  const { error } = await supabase.from("profiles").insert({
    id: authId,
    first_name: firstName,
    last_name: lastName,
    city,
    country,
    is_private: isPrivate,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/users");
  return { status: "success", message: "Profile created." };
};

export const updateProfile = async (
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> => {
  const supabase = getClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: "error", message: "Profile ID missing." };
  }

  const updates: Record<string, string | boolean | null> = {};
  const mapFields: Record<string, string> = {
    first_name: "first_name",
    last_name: "last_name",
    city: "city",
    country: "country",
    bio: "bio",
  };

  Object.entries(mapFields).forEach(([formField, column]) => {
    const value = formData.get(formField);
    if (value !== null) {
      const trimmed = String(value).trim();
      updates[column] = trimmed.length > 0 ? trimmed : null;
    }
  });

  const isPrivate = formData.get("is_private");
  if (isPrivate !== null) {
    updates.is_private = isPrivate === "on";
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/users");
  return { status: "success", message: "Profile updated." };
};

export const deleteProfile = async (
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> => {
  const supabase = getClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: "error", message: "Profile ID missing." };
  }

  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/users");
  return { status: "success", message: "Profile deleted." };
};

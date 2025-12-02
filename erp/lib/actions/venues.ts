"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabaseServer";

export type VenueActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const initialState: VenueActionState = { status: "idle" };

const getClient = () => {
  const supabase = getSupabaseServer();
  if (!supabase) {
    throw new Error("Supabase service role is not configured.");
  }
  return supabase;
};

export const createVenue = async (
  _prevState: VenueActionState,
  formData: FormData,
): Promise<VenueActionState> => {
  const supabase = getClient();

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "").trim() || null;
  const capacity = Number(formData.get("capacity") ?? "") || null;
  const rating = Number(formData.get("rating") ?? "") || null;

  if (!name) {
    return { status: "error", message: "Name is required." };
  }

  const { error } = await supabase.from("venues").insert({
    name,
    city,
    country,
    type,
    capacity,
    rating,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/venues");
  return { status: "success", message: "Venue created." };
};

export const updateVenue = async (
  _prevState: VenueActionState,
  formData: FormData,
): Promise<VenueActionState> => {
  const supabase = getClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: "error", message: "Venue ID missing." };
  }

  const updates: Record<string, string | number | null> = {};
  const fields: Array<keyof typeof updates> = ["name", "city", "country", "type"];
  fields.forEach((field) => {
    const value = formData.get(field);
    if (value !== null) {
      const trimmed = String(value).trim();
      updates[field] = trimmed.length > 0 ? trimmed : null;
    }
  });

  const capacityValue = formData.get("capacity");
  if (capacityValue !== null) {
    const parsed = Number(capacityValue);
    updates.capacity = Number.isNaN(parsed) ? null : parsed;
  }

  const ratingValue = formData.get("rating");
  if (ratingValue !== null) {
    const parsed = Number(ratingValue);
    updates.rating = Number.isNaN(parsed) ? null : parsed;
  }

  const { error } = await supabase.from("venues").update(updates).eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/venues");
  return { status: "success", message: "Venue updated." };
};

export const deleteVenue = async (
  _prevState: VenueActionState,
  formData: FormData,
): Promise<VenueActionState> => {
  const supabase = getClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { status: "error", message: "Venue ID missing." };
  }

  const { error } = await supabase.from("venues").delete().eq("id", id);
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/venues");
  return { status: "success", message: "Venue deleted." };
};

export const venueActionInitialState = initialState;

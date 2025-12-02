import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseServer } from "./supabaseServer";

type AdminRow = Database["public"]["Tables"]["admins"]["Row"];
type AdminRole = AdminRow["role"];

type AuthenticatedAdmin = {
  admin: {
    id: string;
    email: string;
    role: AdminRole;
    displayName: string;
  } | null;
};

const getCookieBasedClient = async (): Promise<SupabaseClient<Database> | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        } catch (error) {
          console.warn("Skipping cookie writes outside of a route/action.", error);
        }
      },
    },
  });
};

const buildDisplayName = (firstName?: string | null, lastName?: string | null, email?: string | null) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (fullName.length > 0) {
    return fullName;
  }
  if (email) {
    return email.split("@")[0] ?? email;
  }
  return "Admin";
};

export const getAuthenticatedAdmin = async (): Promise<AuthenticatedAdmin> => {
  const cookieClient = await getCookieBasedClient();
  if (!cookieClient) {
    return { admin: null };
  }

  const {
    data: { user },
  } = await cookieClient.auth.getUser();

  if (!user?.email) {
    return { admin: null };
  }

  const serviceClient = getSupabaseServer() ?? cookieClient;
  const normalizedEmail = user.email.toLowerCase();

  const { data: adminRecord } = await serviceClient
    .from("admins")
    .select("id,email,role,is_active,profile_id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (!adminRecord || !adminRecord.is_active) {
    return { admin: null };
  }

  let firstName: string | null | undefined;
  let lastName: string | null | undefined;

  if (adminRecord.profile_id) {
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("first_name,last_name")
      .eq("id", adminRecord.profile_id)
      .maybeSingle();
    firstName = profile?.first_name;
    lastName = profile?.last_name;
  }

  return {
    admin: {
      id: adminRecord.id,
      email: adminRecord.email,
      role: adminRecord.role,
      displayName: buildDisplayName(firstName, lastName, adminRecord.email),
    },
  };
};

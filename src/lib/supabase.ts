import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

const extras = (Constants.expoConfig?.extra ?? {}) as { supabaseUrl?: string; supabaseAnonKey?: string };
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extras.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extras.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (also ensure they are in app.config.js extra).");
  throw new Error("Missing Supabase credentials");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
    persistSession: true,
    storage: AsyncStorage,
    autoRefreshToken: true,
  },
});

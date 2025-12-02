import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { supabase } from "../lib/supabase";
import { profileRowToUser } from "../utils/profile";
import { AUTH_USER_KEY } from "../constants/storageKeys";
import { getItem as storageGetItem, removeItem as storageRemoveItem, setItem as storageSetItem } from "../utils/storage";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<{ needsVerification: boolean; email: string }>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  pendingRegistrationEmail: string | null;
};

type RegisterPayload = Partial<User> & {
  password: string;
  referralCode?: string;
};

type PendingRegistration = {
  email: string;
  firstName: string;
  lastName: string;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  avatar?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  referralCode?: string;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);

  const persistUser = async (value: User | null) => {
    if (value) {
      await storageSetItem(AUTH_USER_KEY, value);
    } else {
      await storageRemoveItem(AUTH_USER_KEY);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      let cachedUser: User | null = null;
      try {
        cachedUser = await storageGetItem<User>(AUTH_USER_KEY);
        if (cachedUser) {
          setUser(cachedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.warn("Failed to hydrate cached user", error);
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await loadProfile(data.session.user.id, data.session.user.email ?? undefined);
      } else {
        if (!cachedUser) {
          setIsLoading(false);
        } else {
          await persistUser(null);
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? undefined);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        persistUser(null);
      }
    });

    bootstrap();
    return () => listener.subscription.unsubscribe();
  }, []);

  const ensureProfile = async (id: string, email?: string) => {
    // Try to fetch profile; if missing, create a minimal row.
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (data) return data;

    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id,
        first_name: "",
        last_name: "",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop",
        email: email ?? null,
        last_active_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return inserted;
  };

  const upsertProfile = async (id: string, payload?: PendingRegistration, email?: string) => {
    const { error } = await supabase.from("profiles").upsert({
      id,
      first_name: payload?.firstName ?? "",
      last_name: payload?.lastName ?? "",
      city: payload?.city ?? null,
      country: payload?.country ?? null,
      bio: payload?.bio ?? null,
      avatar_url:
        payload?.avatar ??
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop",
      gender: payload?.gender ?? null,
      birthdate: payload?.birthdate ?? null,
      email: email ?? payload?.email ?? null,
      last_active_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    const referralCode = payload?.referralCode?.trim();
    if (referralCode) {
      try {
        await supabase.rpc("complete_referral", {
          p_code: referralCode.toUpperCase(),
          p_invitee: id,
        });
      } catch (referralError) {
        console.warn("Referral redemption failed", referralError);
      }
    }
  };

  const loadProfile = async (id: string, email?: string) => {
    try {
      const profileRow = await ensureProfile(id, email);
      const mapped = profileRowToUser(profileRow);
      setUser({ ...mapped, email: email ?? mapped.email });
      setIsAuthenticated(true);
      await persistUser({ ...mapped, email: email ?? mapped.email });
      const { error: lastActiveError } = await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", id);
      if (lastActiveError) {
        console.warn("Failed to update last active timestamp", lastActiveError);
      }
    } catch (err) {
      console.error("Profile fetch failed", err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setIsLoading(false);
      throw new Error(error?.message ?? "Login failed");
    }
    await loadProfile(data.user.id, data.user.email ?? email);
  };

  const register = async (userData: RegisterPayload) => {
    setIsLoading(true);
    const email = userData.email?.trim() ?? "";
    const { data, error } = await supabase.auth.signUp({
      email,
      password: userData.password,
    });

    if (error || !data.user) {
      setIsLoading(false);
      throw new Error(error?.message ?? "Registration failed");
    }

    const pending: PendingRegistration = {
      email,
      firstName: userData.firstName ?? "",
      lastName: userData.lastName ?? "",
      city: userData.city ?? null,
      country: userData.country ?? null,
      bio: userData.bio ?? null,
      avatar: userData.avatar ?? undefined,
      gender: userData.gender ?? null,
      birthdate: userData.birthdate ?? null,
      referralCode: userData.referralCode?.trim() || undefined,
    };
    setPendingRegistration(pending);

    const needsVerification = !data.session;
    if (!needsVerification && data.session?.user) {
      await upsertProfile(data.session.user.id, pending, email);
      setPendingRegistration(null);
      await loadProfile(data.session.user.id, email);
    } else {
      setIsLoading(false);
    }

    return { needsVerification, email };
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoading(false);
      throw new Error(error.message);
    }
    await persistUser(null);
    setPendingRegistration(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const verifyEmailCode = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });
      if (error) {
        throw new Error(error.message);
      }
      const verifiedUser = data?.session?.user ?? data?.user;
      if (!verifiedUser) {
        throw new Error("Verification failed. Please try again.");
      }
      const payload = pendingRegistration ?? {
        email,
        firstName: "",
        lastName: "",
      };
      await upsertProfile(verifiedUser.id, payload, email);
      setPendingRegistration(null);
      await loadProfile(verifiedUser.id, email);
    } catch (err) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : "Verification failed";
      throw new Error(message);
    }
  };

  const resendVerificationCode = async (email: string) => {
    try {
      await supabase.auth.resend({
        type: "signup",
        email,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to resend code";
      throw new Error(message);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    setIsLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: userData.firstName ?? user.firstName,
        last_name: userData.lastName ?? user.lastName,
        city: userData.city ?? user.city,
        country: userData.country ?? user.country,
        bio: userData.bio ?? user.bio,
        avatar_url: userData.avatar ?? user.avatar,
        gender: userData.gender ?? user.gender,
        birthdate: userData.birthdate ?? user.birthdate,
      })
      .eq("id", user.id);
    if (error) {
      setIsLoading(false);
      throw new Error("Failed to update profile");
    }
    await loadProfile(user.id, user.email);
  };

  const updatePassword = async (_currentPassword: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyEmailCode,
        resendVerificationCode,
        logout,
        updateUser,
        updatePassword,
        pendingRegistrationEmail: pendingRegistration?.email ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

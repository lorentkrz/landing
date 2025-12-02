"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import type { Referral } from "../types";

type ReferralContextType = {
  referrals: Referral[];
  isLoading: boolean;
  createInvite: (inviteeContact?: string | null) => Promise<Referral | null>;
  refresh: () => Promise<void>;
  shareBaseUrl: string;
  inviterReward: number;
  inviteeReward: number;
};

const REFERRAL_INVITER_REWARD = 100;
const REFERRAL_INVITEE_REWARD = 50;
const SHARE_BASE_URL = "https://nata.app/invite";

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

const mapRowToReferral = (row: any): Referral => ({
  id: row.id,
  code: row.referral_code,
  status: row.status,
  inviteeContact: row.invitee_contact ?? undefined,
  inviteeId: row.invitee_id ?? undefined,
  rewardInviterCredits: row.reward_inviter_credits ?? 0,
  rewardInviteeCredits: row.reward_invitee_credits ?? 0,
  createdAt: row.created_at,
  joinedAt: row.joined_at ?? undefined,
  rewardedAt: row.rewarded_at ?? undefined,
});

export const ReferralProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      refresh();
    } else {
      setReferrals([]);
    }
  }, [user?.id]);

  const refresh = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("inviter_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load referrals", error);
      setIsLoading(false);
      return;
    }
    setReferrals(data?.map(mapRowToReferral) ?? []);
    setIsLoading(false);
  };

  const generateCode = () => `NATA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const createInvite = async (inviteeContact?: string | null) => {
    if (!user?.id) {
      Alert.alert("Login required", "Sign in to invite friends.");
      return null;
    }
    // Reuse an existing code instead of generating many per user
    const existing = referrals.find((r) => r.status === "pending" || r.status === "joined" || r.status === "rewarded");
    if (existing) {
      Alert.alert("Invite ready", `Share your code ${existing.code} to invite friends.`);
      return existing;
    }
    const { data: existingRow } = await supabase
      .from("referrals")
      .select("*")
      .eq("inviter_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingRow) {
      const mappedExisting = mapRowToReferral(existingRow);
      setReferrals((prev) => (prev.find((r) => r.id === mappedExisting.id) ? prev : [mappedExisting, ...prev]));
      Alert.alert("Invite ready", `Share your code ${mappedExisting.code} to invite friends.`);
      return mappedExisting;
    }
    const referralCode = generateCode();
    const { data, error } = await supabase
      .from("referrals")
      .insert({
        inviter_id: user.id,
        invitee_contact: inviteeContact ?? null,
        referral_code: referralCode,
        reward_inviter_credits: REFERRAL_INVITER_REWARD,
        reward_invitee_credits: REFERRAL_INVITEE_REWARD,
      })
      .select()
      .single();
    if (error) {
      console.error("Failed to create referral", error);
      Alert.alert("Invite failed", error.message);
      return null;
    }
    const mapped = mapRowToReferral(data);
    setReferrals((prev) => [mapped, ...prev]);
    return mapped;
  };

  const value = useMemo(
    () => ({
      referrals,
      isLoading,
      createInvite,
      refresh,
      shareBaseUrl: SHARE_BASE_URL,
      inviterReward: REFERRAL_INVITER_REWARD,
      inviteeReward: REFERRAL_INVITEE_REWARD,
    }),
    [referrals, isLoading],
  );

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>;
};

export const useReferrals = () => {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error("useReferrals must be used within a ReferralProvider");
  }
  return context;
};

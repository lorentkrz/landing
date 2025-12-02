import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CreditTransaction } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type CreditsContextType = {
  credits: number;
  transactions: CreditTransaction[];
  isLoading: boolean;
  addCredits: (amount: number, price?: number, description?: string) => Promise<void>;
  spendCredits: (amount: number, description?: string) => Promise<boolean>;
};

interface CreditsProviderProps {
  children: ReactNode;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider = ({ children }: CreditsProviderProps) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const credits = useMemo(
    () => transactions.reduce((sum, tx) => sum + tx.amount, 0),
    [transactions],
  );

  useEffect(() => {
    if (user?.id) {
      loadTransactions(user.id);
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadTransactions = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const mapped =
        data?.map((tx) => ({
          id: tx.id,
          userId: tx.user_id,
          amount: tx.amount,
          price: Number(tx.price ?? 0),
          description: tx.description ?? undefined,
          type: tx.type,
          date: tx.created_at,
        })) ?? [];
      setTransactions(mapped);
    } catch (error) {
      console.error("Failed to load credit history:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = async (amount: number, price = 0, description = "Credit purchase") => {
    if (!user?.id) {
      throw new Error("You must be logged in.");
    }
    const { error } = await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount,
      price,
      description,
      type: "purchase",
    });
    if (error) {
      console.error("Failed to add credits:", error);
      throw new Error("Failed to add credits. Please try again.");
    }
    await loadTransactions(user.id);
  };

  const spendCredits = async (amount: number, description = "Chat extension") => {
    if (!user?.id) {
      return false;
    }
    if (credits < amount) {
      return false;
    }
    const { error } = await supabase.from("credit_transactions").insert({
      user_id: user.id,
      amount: -amount,
      price: 0,
      description,
      type: "debit",
    });
    if (error) {
      console.error("Failed to spend credits:", error);
      throw new Error("Failed to spend credits. Please try again.");
    }
    await loadTransactions(user.id);
    return true;
  };

  return (
    <CreditsContext.Provider
      value={{
        credits,
        transactions,
        isLoading,
        addCredits,
        spendCredits,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
};

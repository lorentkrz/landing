"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useCredits } from "../context/CreditsContext";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { supabase } from "../lib/supabase";
import { track } from "../utils/analytics";
import { useReferrals } from "../context/ReferralContext";
import { delay } from "../utils/delay";

type CreditPackage = {
  id: string;
  title: string;
  amount: number;
  price: number;
  popular?: boolean;
};

const DEFAULT_PACKAGES: CreditPackage[] = [
  { id: "starter", title: "Starter", amount: 50, price: 4.99 },
  { id: "night", title: "Night Out", amount: 120, price: 9.99, popular: true },
  { id: "vip", title: "VIP Boost", amount: 260, price: 19.99 },
  { id: "elite", title: "Elite", amount: 600, price: 39.99 },
];

const CreditsScreen = () => {
  const navigation = useAppNavigation();
  const { credits, addCredits, transactions, isLoading } = useCredits();
  const { createInvite, inviterReward, inviteeReward } = useReferrals();
  const [packages, setPackages] = useState<CreditPackage[]>(DEFAULT_PACKAGES);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const selectedPack = useMemo(() => packages.find((pkg) => pkg.id === selectedPackage), [packages, selectedPackage]);
  const fetchPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const { data, error } = await supabase
        .from("credit_packages")
        .select("id, name, credits, price, most_popular")
        .order("price", { ascending: true });
      if (error || !data?.length) {
        if (error) console.warn("Failed to load credit packages", error);
        setPackages(DEFAULT_PACKAGES);
        return;
      }
      const normalized: CreditPackage[] = data.map((row) => ({
        id: String(row.id),
        title: row.name ?? `Pack ${row.id}`,
        amount: row.credits ?? 0,
        price: Number(row.price ?? 0),
        popular: row.most_popular ?? false,
      }));
      setPackages(normalized);
    } catch (error) {
      console.warn("Failed to load credit packages", error);
      setPackages(DEFAULT_PACKAGES);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const processPayment = async (pack: CreditPackage) => {
    // Placeholder payment handler; swap with Stripe/Apple/Google Pay SDKs.
    await delay(400);
    track("credit_purchase", { stage: "payment_intent_mock", packageId: pack.id, price: pack.price });
    return true;
  };

  const handlePurchase = async () => {
    if (!selectedPack) {
      Alert.alert("Select a package", "Choose a credit pack before purchasing.");
      return;
    }
    try {
      setIsPurchasing(true);
      const paid = await processPayment(selectedPack);
      if (!paid) {
        throw new Error("Payment was not completed.");
      }
      await addCredits(selectedPack.amount, selectedPack.price);
      track("credit_purchase", { stage: "complete", packageId: selectedPack.id, amount: selectedPack.amount, price: selectedPack.price });
      Alert.alert("Success", `${selectedPack.amount} credits added to your account.`);
      setSelectedPackage(null);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Payment failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Credits</Text>
          <View style={{ width: 40 }} />
        </View>

        <LinearGradient colors={["#1c1f3f", "#0a0c18"]} style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Available credits</Text>
            <Text style={styles.balanceValue}>{credits}</Text>
            <Text style={styles.balanceSubtitle}>Use credits to chat longer, boost, and unlock rooms.</Text>
          </View>
          <View style={styles.balanceIcon}>
            <Ionicons name="flash" size={28} color="#fff" />
          </View>
        </LinearGradient>

        <View style={styles.paymentNote}>
          <Ionicons name="card" size={16} color="#8f96bb" />
          <Text style={styles.paymentNoteText}>Default payment: Visa ending 3498 (Apple/Google Pay coming soon)</Text>
        </View>

        <TouchableOpacity
          style={styles.inviteCard}
          activeOpacity={0.85}
          onPress={async () => {
            const invite = await createInvite();
            if (invite) {
              track("navigation", { screen: "Credits", action: "invite_created", code: invite.code });
            }
          }}
        >
          <View style={styles.inviteLeft}>
            <Text style={styles.inviteTitle}>Earn free credits</Text>
            <Text style={styles.inviteSubtitle}>
              +{inviterReward} for you • +{inviteeReward} for friends
            </Text>
          </View>
          <View style={styles.inviteBadge}>
            <Ionicons name="gift" size={18} color="#0a0e17" />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Buy credits</Text>
            <Text style={styles.sectionSubtitle}>Select a pack, pay once, use anywhere.</Text>
          </View>
          {loadingPackages ? (
            <View style={styles.packageList}>
              {DEFAULT_PACKAGES.map((item) => (
                <View key={item.id} style={[styles.packageRow, styles.packageRowSkeleton]} />
              ))}
            </View>
          ) : (
            <View style={styles.packageList}>
              {packages.map((item) => {
                const selected = selectedPackage === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.packageRow, selected && styles.packageRowActive]}
                    onPress={() => setSelectedPackage(item.id)}
                    activeOpacity={0.85}
                  >
                    <View>
                      {item.popular ? <Text style={styles.popularBadge}>Most popular</Text> : null}
                      <Text style={styles.packageTitle}>{item.title}</Text>
                      <Text style={styles.packageAmount}>{item.amount} credits</Text>
                    </View>
                    <View style={styles.packagePriceRow}>
                      <Text style={styles.packagePrice}>${item.price.toFixed(2)}</Text>
                      <Ionicons
                        name={selected ? "radio-button-on" : "radio-button-off"}
                        size={18}
                        color={selected ? "#4dabf7" : "#7f88b8"}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          <Button title={isPurchasing ? "Processing..." : "Purchase credits"} onPress={handlePurchase} loading={isPurchasing} style={styles.purchaseButton} fullWidth />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent activity</Text>
            <Text style={styles.sectionSubtitle}>Transactions sync with Supabase when connected.</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#4dabf7" style={{ marginTop: 12 }} />
          ) : transactions.length === 0 ? (
            <Text style={styles.emptyHistory}>No transactions yet.</Text>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.transactionRow}>
                <View style={[styles.transactionIcon, tx.type === "purchase" ? styles.transactionCredit : styles.transactionDebit]}>
                  <Ionicons name={tx.type === "purchase" ? "flash" : "chatbubble"} size={16} color="#fff" />
                </View>
                <View style={styles.transactionText}>
                  <Text style={styles.transactionLabel}>{tx.description ?? tx.type}</Text>
                  <Text style={styles.transactionDate}>{new Date(tx.date).toLocaleDateString()}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[styles.transactionValue, tx.type === "purchase" ? styles.amountCredit : styles.amountDebit]}>
                    {tx.type === "purchase" ? "+" : "-"}
                    {tx.amount}
                  </Text>
                  {tx.type === "purchase" ? <Text style={styles.transactionPrice}>${tx.price.toFixed(2)}</Text> : null}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#03050f",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#151936",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    gap: 18,
  },
  balanceLabel: {
    color: "#8f96bb",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
    marginTop: 6,
  },
  balanceSubtitle: {
    color: "#c6cbe3",
    marginTop: 6,
  },
  balanceIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
  },
  paymentNoteText: {
    color: "#8f96bb",
  },
  inviteCard: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(92,225,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(92,225,255,0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inviteLeft: {
    gap: 4,
  },
  inviteTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  inviteSubtitle: {
    color: "#b7c0e6",
    fontSize: 12,
  },
  inviteBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5ce1ff",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: "#8f96bb",
    marginTop: 4,
  },
  packageList: {
    gap: 12,
  },
  packageRow: {
    borderRadius: 16,
    backgroundColor: "#0f1425",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  packageRowActive: {
    borderColor: "#4dabf7",
    backgroundColor: "rgba(77,171,247,0.08)",
  },
  packageRowSkeleton: {
    opacity: 0.4,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.15)",
  },
  packageTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  packageAmount: {
    color: "#c6cbe3",
  },
  popularBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,212,121,0.16)",
    color: "#ffd479",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "700",
    fontSize: 11,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  packagePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  packagePrice: {
    color: "#fff",
    fontWeight: "700",
  },
  purchaseButton: {
    marginTop: 16,
  },
  emptyHistory: {
    color: "#8f96bb",
    marginTop: 8,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
    gap: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionCredit: {
    backgroundColor: "rgba(77,171,247,0.2)",
  },
  transactionDebit: {
    backgroundColor: "rgba(255,118,173,0.2)",
  },
  transactionText: {
    flex: 1,
  },
  transactionLabel: {
    color: "#fff",
    fontWeight: "600",
  },
  transactionDate: {
    color: "#8f96bb",
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionValue: {
    fontWeight: "700",
  },
  amountCredit: {
    color: "#4dabf7",
  },
  amountDebit: {
    color: "#ff7676",
  },
  transactionPrice: {
    color: "#8f96bb",
    fontSize: 12,
  },
});

export default CreditsScreen;


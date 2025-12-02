"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useVenues } from "../context/VenueContext";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { useAuth } from "../context/AuthContext";
import { useCredits } from "../context/CreditsContext";
import type { User, Venue } from "../types";
import UserCard from "../components/UserCard";
import { ensureConversation } from "../utils/conversations";
import { supabase } from "../lib/supabase";

const VenueRoomScreen = () => {
  const route = useRoute();
  const navigation = useAppNavigation();
  const { venueId } = (route.params as { venueId?: string }) ?? {};

  const { getVenueById, fetchActiveUsersForVenue, activeCheckIn } = useVenues();
  const { spendCredits } = useCredits();
  const { user } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactUserIds, setContactUserIds] = useState<Set<string>>(() => new Set());
  const [unlockedUserIds, setUnlockedUserIds] = useState<Set<string>>(() => new Set());
  const [requestedUserIds, setRequestedUserIds] = useState<Set<string>>(() => new Set());
  const [requestingUserId, setRequestingUserId] = useState<string | null>(null);
  const [unlockingUserId, setUnlockingUserId] = useState<string | null>(null);

  const UNLOCK_COST = 50;

  const loadData = async () => {
    if (!venueId) return;
    setIsLoading(true);
    const venueDetails = getVenueById(venueId);
    const users = await fetchActiveUsersForVenue(venueId);
    setVenue(venueDetails ?? null);
    setActiveUsers(users);
    setIsLoading(false);
  };

  const loadContactIds = async () => {
    if (!user?.id) {
      setContactUserIds(new Set());
      return;
    }
    try {
      const { data, error } = await supabase.from("contact_book").select("contact_id").eq("owner_id", user.id);
      if (error) throw error;
      setContactUserIds(new Set((data ?? []).map((row) => row.contact_id)));
    } catch (error) {
      console.warn("Failed to load contact book", error);
      setContactUserIds(new Set());
    }
  };

  useEffect(() => {
    loadData();
    loadContactIds();
  }, [venueId, getVenueById, fetchActiveUsersForVenue, activeCheckIn?.venueId]);

  const visibleUsers = useMemo(
    () => (user?.id ? activeUsers.filter((profile) => profile.id !== user.id) : activeUsers),
    [activeUsers, user?.id],
  );

  const handleUserPress = async (target: User) => {
    if (!user?.id) {
      Alert.alert("Login required", "Log in to start a chat.");
      return;
    }
    if (!isProfileUnlocked(target.id)) {
      Alert.alert("Profile locked", "Request contact or unlock this profile before starting a conversation.");
      return;
    }
    if (activeCheckIn?.venueId !== venueId) {
      Alert.alert("Check-in required", "Check in to this venue before chatting with people in the room.");
      return;
    }
    const conversationId = await ensureConversation(user.id, target.id);
    navigation.navigate("Chat", {
      conversationId,
      userId: target.id,
      userName: `${target.firstName} ${target.lastName}`,
      userAvatar: target.avatar,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContactIds();
    await loadData();
    setRefreshing(false);
  };

  const handleRequestContact = async (target: User) => {
    if (!user?.id) {
      Alert.alert("Login required", "Log in to request contact details.");
      return;
    }
    if (activeCheckIn?.venueId !== venueId) {
      Alert.alert("Check-in required", "Check in at this venue to request contacts.");
      return;
    }
    if (requestedUserIds.has(target.id)) {
      Alert.alert("Request already sent", "Wait for the guest to respond to your previous request.");
      return;
    }
    setRequestingUserId(target.id);
    try {
      await supabase.from("connection_requests").insert({
        sender_id: user.id,
        receiver_id: target.id,
        message: `Let's connect at ${venue?.name ?? "this venue"}.`,
        status: "pending",
      });
      setRequestedUserIds((prev) => {
        const next = new Set(prev);
        next.add(target.id);
        return next;
      });
      Alert.alert("Request sent", "We'll notify you when the guest responds.");
    } catch (error) {
      console.error("Failed to send contact request", error);
      Alert.alert("Could not send request", "Please try again.");
    } finally {
      setRequestingUserId(null);
    }
  };

  const handleUnlockProfile = async (target: User) => {
    if (!user?.id) {
      Alert.alert("Login required", "Log in to unlock profiles.");
      return;
    }
    if (activeCheckIn?.venueId !== venueId) {
      Alert.alert("Check-in required", "You need to check in before unlocking profiles.");
      return;
    }
    setUnlockingUserId(target.id);
    try {
      const success = await spendCredits(UNLOCK_COST, `Unlock profile: ${target.firstName}`);
      if (!success) {
        Alert.alert("Not enough credits", "Add more credits to unlock this profile.");
        return;
      }
      setUnlockedUserIds((prev) => {
        const next = new Set(prev);
        next.add(target.id);
        return next;
      });
      Alert.alert("Profile unlocked", `You can now view ${target.firstName}'s full profile.`);
    } catch (error) {
      console.error("Failed to unlock profile", error);
      Alert.alert("Unlock failed", "We couldn't unlock this profile right now.");
    } finally {
      setUnlockingUserId(null);
    }
  };

  const isProfileUnlocked = (id: string) => contactUserIds.has(id) || unlockedUserIds.has(id);

  if (!venueId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Missing venue ID.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Loading room…</Text>
      </View>
    );
  }

  const timeRemaining = activeCheckIn?.expiresAt
    ? Math.max(Math.floor((new Date(activeCheckIn.expiresAt).getTime() - Date.now()) / (60 * 1000)), 0)
    : null;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={visibleUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          isProfileUnlocked(item.id) ? (
            <UserCard user={item} onPress={handleUserPress} />
          ) : (
            <View style={styles.lockedCard}>
              <View style={styles.lockedInfoRow}>
                <View style={styles.lockedAvatarWrapper}>
                  <Image source={{ uri: item.avatar }} style={styles.lockedAvatar} />
                  <View style={styles.lockedStatus}>
                    <Ionicons name="shield-checkmark" size={12} color="#fff" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lockedName}>{item.firstName}</Text>
                  <Text style={styles.lockedMeta}>Credentials verified · Contact hidden</Text>
                  <View style={styles.lockedBadgeRow}>
                    <View style={styles.lockedBadge}>
                      <Ionicons name="id-card" size={12} color="#8bd1ff" />
                      <Text style={styles.lockedBadgeText}>Guest</Text>
                    </View>
                    <View style={styles.lockedBadge}>
                      <Ionicons name="lock-closed" size={12} color="#ffd479" />
                      <Text style={styles.lockedBadgeText}>Private</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="lock-closed" size={20} color="#7a81a8" />
              </View>
              <View style={styles.lockedActions}>
                <TouchableOpacity
                  style={[
                    styles.lockedButton,
                    styles.lockedSecondaryButton,
                    requestedUserIds.has(item.id) && styles.lockedButtonDisabled,
                  ]}
                  onPress={() => handleRequestContact(item)}
                  disabled={requestingUserId === item.id || requestedUserIds.has(item.id)}
                >
                  <Text style={styles.lockedButtonText}>
                    {requestingUserId === item.id
                      ? "Sending..."
                      : requestedUserIds.has(item.id)
                      ? "Requested"
                      : "Request contact"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.lockedButton}
                  onPress={() => handleUnlockProfile(item)}
                  disabled={unlockingUserId === item.id}
                >
                  <Text style={styles.lockedButtonText}>
                    {unlockingUserId === item.id ? "Unlocking..." : `Unlock · ${UNLOCK_COST} credits`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Live room</Text>
              <View style={{ width: 40 }} />
            </View>

            <LinearGradient colors={["#1d203f", "#090b17"]} style={styles.heroCard}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroVenue}>{venue?.name ?? "Venue room"}</Text>
                <Text style={styles.heroSubtitle}>{venue?.description ?? "Exclusive guest list for this venue."}</Text>
                <View style={styles.heroStats}>
                  <View>
                    <Text style={styles.heroStatValue}>{visibleUsers.length}</Text>
                    <Text style={styles.heroStatLabel}>Guests visible</Text>
                  </View>
                  <View>
                    <Text style={styles.heroStatValue}>{timeRemaining ? `${timeRemaining}m` : "--"}</Text>
                    <Text style={styles.heroStatLabel}>Time left</Text>
                  </View>
                  <View>
                    <Text style={styles.heroStatValue}>{venue?.activeUsers ?? "--"}</Text>
                    <Text style={styles.heroStatLabel}>In venue</Text>
                  </View>
                </View>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="lock-open" size={22} color="#fff" />
                <Text style={styles.heroBadgeText}>Unlocked</Text>
              </View>
            </LinearGradient>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No one is visible yet. Be the first to start a chat.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#03050f",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#03050f",
  },
  loadingText: {
    color: "#9aa3c3",
    marginTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
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
    fontSize: 18,
    fontWeight: "700",
  },
  lockedCard: {
    backgroundColor: "#0e1328",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  lockedInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lockedAvatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  lockedAvatar: {
    width: "100%",
    height: "100%",
  },
  lockedStatus: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(77,171,247,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  lockedMeta: {
    color: "#9ca3c9",
    fontSize: 12,
    marginTop: 2,
  },
  lockedBadgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  lockedBadgeText: {
    color: "#d8dcff",
    fontSize: 11,
  },
  lockedActions: {
    flexDirection: "row",
    gap: 10,
  },
  lockedButton: {
    flex: 1,
    backgroundColor: "#4dabf7",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  lockedSecondaryButton: {
    backgroundColor: "rgba(77,171,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(77,171,247,0.35)",
  },
  lockedButtonDisabled: {
    opacity: 0.6,
  },
  lockedButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  heroCard: {
    borderRadius: 26,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  heroVenue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#c6cbe3",
  },
  heroStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  heroStatValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  heroStatLabel: {
    color: "#8f96bb",
    fontSize: 12,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  heroBadgeText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: "#8e95bd",
    textAlign: "center",
    marginTop: 40,
  },
});

export default VenueRoomScreen;

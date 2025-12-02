"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import ConversationItem from "../components/ConversationItem";
import Button from "../components/Button";
import type { Conversation } from "../types";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { useAuth } from "../context/AuthContext";
import { useVenues } from "../context/VenueContext";
import { supabase } from "../lib/supabase";
import { profileRowToUser } from "../utils/profile";

const TABS = [
  { id: "all", label: "All" },
  { id: "online", label: "Online" },
  { id: "active", label: "Active tonight" },
] as const;

const MessagesScreen = () => {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const { activeCheckIn, getVenueById } = useVenues();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const convos = await fetchConversationsFromSupabase(user.id);
      setConversations(convos);
    } catch (error) {
      console.error("Failed to load conversations", error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadPendingRequests = useCallback(async () => {
    if (!user?.id) {
      setPendingRequests(0);
      return;
    }
    try {
      const { count, error } = await supabase
        .from("connection_requests")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("status", "pending");
      if (error) throw error;
      setPendingRequests(count ?? 0);
    } catch (error) {
      console.warn("Failed to load pending requests", error);
      setPendingRequests(0);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
      loadPendingRequests();
    }, [loadConversations, loadPendingRequests]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadConversations(), loadPendingRequests()]);
    setRefreshing(false);
  }, [loadConversations, loadPendingRequests]);

  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];
    if (activeTab === "online") {
      filtered = filtered.filter((conversation) => conversation.user.isOnline);
    } else if (activeTab === "active") {
      filtered = filtered.filter((conversation) => conversation.isActive);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conversation) =>
          conversation.user.firstName.toLowerCase().includes(query) ||
          conversation.user.lastName.toLowerCase().includes(query) ||
          conversation.lastMessage.toLowerCase().includes(query),
      );
    }
    return filtered;
  }, [conversations, activeTab, searchQuery]);

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubble-ellipses-outline" size={38} color="#7f88b8" />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>Scan a venue or reach out from Contacts to start talking.</Text>
      <Button title="Browse contacts" onPress={() => navigation.navigate("Contacts")} size="small" style={styles.emptyButton} />
    </View>
  );

  const activeVenue = useMemo(
    () => (activeCheckIn?.venueId ? getVenueById(activeCheckIn.venueId) : null),
    [activeCheckIn?.venueId, getVenueById],
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#4dabf7" />
          <Text style={styles.loaderText}>Loading your chats…</Text>
        </View>
      );
    }

    if (filteredConversations.length === 0) {
      return <EmptyState />;
    }

    return filteredConversations.map((conversation) => (
      <ConversationItem key={conversation.id} conversation={conversation} onPress={(item) => handleConversationPress(item)} />
    ));
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate("Chat", {
      conversationId: conversation.id,
      userId: conversation.user.id,
      userName: `${conversation.user.firstName} ${conversation.user.lastName}`,
      userAvatar: conversation.user.avatar,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Inbox</Text>
            <Text style={styles.headerSubtitle}>Keep connections alive while the vibe lasts.</Text>
          </View>
          <TouchableOpacity style={styles.composeButton} onPress={() => navigation.navigate("NewMessage")}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {activeVenue ? (
          <LinearGradient colors={["#1d2446", "#0b0f1f"]} style={styles.activeVenueCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeVenueLabel}>Checked in</Text>
              <Text style={styles.activeVenueName}>{activeVenue.name}</Text>
              <Text style={styles.activeVenueMeta}>
                {activeVenue.city}, {activeVenue.country}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.activeVenueButton}
              onPress={() => navigation.navigate("VenueRoom", { venueId: activeVenue.id })}
            >
              <Ionicons name="people" size={16} color="#0b1124" />
              <Text style={styles.activeVenueButtonText}>Open room</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : null}

        <TouchableOpacity style={styles.requestsCard} onPress={() => navigation.navigate("Requests")}>
          <View style={styles.requestsIcon}>
            <Ionicons name="hand-right" size={16} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.requestsTitle}>Pending requests</Text>
            <Text style={styles.requestsSubtitle}>
              {pendingRequests > 0 ? `${pendingRequests} waiting for approval` : "Manage who can reach you"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#7c84ac" />
        </TouchableOpacity>

        <LinearGradient colors={["#1c1f3f", "#0b0d1b"]} style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>Tonight's queue</Text>
            <Text style={styles.heroTitle}>Time-limited chats keep the energy high.</Text>
            <Text style={styles.heroSubtitle}>Use credits to extend the convo when the vibe is right.</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeValue}>{conversations.filter((c) => c.unread > 0).length}</Text>
            <Text style={styles.heroBadgeLabel}>unread</Text>
          </View>
        </LinearGradient>

        <View style={styles.searchCard}>
          <Ionicons name="search" size={18} color="#8e95bd" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search names or messages"
            placeholderTextColor="#8e95bd"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#8e95bd" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
            >
              <Text style={[styles.tabChipText, activeTab === tab.id && styles.tabChipTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate("Contacts")}>
            <Ionicons name="people-outline" size={20} color="#fff" />
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Contacts</Text>
              <Text style={styles.actionSubtitle}>Your saved connections</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>{renderContent()}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#03050f",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#8f96bb",
    marginTop: 4,
  },
  composeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4dabf7",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 20,
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
  heroKicker: {
    color: "#8f96bb",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#c6cbe3",
    fontSize: 13,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadgeValue: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  heroBadgeLabel: {
    color: "#8f96bb",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0c1020",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
  },
  tabsRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  tabChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabChipActive: {
    backgroundColor: "#4dabf7",
    borderColor: "#4dabf7",
  },
  tabChipText: {
    color: "#8f96bb",
    fontWeight: "600",
  },
  tabChipTextActive: {
    color: "#fff",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 18,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#0f1425",
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  actionTextWrapper: {
    flex: 1,
  },
  actionTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  actionSubtitle: {
    color: "#8f96bb",
    fontSize: 12,
  },
  activeVenueCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  activeVenueLabel: {
    color: "#8fb0ff",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  activeVenueName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  activeVenueMeta: {
    color: "#a3a9d5",
    marginTop: 2,
  },
  activeVenueButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#4dabf7",
  },
  activeVenueButtonText: {
    color: "#0b1124",
    fontWeight: "700",
  },
  requestsCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#0f1428",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  requestsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  requestsTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  requestsSubtitle: {
    color: "#8f96bb",
    fontSize: 12,
    marginTop: 2,
  },
  listSection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  loader: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  loaderText: {
    color: "#8f96bb",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#8f96bb",
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 6,
  },
});

export default MessagesScreen;

async function fetchConversationsFromSupabase(userId: string) {
  const { data: membershipRows, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", userId);

  if (error) {
    throw error;
  }

  const conversationIds = membershipRows?.map((row) => row.conversation_id) ?? [];
  if (conversationIds.length === 0) {
    return [];
  }

  const { data: participantRows, error: participantsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, profile_id, profile:profiles!conversation_participants_profile_id_fkey(*)")
    .in("conversation_id", conversationIds)
    .neq("profile_id", userId);

  if (participantsError) {
    throw participantsError;
  }

  const { data: messageRows, error: messagesError } = await supabase
    .from("messages")
    .select("conversation_id, body, sent_at, is_read, receiver_id")
    .in("conversation_id", conversationIds)
    .order("sent_at", { ascending: false });

  if (messagesError) {
    throw messagesError;
  }

  const summaryMap = new Map<
    string,
    {
      lastMessage: string;
      lastTimestamp: string | null;
      unread: number;
    }
  >();

  conversationIds.forEach((id) => {
    summaryMap.set(id, {
      lastMessage: "Say hello!",
      lastTimestamp: null,
      unread: 0,
    });
  });

  messageRows?.forEach((msg) => {
    const summary = summaryMap.get(msg.conversation_id);
    if (summary && !summary.lastTimestamp) {
      summary.lastMessage = msg.body;
      summary.lastTimestamp = msg.sent_at;
    }
    if (!msg.is_read && msg.receiver_id === userId) {
      if (summary) {
        summary.unread += 1;
      } else {
        summaryMap.set(msg.conversation_id, {
          lastMessage: msg.body,
          lastTimestamp: msg.sent_at,
          unread: 1,
        });
      }
    }
  });

  const items = (participantRows ?? [])
    .map((row) => {
      if (!row.profile) return null;
      const summary = summaryMap.get(row.conversation_id);
      const lastTimestamp = summary?.lastTimestamp ?? null;
      const timeString = lastTimestamp
        ? new Date(lastTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "";
      const isActive = lastTimestamp ? Date.now() - new Date(lastTimestamp).getTime() < 2 * 60 * 60 * 1000 : false;

      return {
        id: row.conversation_id,
        user: profileRowToUser(row.profile),
        lastMessage: summary?.lastMessage ?? "Say hello!",
        time: timeString,
        unread: summary?.unread ?? 0,
        isActive,
      };
    })
    .filter(Boolean) as Conversation[];

  return items.sort((a, b) => {
    const tsA = summaryMap.get(a.id)?.lastTimestamp;
    const tsB = summaryMap.get(b.id)?.lastTimestamp;
    const timeA = tsA ? new Date(tsA).getTime() : 0;
    const timeB = tsB ? new Date(tsB).getTime() : 0;
    return timeB - timeA;
  });
}

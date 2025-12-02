"use client";

import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { ConnectionRequest } from "../types";
import { profileRowToUser } from "../utils/profile";
import Button from "../components/Button";
import { ensureConversation } from "../utils/conversations";
import { useAppNavigation } from "../navigation/useAppNavigation";

const RequestsScreen = () => {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("connection_requests")
        .select("*, sender:profiles!connection_requests_sender_id_fkey(*)")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const mapped =
        data?.map((row) => ({
          id: row.id,
          user: profileRowToUser(row.sender),
          message: row.message ?? "",
          sentAt: new Date(row.created_at).toLocaleString(),
          status: row.status,
        })) ?? [];

      setRequests(mapped);
    } catch (error) {
      console.error("Failed to load requests:", error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests]),
  );

  const handleRespond = async (request: ConnectionRequest, accept: boolean) => {
    try {
      await supabase
        .from("connection_requests")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", request.id);

      if (accept && user?.id) {
        await supabase.from("contact_book").insert([
          { owner_id: user.id, contact_id: request.user.id },
          { owner_id: request.user.id, contact_id: user.id },
        ]);

        const conversationId = await ensureConversation(user.id, request.user.id);
        navigation.navigate("Chat", {
          conversationId,
          userId: request.user.id,
          userName: `${request.user.firstName} ${request.user.lastName}`,
          userAvatar: request.user.avatar,
        });
      }

      setRequests((prev) => prev.filter((item) => item.id !== request.id));
    } catch (error) {
      console.error("Failed to update request:", error);
      Alert.alert("Error", "Unable to update request. Please try again.");
    }
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={36} color="#7f88b8" />
      <Text style={styles.emptyTitle}>No requests right now</Text>
      <Text style={styles.emptySubtitle}>Once someone wants to connect with you, their request will appear here.</Text>
      <Button title="Discover people" onPress={() => navigation.navigate("Discover")} size="small" style={styles.emptyButton} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Contacts")}>
          <Text style={styles.link}>My contacts</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Review connection requests and decide who gets into your private contact book.</Text>

      {isLoading ? (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#4dabf7" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>
                    {item.user.firstName} {item.user.lastName}
                  </Text>
                  <Text style={styles.cardMeta}>{item.sentAt}</Text>
                </View>
              </View>
              {!!item.message && <Text style={styles.cardMessage}>{item.message}</Text>}
              <View style={styles.cardActions}>
                <Button title="Accept" onPress={() => handleRespond(item, true)} size="small" style={styles.acceptButton} />
                <Button
                  title="Decline"
                  onPress={() => handleRespond(item, false)}
                  size="small"
                  variant="outline"
                  style={styles.declineButton}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030612",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  link: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  subtitle: {
    color: "#8e95bd",
    paddingHorizontal: 20,
    marginTop: 6,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: "#101632",
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: "#fff",
    fontWeight: "700",
  },
  cardMeta: {
    color: "#8e95bd",
    fontSize: 12,
  },
  cardMessage: {
    color: "#d9dbef",
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    gap: 8,
  },
  emptyTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#8c93c1",
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 8,
  },
});

export default RequestsScreen;

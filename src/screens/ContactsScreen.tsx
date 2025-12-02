"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { profileRowToUser } from "../utils/profile";
import type { User } from "../types";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { ensureConversation } from "../utils/conversations";
import Button from "../components/Button";

const ContactsScreen = () => {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContacts = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_book")
        .select("contact:profiles!contact_book_contact_id_fkey(*)")
        .eq("owner_id", user.id);
      if (error) throw error;
      const mapped =
        data
          ?.map((row) => row.contact)
          .filter(Boolean)
          .map((profile) => profileRowToUser(profile)) ?? [];
      setContacts(mapped);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [fetchContacts]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchContacts();
    setRefreshing(false);
  }, [fetchContacts]);

  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return contacts;
    return contacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        (contact.city ?? "").toLowerCase().includes(query),
    );
  }, [contacts, searchQuery]);

  const handleStartChat = async (contact: User) => {
    if (!user?.id) return;
    const conversationId = await ensureConversation(user.id, contact.id);
    navigation.navigate("Chat", {
      conversationId,
      userId: contact.id,
      userName: `${contact.firstName} ${contact.lastName}`,
      userAvatar: contact.avatar,
    });
  };

  const FavoriteCard = () => {
    const favorite = contacts[0];
    if (!favorite) return null;
    return (
      <View style={styles.favoriteCard}>
        <View style={styles.favoriteInfo}>
          <Image source={{ uri: favorite.avatar }} style={styles.favoriteAvatar} />
          <View>
            <Text style={styles.favoriteName}>
              {favorite.firstName} {favorite.lastName}
            </Text>
            <Text style={styles.favoriteSubtitle}>{favorite.city ?? "Unknown location"}</Text>
          </View>
        </View>
        <Button title="Chat" size="small" onPress={() => handleStartChat(favorite)} />
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={36} color="#7f88b8" />
      <Text style={styles.emptyTitle}>No contacts yet</Text>
      <Text style={styles.emptySubtitle}>Accept requests or scan venues to build your private contact list.</Text>
      <Button title="View requests" onPress={() => navigation.navigate("Requests")} size="small" style={styles.emptyButton} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <TouchableOpacity style={styles.requestsButton} onPress={() => navigation.navigate("Requests")}>
          <Ionicons name="notifications-outline" size={18} color="#fff" />
          <Text style={styles.requestsText}>Requests</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8e95bd" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or city"
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

      {isLoading ? (
        <View style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color="#4dabf7" />
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.contactCard} onPress={() => handleStartChat(item)}>
              <View style={styles.contactInfo}>
                <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
                <View>
                  <Text style={styles.contactName}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={styles.contactMeta}>{item.city ?? "Unknown city"}</Text>
                </View>
              </View>
              <Ionicons name="chatbubble-outline" size={18} color="#4dabf7" />
            </TouchableOpacity>
          )}
          ListHeaderComponent={<FavoriteCard />}
          ListEmptyComponent={<EmptyState />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
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
  requestsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(77,171,247,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  requestsText: {
    color: "#fff",
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11162b",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
  },
  favoriteCard: {
    backgroundColor: "#101632",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  favoriteAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  favoriteName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  favoriteSubtitle: {
    color: "#9da4c6",
    fontSize: 13,
  },
  contactCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  contactName: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  contactMeta: {
    color: "#8a92c1",
    fontSize: 13,
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

export default ContactsScreen;

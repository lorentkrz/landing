"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { profileRowToUser } from "../utils/profile";
import type { User } from "../types";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { ensureConversation } from "../utils/conversations";

const NewMessageScreen = () => {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", user.id)
          .order("first_name");
        if (error) throw error;
        setUsers(data.map((row) => profileRowToUser(row)));
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [user?.id]);

  const filteredUsers = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return users;
    return users.filter(
      (item) =>
        item.firstName.toLowerCase().includes(q) ||
        item.lastName.toLowerCase().includes(q) ||
        (item.city ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  const handleSelect = async (target: User) => {
    if (!user?.id) return;
    const conversationId = await ensureConversation(user.id, target.id);
    navigation.navigate("Chat", {
      conversationId,
      userId: target.id,
      userName: `${target.firstName} ${target.lastName}`,
      userAvatar: target.avatar,
    });
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={32} color="#8794d5" />
      <Text style={styles.emptyTitle}>No users match</Text>
      <Text style={styles.emptySubtitle}>Check other venues or update the search to find new connections.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <View style={{ width: 26 }} />
      </View>
      <Text style={styles.subtitle}>Search for someone to start a private chat.</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#8e95bd" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or city"
          placeholderTextColor="#8e95bd"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
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
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
              <View style={styles.userInfo}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={styles.meta}>{item.city ?? "Unknown city"}</Text>
                </View>
              </View>
              <Ionicons name="chatbubble-outline" size={18} color="#4dabf7" />
            </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9aa3c3",
    paddingHorizontal: 20,
    marginTop: 4,
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  name: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  meta: {
    color: "#8e95bd",
    fontSize: 12,
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
});

export default NewMessageScreen;

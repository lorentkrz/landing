"use client";

import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { User } from "../types";

interface UserCardProps {
  user: User;
  onPress: (user: User) => void;
  style?: any;
}

const UserCard: React.FC<UserCardProps> = ({ user, onPress, style }) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  return (
    <TouchableOpacity style={[styles.card, style]} activeOpacity={0.9} onPress={() => onPress(user)}>
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={[styles.statusDot, user.isOnline && styles.statusDotOnline]} />
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.tag}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.tagText}>Tonight</Text>
          </View>
        </View>
        <Text style={styles.meta}>{user.age ? `${user.age} • ${user.gender ?? "—"}` : user.gender ?? "—"}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#8f96bb" />
          <Text style={styles.locationText}>
            {user.city}, {user.country}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.chatButton} onPress={() => onPress(user)}>
        <Ionicons name="chatbubble-outline" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#11162b",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    gap: 12,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#5a607c",
    borderWidth: 2,
    borderColor: "#11162b",
  },
  statusDotOnline: {
    backgroundColor: "#58d594",
  },
  info: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  meta: {
    color: "#c6cbe3",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    color: "#8f96bb",
    fontSize: 13,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4dabf7",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserCard;

// components/ConversationItem.tsx
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Conversation } from "../types";

type Props = {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
};

const ConversationItem = ({ conversation, onPress }: Props) => {
  const { user, lastMessage, time, unread, isActive } = conversation;
  const fullName = `${user.firstName} ${user.lastName}`;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress(conversation)}>
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={[styles.statusDot, user.isOnline && styles.statusDotOnline]} />
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {fullName}
          </Text>
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {lastMessage}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, isActive && styles.badgeActive]}>
            <Ionicons name={isActive ? "flash" : "moon"} size={12} color="#fff" />
            <Text style={styles.badgeText}>{isActive ? "Active now" : "Later"}</Text>
          </View>
          {unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 14,
    backgroundColor: "#0f1425",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    marginBottom: 12,
    gap: 12,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "#5b5f74",
    borderWidth: 2,
    borderColor: "#0f1425",
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
  time: {
    color: "#8f95bd",
    fontSize: 12,
  },
  message: {
    color: "#c6cbe3",
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  badgeActive: {
    backgroundColor: "rgba(77,171,247,0.2)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#4dabf7",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default ConversationItem;

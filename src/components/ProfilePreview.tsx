import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { User } from "../types";

interface ProfilePreviewProps {
  user: User;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({
  user,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel = "Start Chat",
  secondaryLabel = "View Profile",
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.meta}>
            {user.city}, {user.country}
          </Text>
          <View style={styles.badges}>
            {user.isOnline && (
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>Online</Text>
              </View>
            )}
            {user.age && (
              <View style={styles.badge}>
                <Ionicons name="calendar-outline" size={12} color="#fff" />
                <Text style={styles.badgeText}>{user.age}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {onPrimaryAction && (
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={onPrimaryAction}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
            <Text style={styles.buttonText}>{primaryLabel}</Text>
          </TouchableOpacity>
        )}
        {onSecondaryAction && (
          <TouchableOpacity style={[styles.button, styles.secondary]} onPress={onSecondaryAction}>
            <Ionicons name="person-outline" size={16} color="#4dabf7" />
            <Text style={[styles.buttonText, styles.secondaryText]}>{secondaryLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a1f2c",
    borderRadius: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: "#8e8e93",
    marginTop: 4,
  },
  badges: {
    flexDirection: "row",
    marginTop: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4dabf7",
    marginRight: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
  },
  primary: {
    backgroundColor: "#4dabf7",
  },
  secondary: {
    borderWidth: 1,
    borderColor: "#4dabf7",
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  secondaryText: {
    color: "#4dabf7",
  },
});

export default ProfilePreview;

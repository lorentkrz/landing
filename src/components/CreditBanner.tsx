import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface CreditBannerProps {
  credits: number;
  onAddCredits: () => void;
  onViewHistory?: () => void;
}

const CreditBanner: React.FC<CreditBannerProps> = ({ credits, onAddCredits, onViewHistory }) => (
  <LinearGradient colors={["#1d1941", "#0f1228"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
    <View style={styles.left}>
      <View style={styles.iconWrapper}>
        <Ionicons name="flash" size={20} color="#fff" />
      </View>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>Credits available</Text>
        <Text style={styles.amount}>{credits}</Text>
        <Text style={styles.subtitle}>Extend chats, unlock rooms, boost intros</Text>
      </View>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity style={styles.primaryButton} onPress={onAddCredits}>
        <Text style={styles.primaryText}>Buy more</Text>
      </TouchableOpacity>
      {onViewHistory && (
        <TouchableOpacity style={styles.secondaryButton} onPress={onViewHistory}>
          <Text style={styles.secondaryText}>History</Text>
        </TouchableOpacity>
      )}
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 16,
  },
  left: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    gap: 16,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    color: "#98a2d8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  amount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#b6bee6",
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    alignItems: "flex-end",
    gap: 6,
  },
  primaryButton: {
    backgroundColor: "#4dabf7",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  secondaryText: {
    color: "#98a2d8",
    fontSize: 12,
  },
});

export default CreditBanner;

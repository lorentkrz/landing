"use client";

import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Venue } from "../types";

interface VenueCardProps {
  venue: Venue;
  onPress: (venue: Venue) => void;
  style?: any;
  compact?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress, style, compact = false }) => {
  const displayDistance =
    typeof venue.distanceKm === "number"
      ? venue.distanceKm < 1
        ? `${Math.round(venue.distanceKm * 1000)} m`
        : `${venue.distanceKm.toFixed(1)} km`
      : venue.distance || null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.container, compact ? styles.compactContainer : {}, style]}
      onPress={() => onPress(venue)}
    >
      <ImageBackground
        source={{ uri: venue.image }}
        style={styles.image}
        imageStyle={styles.imageBorder}
        resizeMode="cover"
      >
        <LinearGradient colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.85)"]} style={styles.overlay} />

        <View style={styles.topRow}>
          <View style={styles.typeBadge}>
            <Ionicons name="sparkles" size={12} color="#fff" />
            <Text style={styles.typeText}>{venue.type}</Text>
          </View>
          {displayDistance && (
            <View style={styles.distanceBadge}>
              <Ionicons name="location-outline" size={12} color="#fff" />
              <Text style={styles.distanceText}>{displayDistance}</Text>
            </View>
          )}
        </View>

        {venue.isCheckedIn && (
          <View style={styles.checkedInBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.checkedInText}>You're inside</Text>
          </View>
        )}

        <View style={styles.bottomContent}>
          <Text style={[styles.name, compact && styles.compactName]} numberOfLines={1}>
            {venue.name}
          </Text>
          {!compact && (
            <Text style={styles.description} numberOfLines={1}>
              {venue.city} • {venue.country}
            </Text>
          )}

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="people-outline" size={12} color="#fff" />
              <Text style={styles.metaText}>{venue.activeUsers} inside</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="star" size={12} color="#ffd479" />
              <Text style={styles.metaText}>{venue.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 260,
    borderRadius: 22,
    overflow: "hidden",
  },
  compactContainer: {
    width: "100%",
    height: 220,
  },
  image: {
    flex: 1,
  },
  imageBorder: {
    borderRadius: 22,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    zIndex: 2,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  distanceText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  checkedInBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#4dabf7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checkedInText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  bottomContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 6,
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  compactName: {
    fontSize: 18,
  },
  description: {
    color: "#d3d9ff",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  metaText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default VenueCard;

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import Button from "../components/Button";
import UserCard from "../components/UserCard";
import { useVenues } from "../context/VenueContext";
import * as Location from "expo-location";
import { useCredits } from "../context/CreditsContext";
import { useAuth } from "../context/AuthContext";
import { useAppNavigation } from "../navigation/useAppNavigation";
import type { User, Venue } from "../types";
import { ensureConversation } from "../utils/conversations";

const VenueDetailsScreen = () => {
  const route = useRoute();
  const navigation = useAppNavigation();
  const { getVenueById, checkInToVenue, activeCheckIn, fetchActiveUsersForVenue, updateUserLocation } = useVenues();
  const { credits } = useCredits();
  const { user } = useAuth();

  const { venueId } = (route.params as { venueId: string }) ?? {};
  const [venue, setVenue] = useState<Venue | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (!venueId) return;
    const details = getVenueById(venueId);
    setVenue(details ?? null);
    setIsCheckedIn(Boolean(details?.isCheckedIn || activeCheckIn?.venueId === venueId));
  }, [venueId, getVenueById, activeCheckIn?.venueId]);

  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      if (!venueId) return;
      setIsLoadingUsers(true);
      const guests = await fetchActiveUsersForVenue(venueId);
      if (mounted) {
        setActiveUsers(guests);
        setIsLoadingUsers(false);
      }
    };
    loadUsers();
    return () => {
      mounted = false;
    };
  }, [venueId, fetchActiveUsersForVenue]);

  const handleCheckIn = async () => {
    if (!venue || !user?.id) return;
    setIsCheckingIn(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location required", "Enable location to check in at this venue.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      updateUserLocation(coords);
      await checkInToVenue(venue.id, coords);
      setIsCheckedIn(true);
      const guests = await fetchActiveUsersForVenue(venue.id);
      setActiveUsers(guests);
    } catch (error) {
      Alert.alert("Check-in failed", (error as Error).message);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleUserPress = async (target: User) => {
    if (!user?.id) {
      Alert.alert("Login required", "Please log in to start a chat.");
      return;
    }
    if (!isCheckedIn) {
      Alert.alert("Check in required", "Check in at the venue to unlock the guest list.");
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

  const visibleUsers = useMemo(
    () => (user?.id ? activeUsers.filter((profile) => profile.id !== user.id) : activeUsers),
    [activeUsers, user?.id],
  );

  if (!venue) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Loading venue details…</Text>
      </View>
    );
  }

  const highlights = venue.features?.slice(0, 4) ?? ["Bottle service", "DJ tonight", "Rooftop", "Members line"];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.hero}>
          <ImageBackground source={{ uri: venue.coverImage ?? venue.image }} style={styles.heroImage}>
            <LinearGradient colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.85)"]} style={styles.heroOverlay} />
            <View style={styles.heroContent}>
              <View style={styles.heroTopRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate("Map")}>
                  <Ionicons name="map-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.heroDetails}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, isCheckedIn && styles.statusBadgeActive]}>
                    <Ionicons name={isCheckedIn ? "flash" : "lock-closed"} size={14} color="#fff" />
                    <Text style={styles.statusText}>{isCheckedIn ? "Guest list unlocked" : "Locked"}</Text>
                  </View>
                  <View style={styles.ratingPill}>
                    <Ionicons name="star" size={14} color="#ffd479" />
                    <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.heroTitle}>{venue.name}</Text>
                <Text style={styles.heroMeta}>
                  {venue.type} • {venue.city}, {venue.country}
                </Text>
                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{venue.activeUsers}</Text>
                    <Text style={styles.heroStatLabel}>inside now</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{venue.capacity ?? 300}</Text>
                    <Text style={styles.heroStatLabel}>capacity</Text>
                  </View>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{venue.distance ?? "0.5 km"}</Text>
                    <Text style={styles.heroStatLabel}>away</Text>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionBody}>{venue.description || "No description available just yet."}</Text>
        </View>

        <View style={styles.highlightSection}>
          <Text style={styles.sectionTitle}>Tonight's highlights</Text>
          <View style={styles.highlightGrid}>
            {highlights.map((feature) => (
              <View key={feature} style={styles.highlightCard}>
                <Ionicons name="sparkles-outline" size={16} color="#fff" />
                <Text style={styles.highlightText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color="#8f96bb" />
            <Text style={styles.detailText}>{venue.openHours ?? "Tonight 22:00 - 04:00"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color="#8f96bb" />
            <Text style={styles.detailText}>{venue.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={18} color="#8f96bb" />
            <Text style={styles.detailText}>Tap to call host</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guest list</Text>
            {isCheckedIn ? (
              <TouchableOpacity onPress={() => navigation.navigate("VenueRoom", { venueId })}>
                <Text style={styles.sectionAction}>Open room</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {isCheckedIn ? (
            <>
              {isLoadingUsers ? (
                <ActivityIndicator size="small" color="#4dabf7" style={{ marginTop: 12 }} />
              ) : (
                <View style={styles.guestsGrid}>
                  {visibleUsers.slice(0, 4).map((profile) => (
                    <UserCard key={profile.id} user={profile} onPress={handleUserPress} />
                  ))}
                </View>
              )}
              {visibleUsers.length === 0 && !isLoadingUsers ? (
                <Text style={styles.emptyGuestsText}>You're the first here tonight. Invite friends!</Text>
              ) : null}
            </>
          ) : (
            <View style={styles.lockedCard}>
              <Ionicons name="lock-closed" size={24} color="#fff" />
              <Text style={styles.lockedTitle}>Guest list hidden</Text>
              <Text style={styles.lockedSubtitle}>Check in with the QR code at the entrance to see who is inside.</Text>
              <Button title="How to check in" onPress={() => navigation.navigate("HowToCheckIn")} size="small" />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>{isCheckedIn ? "Checked in" : "Credits"}</Text>
          <Text style={styles.footerValue}>{isCheckedIn ? venue.name : `${credits} credits`}</Text>
        </View>
        <Button
          title={isCheckedIn ? "Enter room" : "Check in"}
          onPress={isCheckedIn ? () => navigation.navigate("VenueRoom", { venueId }) : handleCheckIn}
          loading={isCheckingIn}
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
    marginTop: 8,
    color: "#9aa3c3",
  },
  hero: {
    height: 340,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    marginBottom: 12,
  },
  heroImage: {
    flex: 1,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: "space-between",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroDetails: {
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeActive: {
    backgroundColor: "rgba(77,171,247,0.6)",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  ratingText: {
    color: "#fff",
    fontWeight: "600",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    marginTop: 12,
  },
  heroMeta: {
    color: "#d0d5f2",
    marginTop: 4,
  },
  heroStats: {
    flexDirection: "row",
    gap: 16,
    marginTop: 14,
  },
  heroStat: {
    flex: 1,
  },
  heroStatValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  heroStatLabel: {
    color: "#c6cbe3",
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  sectionAction: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  sectionBody: {
    color: "#c6cbe3",
    marginTop: 12,
    lineHeight: 20,
  },
  highlightSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  highlightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  highlightCard: {
    flexBasis: "48%",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#0f1425",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  highlightText: {
    color: "#fff",
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  detailText: {
    color: "#c6cbe3",
    flex: 1,
  },
  guestsGrid: {
    marginTop: 16,
    gap: 12,
  },
  lockedCard: {
    backgroundColor: "#0f1425",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  lockedTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  lockedSubtitle: {
    color: "#8f96bb",
    textAlign: "center",
  },
  emptyGuestsText: {
    color: "#8f96bb",
    marginTop: 12,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#050713",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
    gap: 12,
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    color: "#8f96bb",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  footerValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  footerButton: {
    width: 160,
  },
});

export default VenueDetailsScreen;

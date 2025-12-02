"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import CreditBanner from "../components/CreditBanner";
import VenueCard from "../components/VenueCard";
import StoryRail from "../components/StoryRail";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { useAuth } from "../context/AuthContext";
import { useVenues } from "../context/VenueContext";
import { useCredits } from "../context/CreditsContext";
import { useReferrals } from "../context/ReferralContext";
import { track } from "../utils/analytics";
import type { Venue } from "../types";

const HomeScreen = () => {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const { venues, activeCheckIn, refreshVenues } = useVenues();
  const { credits } = useCredits();
  const { createInvite, inviterReward, inviteeReward } = useReferrals();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    track("navigation", { screen: "Home" });
  }, []);

  const featuredVenues = useMemo(() => {
    const byFlag = venues.filter((venue) => venue.isFeatured);
    if (byFlag.length) return byFlag.slice(0, 5);
    // fallback: top-rated
    return [...venues].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5);
  }, [venues]);
  const nearbyVenues = useMemo(
    () =>
      [...venues]
        .sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER))
        .slice(0, 6),
    [venues],
  );
  const trendingVenues = useMemo(
    () =>
      [...venues]
        .sort(
          (a, b) =>
            (b.activeUsers ?? 0) * 2 + (b.rating ?? 0) - ((a.activeUsers ?? 0) * 2 + (a.rating ?? 0)),
        )
        .slice(0, 6),
    [venues],
  );
  const recentVenues = useMemo(() => venues.slice(3, 9), [venues]);

  const currentVenue = activeCheckIn?.venueId ? venues.find((v) => v.id === activeCheckIn.venueId) : undefined;
  const locationLabel = user?.city && user?.country ? `${user.city}, ${user.country}` : user?.city ?? "Your city";

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venue: Venue) => navigation.navigate("VenueDetails", { venueId: venue.id });

  const quickActions = [
    {
      icon: activeCheckIn ? "sparkles" : "scan-outline",
      title: activeCheckIn ? "You're checked-in" : "Check in tonight",
      subtitle: activeCheckIn ? currentVenue?.name ?? "Active for 2h" : "Scan a QR to unlock venues",
      onPress: activeCheckIn
        ? () => navigation.navigate("VenueDetails", { venueId: activeCheckIn.venueId })
        : () => navigation.navigate("Scan"),
      tint: "rgba(77, 171, 247, 0.3)",
    },
    {
      icon: "flash-outline",
      title: "Buy credits",
      subtitle: "Keep chats going",
      onPress: () => navigation.navigate("Credits"),
      tint: "rgba(212, 142, 255, 0.25)",
    },
    {
      icon: "chatbubbles-outline",
      title: "Messages",
      subtitle: "Continue connections",
      onPress: () => navigation.navigate("Messages"),
      tint: "rgba(255, 116, 139, 0.25)",
    },
    {
      icon: "map-outline",
      title: "Map view",
      subtitle: "See it on a map",
      onPress: () => navigation.navigate("Map"),
      tint: "rgba(255, 206, 116, 0.25)",
    },
  ] as const;

  const renderFeaturedVenue = ({ item }: { item: Venue }) => (
    <VenueCard venue={item} onPress={handleVenuePress} style={styles.featuredCard} />
  );

  const renderRecentVenue = (venue: Venue) => (
    <TouchableOpacity key={venue.id} style={styles.listItem} onPress={() => handleVenuePress(venue)}>
      <Image source={{ uri: venue.image }} style={styles.listItemImage} />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{venue.name}</Text>
        <Text style={styles.listItemSubtitle}>
          {venue.type} - {venue.city}
        </Text>
        <View style={styles.listItemMeta}>
          <View style={styles.metaPill}>
            <Ionicons name="people-outline" size={12} color="#fff" />
            <Text style={styles.metaPillText}>{venue.activeUsers} inside</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name="star" size={12} color="#ffd479" />
            <Text style={styles.metaPillText}>{venue.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6f789c" />
    </TouchableOpacity>
  );

  const SectionHeader = ({
    title,
    actionLabel,
    onPress,
  }: {
    title: string;
    actionLabel?: string;
    onPress?: () => void;
  }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onPress && (
        <TouchableOpacity style={styles.sectionAction} onPress={onPress}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color="#4dabf7" />
        </TouchableOpacity>
      )}
    </View>
  );

  const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <View style={styles.emptyState}>
      <Ionicons name="planet-outline" size={28} color="#6f7bbd" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      <Button title="Refresh" onPress={onRefresh} size="small" style={styles.emptyButton} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
        contentContainerStyle={styles.contentContainer}
      >
        <LinearGradient colors={["#151a3c", "#090c16"]} style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={styles.kicker}>Tonight</Text>
              <Text style={styles.heroTitle}>Hey {user?.firstName ?? "there"}, where's the vibe?</Text>
              <TouchableOpacity style={styles.locationPill} onPress={() => navigation.navigate("Map")}>
                <Ionicons name="location-outline" size={16} color="#9fb3ff" />
                <Text style={styles.locationText}>{locationLabel}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.heroRight}>
              <TouchableOpacity style={styles.creditsBadge} onPress={() => navigation.navigate("Credits")}>
                <Ionicons name="flash" size={14} color="#ffd479" />
                <Text style={styles.creditsText}>{credits}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate("Profile")}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person-circle-outline" size={40} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Unlocked venues</Text>
              <Text style={styles.heroStatValue}>{activeCheckIn ? 1 : 0}</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Live venues</Text>
              <Text style={styles.heroStatValue}>{venues.length}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.sectionSpacing}>
          <View style={styles.checkInCard}>
            <View style={styles.checkInText}>
              <Text style={styles.checkInLabel}>{activeCheckIn ? "Currently inside" : "Not checked in"}</Text>
              <Text style={styles.checkInTitle}>
                {activeCheckIn ? currentVenue?.name ?? "Unknown venue" : "Scan a QR at the door"}
              </Text>
              <Text style={styles.checkInSubtitle}>
                {activeCheckIn ? "Guest list unlocked for 2 hours." : "Unlock guest lists and live rooms instantly."}
              </Text>
            </View>
            <Button
              title={activeCheckIn ? "View venue" : "Scan QR"}
              size="small"
              onPress={
                activeCheckIn
                  ? () => navigation.navigate("VenueDetails", { venueId: activeCheckIn.venueId })
                  : () => navigation.navigate("Scan")
              }
            />
          </View>
        </View>

        <StoryRail />

        <View style={styles.actionsRow}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={[styles.actionCard, { backgroundColor: action.tint }]}
              onPress={action.onPress}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={18} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CreditBanner
          credits={credits}
          onAddCredits={() => navigation.navigate("Credits")}
          onViewHistory={() => navigation.navigate("Credits")}
        />

        <TouchableOpacity style={styles.inviteBanner} onPress={async () => {
          const invite = await createInvite();
          if (invite) {
            track("navigation", { screen: "Home", action: "invite_created" });
          }
        }}>
          <View style={styles.inviteLeft}>
            <Text style={styles.inviteTitle}>Invite friends</Text>
            <Text style={styles.inviteSubtitle}>
              +{inviterReward} for you • +{inviteeReward} for them
            </Text>
          </View>
          <View style={styles.invitePill}>
            <Ionicons name="gift" size={16} color="#0a0e17" />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionSpacing}>
          <SectionHeader
            title="Tonight's headliners"
            actionLabel="See all"
            onPress={() => navigation.navigate("Discover")}
          />
          {featuredVenues.length === 0 ? (
            <EmptyState title="No featured spots yet" subtitle="Refresh to load the latest venues." />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredVenues}
              keyExtractor={(item) => item.id}
              renderItem={renderFeaturedVenue}
              contentContainerStyle={styles.featuredList}
            />
          )}
        </View>

        <View style={styles.sectionSpacing}>
          <SectionHeader title="Close to you" actionLabel="Map" onPress={() => navigation.navigate("Map")} />
          {nearbyVenues.length === 0 ? (
            <EmptyState title="Nothing nearby yet" subtitle="Give it a second, we are warming up." />
          ) : (
            <View style={styles.grid}>
              {nearbyVenues.map((venue) => (
                <View key={venue.id} style={styles.gridItem}>
                  <VenueCard venue={venue} onPress={handleVenuePress} compact />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionSpacing}>
          <SectionHeader title="Trending right now" actionLabel="Discover" onPress={() => navigation.navigate("Discover")} />
          {trendingVenues.length === 0 ? (
            <EmptyState title="No trending spots" subtitle="Scan a venue to seed your feed." />
          ) : (
            trendingVenues.map(renderRecentVenue)
          )}
        </View>

        <View style={styles.sectionSpacing}>
          <SectionHeader title="Recently buzzing" />
          {recentVenues.length === 0 ? (
            <EmptyState title="No recent activity" subtitle="Scan a venue to start populating this feed." />
          ) : (
            recentVenues.map(renderRecentVenue)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#05060f",
  },
  inviteBanner: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(92,225,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(92,225,255,0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inviteLeft: {
    gap: 4,
  },
  inviteTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  inviteSubtitle: {
    color: "#b7c0e6",
    fontSize: 12,
  },
  invitePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#5ce1ff",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  hero: {
    marginHorizontal: 20,
    borderRadius: 28,
    padding: 22,
    marginTop: 4,
    gap: 18,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  heroLeft: {
    flex: 1,
    gap: 8,
  },
  heroRight: {
    alignItems: "flex-end",
    gap: 10,
  },
  kicker: {
    color: "#8f98c9",
    letterSpacing: 1.2,
    fontSize: 12,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  locationText: {
    color: "#dfe6ff",
    fontSize: 13,
    fontWeight: "500",
  },
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  creditsText: {
    color: "#fff",
    fontWeight: "600",
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    color: "#8f98c9",
    fontSize: 12,
  },
  heroStatValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  heroDivider: {
    width: 1,
    height: 38,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 16,
  },
  sectionSpacing: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  checkInCard: {
    backgroundColor: "#0f1324",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  checkInText: {
    flex: 1,
    gap: 4,
  },
  checkInLabel: {
    color: "#8f98c9",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  checkInTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  checkInSubtitle: {
    color: "#b4bad6",
    fontSize: 13,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  actionCard: {
    flexBasis: "47%",
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  actionSubtitle: {
    color: "#d0d6f0",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionActionText: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  featuredList: {
    paddingRight: 20,
    gap: 16,
  },
  featuredCard: {
    marginRight: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridItem: {
    width: "48%",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  listItemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  listItemContent: {
    flex: 1,
    gap: 2,
  },
  listItemTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  listItemSubtitle: {
    color: "#8f98c9",
    fontSize: 12,
  },
  listItemMeta: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  metaPillText: {
    color: "#fff",
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  emptyTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#8590c7",
    fontSize: 13,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 6,
  },
});

export default HomeScreen;

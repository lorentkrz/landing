"use client";

import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useVenues } from "../context/VenueContext";
import { useAppNavigation } from "../navigation/useAppNavigation";
import type { Venue } from "../types";

const CATEGORIES = [
  { id: "all", name: "All", icon: "grid-outline" },
  { id: "trending", name: "Trending", icon: "flame-outline" },
  { id: "nightclubs", name: "Nightclubs", icon: "moon-outline" },
  { id: "bars", name: "Bars & Lounges", icon: "wine-outline" },
  { id: "live", name: "Live Music", icon: "musical-notes-outline" },
  { id: "events", name: "Events", icon: "calendar-outline" },
  { id: "beach", name: "Beach Clubs", icon: "umbrella-outline" },
] as const;

const SORTS = [
  { id: "rating", label: "Top rated" },
  { id: "crowd", label: "Busiest" },
  { id: "recent", label: "Newest" },
] as const;

const DiscoverScreen = () => {
  const navigation = useAppNavigation();
  const { venues, refreshVenues, isLoading } = useVenues();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<(typeof SORTS)[number]["id"]>("rating");
  const [refreshing, setRefreshing] = useState(false);

  const filteredVenues = useMemo(() => {
    const base = venues.filter((venue) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        venue.name.toLowerCase().includes(query) ||
        venue.city.toLowerCase().includes(query) ||
        venue.type.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const type = venue.type.toLowerCase();

      switch (selectedCategory) {
        case "trending":
          return venue.rating >= 4.7;
        case "nightclubs":
          return type.includes("club");
        case "bars":
          return type.includes("bar") || type.includes("lounge");
        case "events":
          return type.includes("event");
        case "live":
          return type.includes("live") || type.includes("music");
        case "beach":
          return type.includes("beach");
        default:
          return true;
      }
    });

    const sorted = [...base];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "crowd":
          return (b.activeUsers ?? 0) - (a.activeUsers ?? 0);
        case "recent":
          return (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
        case "rating":
        default:
          return b.rating - a.rating;
      }
    });
    return sorted;
  }, [venues, searchQuery, selectedCategory, sortBy]);

  const heroVenue = filteredVenues[0];
  const restVenues = heroVenue ? filteredVenues.slice(1) : filteredVenues;
  const trendingCount = venues.filter((venue) => venue.rating >= 4.7).length;
  const featuredVenues = useMemo(() => venues.filter((venue) => venue.isFeatured).slice(0, 5), [venues]);
  const busyVenues = useMemo(
    () =>
      [...venues]
        .filter((venue) => (venue.activeUsers ?? 0) > 0)
        .sort((a, b) => (b.activeUsers ?? 0) - (a.activeUsers ?? 0))
        .slice(0, 6),
    [venues],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venue: Venue) => navigation.navigate("VenueDetails", { venueId: venue.id });

  if (isLoading && !venues.length) {
    return (
      <View style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color="#4dabf7" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
        contentContainerStyle={styles.contentContainer}
      >
        <LinearGradient colors={["#181b3a", "#090b16"]} style={styles.hero}>
          <Text style={styles.heroKicker}>Discover</Text>
          <Text style={styles.heroTitle}>Find tonight’s energy</Text>
          <Text style={styles.heroSubtitle}>Browse the hottest venues, curated guest lists, and live rooms.</Text>
          <TouchableOpacity style={styles.heroGuideButton} onPress={() => navigation.navigate("HowToCheckIn")}>
            <Ionicons name="qr-code-outline" size={16} color="#050b1b" />
            <Text style={styles.heroGuideText}>How to check in</Text>
          </TouchableOpacity>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{venues.length}</Text>
              <Text style={styles.heroStatLabel}>Venues live</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{trendingCount}</Text>
              <Text style={styles.heroStatLabel}>Trending</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {venues.reduce((sum, venue) => sum + (venue.activeUsers ?? 0), 0)}
              </Text>
              <Text style={styles.heroStatLabel}>People inside</Text>
            </View>
          </View>
        </LinearGradient>

        {featuredVenues.length ? (
          <View style={styles.collectionSection}>
            <View style={styles.collectionHeader}>
              <View>
                <Text style={styles.collectionTitle}>Tonight’s picks</Text>
                <Text style={styles.collectionSubtitle}>Handpicked featured venues</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCategory("trending")}>
                <Text style={styles.collectionLink}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionRow}
            >
              {featuredVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.featuredCard}
                  onPress={() => handleVenuePress(venue)}
                >
                  <ImageBackground source={{ uri: venue.image }} style={styles.featuredImage}>
                    <LinearGradient
                      colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
                      style={styles.featuredOverlay}
                    />
                    <View style={styles.featuredContent}>
                      <View style={styles.featuredBadge}>
                        <Ionicons name="sparkles" size={12} color="#fff" />
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                      </View>
                      <Text style={styles.featuredName}>{venue.name}</Text>
                      <Text style={styles.featuredMeta}>
                        {venue.city} • {venue.type}
                      </Text>
                      <View style={styles.featuredStats}>
                        <Ionicons name="people-outline" size={12} color="#fff" />
                        <Text style={styles.featuredStatText}>{venue.activeUsers ?? 0} inside</Text>
                        <View style={styles.featuredDivider} />
                        <Ionicons name="star" size={12} color="#ffd479" />
                        <Text style={styles.featuredStatText}>{venue.rating.toFixed(1)}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {busyVenues.length ? (
          <View style={styles.collectionSection}>
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>Busy right now</Text>
              <Text style={styles.collectionSubtitle}>Where the crowd already is</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.busyRow}
            >
              {busyVenues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.busyChip}
                  onPress={() => handleVenuePress(venue)}
                >
                  <Ionicons name="pulse" size={14} color="#4dabf7" />
                  <View>
                    <Text style={styles.busyName}>{venue.name}</Text>
                    <Text style={styles.busyMeta}>{venue.activeUsers ?? 0} inside • {venue.city}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.searchCard}>
          <Ionicons name="search" size={18} color="#9ca4c7" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search venues, neighborhoods, vibes"
            placeholderTextColor="#8f96bb"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#8f96bb" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={isActive ? "#fff" : "#9ca4c7"}
                />
                <Text style={[styles.categoryText, { color: isActive ? "#fff" : "#d3d8f6" }]}>{category.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sortRow}>
          <Text style={styles.resultsText}>{filteredVenues.length} places tonight</Text>
          <View style={styles.sortChips}>
            {SORTS.map((sort) => (
              <TouchableOpacity
                key={sort.id}
                style={[styles.sortChip, sortBy === sort.id && styles.sortChipActive]}
                onPress={() => setSortBy(sort.id)}
              >
                <Text style={[styles.sortChipText, { color: sortBy === sort.id ? "#fff" : "#9ca4c7" }]}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {heroVenue ? (
          <TouchableOpacity style={styles.heroVenue} onPress={() => handleVenuePress(heroVenue)}>
            <ImageBackground source={{ uri: heroVenue.image }} style={styles.heroVenueImage} borderRadius={26}>
              <LinearGradient colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.9)"]} style={styles.heroVenueOverlay} />
              <View style={styles.heroVenueContent}>
                <View style={styles.heroBadgeRow}>
                  <View style={styles.heroFeatureBadge}>
                    <Ionicons name="flame" size={14} color="#fff" />
                    <Text style={styles.heroBadgeText}>Trending</Text>
                  </View>
                  <View style={styles.heroFeatureBadge}>
                    <Ionicons name="people-outline" size={14} color="#fff" />
                    <Text style={styles.heroBadgeText}>{heroVenue.activeUsers} guests</Text>
                  </View>
                </View>
                <Text style={styles.heroVenueTitle}>{heroVenue.name}</Text>
                <Text style={styles.heroVenueSubtitle}>
                  {heroVenue.type} • {heroVenue.city}
                </Text>
                <View style={styles.heroVenueMeta}>
                  <View style={styles.heroMetaPill}>
                    <Ionicons name="star" size={14} color="#ffd479" />
                    <Text style={styles.heroMetaText}>{heroVenue.rating.toFixed(1)}</Text>
                  </View>
                  {heroVenue.distance && (
                    <View style={styles.heroMetaPill}>
                      <Ionicons name="walk" size={14} color="#fff" />
                      <Text style={styles.heroMetaText}>{heroVenue.distance}</Text>
                    </View>
                  )}
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ) : null}

        {restVenues.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sparkles-outline" size={30} color="#8f96bb" />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptySubtitle}>Try changing categories or clear the search to see all venues.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setSearchQuery("")}>
              <Text style={styles.emptyButtonText}>Reset filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.venueList}>
            {restVenues.map((venue, index) => (
              <TouchableOpacity
                key={venue.id}
                style={styles.venueRow}
                activeOpacity={0.85}
                onPress={() => handleVenuePress(venue)}
              >
                <ImageBackground
                  source={{ uri: venue.image }}
                  style={styles.venueRowImage}
                  imageStyle={styles.venueRowImage}
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.45)"]}
                    style={styles.venueRowImageOverlay}
                  />
                  {venue.isFeatured && (
                    <View style={styles.venueRowBadge}>
                      <Ionicons name="sparkles" size={10} color="#fff" />
                    </View>
                  )}
                  <View style={styles.venueRowRank}>
                    <Text style={styles.venueRowRankText}>{String(index + 2).padStart(2, "0")}</Text>
                  </View>
                </ImageBackground>
                <View style={styles.venueRowBody}>
                  <View style={styles.venueRowHeader}>
                    <Text style={styles.venueRowTitle} numberOfLines={1}>
                      {venue.name}
                    </Text>
                    <Text style={styles.venueRowType}>{venue.type}</Text>
                  </View>
                  <Text style={styles.venueRowMeta} numberOfLines={1}>
                    {venue.city}, {venue.country}
                  </Text>
                  <View style={styles.venueRowStats}>
                    <View style={styles.venueRowStat}>
                      <Ionicons name="people" size={12} color="#8bd1ff" />
                      <Text style={styles.venueRowStatText}>{venue.activeUsers ?? 0} inside</Text>
                    </View>
                    <View style={styles.venueRowStat}>
                      <Ionicons name="star" size={12} color="#ffd479" />
                      <Text style={styles.venueRowStatText}>{venue.rating.toFixed(1)}</Text>
                    </View>
                    {venue.distance ? (
                      <View style={styles.venueRowStat}>
                        <Ionicons name="navigate" size={12} color="#8bd1ff" />
                        <Text style={styles.venueRowStatText}>{venue.distance}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#5c638b" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#04050f",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 22,
    borderRadius: 28,
    gap: 8,
  },
  heroKicker: {
    color: "#9099c8",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#b5bedf",
    fontSize: 14,
    marginTop: 4,
  },
  heroGuideButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4dabf7",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroGuideText: {
    color: "#050b1b",
    fontWeight: "700",
  },
  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  heroStatLabel: {
    color: "#9099c8",
    fontSize: 12,
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  collectionSection: {
    marginTop: 24,
    gap: 12,
  },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  collectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  collectionSubtitle: {
    color: "#8f96bb",
    fontSize: 12,
    marginTop: 2,
  },
  collectionLink: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  collectionRow: {
    paddingHorizontal: 20,
    gap: 14,
  },
  featuredCard: {
    width: 220,
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
  },
  featuredImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    padding: 14,
    gap: 6,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  featuredName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  featuredMeta: {
    color: "#d3d8f6",
    fontSize: 12,
  },
  featuredStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featuredStatText: {
    color: "#fff",
    fontSize: 12,
  },
  featuredDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  busyRow: {
    paddingHorizontal: 20,
    gap: 12,
  },
  busyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0f1425",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  busyName: {
    color: "#fff",
    fontWeight: "600",
  },
  busyMeta: {
    color: "#9ca4c7",
    fontSize: 12,
  },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0c1020",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4dabf7",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#0c1020",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: "#4dabf7",
    borderColor: "#4dabf7",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sortRow: {
    marginHorizontal: 20,
    marginTop: 18,
    flexDirection: "column",
    gap: 10,
  },
  resultsText: {
    color: "#b5bedf",
  },
  sortChips: {
    flexDirection: "row",
    gap: 10,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sortChipActive: {
    backgroundColor: "#4dabf7",
    borderColor: "#4dabf7",
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  heroVenue: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 26,
    overflow: "hidden",
  },
  heroVenueImage: {
    width: "100%",
    height: 280,
    justifyContent: "flex-end",
  },
  heroVenueOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
  },
  heroVenueContent: {
    padding: 20,
    gap: 8,
  },
  heroBadgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  heroFeatureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  heroVenueTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  heroVenueSubtitle: {
    color: "#d3d9ff",
    fontSize: 14,
  },
  heroVenueMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  heroMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 999,
  },
  heroMetaText: {
    color: "#fff",
    fontSize: 12,
  },
  venueList: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b1326",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    gap: 12,
  },
  venueRowImage: {
    width: 70,
    height: 70,
    borderRadius: 18,
    overflow: "hidden",
  },
  venueRowImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  venueRowBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 999,
    padding: 4,
  },
  venueRowRank: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  venueRowRankText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  venueRowBody: {
    flex: 1,
    gap: 4,
  },
  venueRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  venueRowTitle: {
    flex: 1,
    color: "#fff",
    fontWeight: "700",
  },
  venueRowType: {
    color: "#8f96bb",
    fontSize: 11,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  venueRowMeta: {
    color: "#b5bedf",
    fontSize: 12,
  },
  venueRowStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  venueRowStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  venueRowStatText: {
    color: "#cfe0ff",
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    gap: 10,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: "#8f96bb",
    textAlign: "center",
    fontSize: 13,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(77,171,247,0.15)",
  },
  emptyButtonText: {
    color: "#4dabf7",
    fontWeight: "600",
  },
});

export default DiscoverScreen;

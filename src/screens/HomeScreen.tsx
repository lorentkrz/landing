"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import VenueCard from "../components/VenueCard";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useVenues } from "../context/VenueContext";
import { useCredits } from "../context/CreditsContext";
import type { Venue } from "../types";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { venues, activeCheckIn, refreshVenues } = useVenues();
  const { credits } = useCredits();

  const [refreshing, setRefreshing] = useState(false);
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([]);
  const [nearbyVenues, setNearbyVenues] = useState<Venue[]>([]);
  const [recentVenues, setRecentVenues] = useState<Venue[]>([]);

  useEffect(() => {
    if (venues && venues.length > 0) {
      setFeaturedVenues(venues.filter((venue) => venue.rating >= 4.7).slice(0, 4));
      setNearbyVenues(venues.slice(0, 4));
      setRecentVenues(venues.slice(2, 6));
    } else {
      setFeaturedVenues([]);
      setNearbyVenues([]);
      setRecentVenues([]);
    }
  }, [venues]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venue: Venue) => {
    navigation.navigate("VenueDetails", { venueId: venue.id });
  };

  const handleScanPress = () => {
    navigation.navigate("Scan");
  };

  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  const renderVenueItem = ({ item }: { item: Venue }) => <VenueCard venue={item} onPress={handleVenuePress} />;
  const renderRecentVenueItem = ({ item }: { item: Venue }) => <VenueCard venue={item} onPress={handleVenuePress} compact />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName || "Guest"}</Text>
          <Text style={styles.headerTitle}>Find your vibe</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.creditsButton} onPress={() => navigation.navigate("Credits")}>
            <Ionicons name="flash" size={16} color="#4dabf7" />
            <Text style={styles.creditsText}>{credits}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
      >
        {activeCheckIn?.venueId ? (
          <View style={styles.activeCheckInContainer}>
            <View style={styles.activeCheckInContent}>
              <Ionicons name="checkmark-circle" size={24} color="#4dabf7" />
              <View style={styles.activeCheckInTextContainer}>
                <Text style={styles.activeCheckInTitle}>You're checked in</Text>
                <Text style={styles.activeCheckInVenue}>
                  {venues.find((v) => v.id === activeCheckIn.venueId)?.name || "Unknown venue"}
                </Text>
              </View>
            </View>
            <Button
              title="View"
              variant="outline"
              size="small"
              onPress={() => navigation.navigate("VenueDetails", { venueId: activeCheckIn.venueId })}
            />
          </View>
        ) : (
          <View style={styles.scanContainer}>
            <View style={styles.scanContent}>
              <View style={styles.scanIconContainer}>
                <Ionicons name="scan-outline" size={24} color="#fff" />
              </View>
              <View style={styles.scanTextContainer}>
                <Text style={styles.scanTitle}>Check in to a venue</Text>
                <Text style={styles.scanSubtitle}>Scan a QR code to connect with others</Text>
              </View>
            </View>
            <Button title="Scan QR" icon="scan-outline" onPress={handleScanPress} />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Venues</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate("Discover")}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#4dabf7" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={featuredVenues}
            renderItem={renderVenueItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.venueList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby You</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => navigation.navigate("Discover")}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#4dabf7" />
            </TouchableOpacity>
          </View>

          <View style={styles.venueGrid}>
            {nearbyVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} onPress={handleVenuePress} style={styles.gridCard} />
            ))}
          </View>
        </View>

        {recentVenues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recently Visited</Text>
            <FlatList
              data={recentVenues}
              renderItem={renderRecentVenueItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentVenueList}
            />
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Venues</Text>
          </View>
        </View>
      </ScrollView>

      {activeCheckIn && venues && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Ionicons name="location-outline" size={14} color="#4dabf7" />
            {venues.find((v) => v.id === activeCheckIn.venueId)?.name || "Unknown venue"}
            <Text style={styles.footerDot}> • </Text>
            <Text>Expires in 1h 45m</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  greeting: {
    color: "#aaa",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  creditsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1f2c",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  creditsText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  activeCheckInContainer: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    margin: 20,
  },
  activeCheckInContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeCheckInTextContainer: {
    marginLeft: 16,
  },
  activeCheckInTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  activeCheckInVenue: {
    color: "#aaa",
  },
  scanContainer: {
    backgroundColor: "#4dabf7",
    padding: 16,
    borderRadius: 12,
    margin: 20,
  },
  scanContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanIconContainer: {
    backgroundColor: "#007acc",
    borderRadius: 20,
    padding: 12,
  },
  scanTextContainer: {
    marginLeft: 16,
  },
  scanTitle: {
    fontWeight: "600",
    color: "#fff",
  },
  scanSubtitle: {
    color: "#fff",
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    color: "#4dabf7",
    fontWeight: "500",
  },
  venueList: {
    marginTop: 16,
  },
  venueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },
  gridCard: {
    width: "48%",
    marginBottom: 16,
  },
  recentVenueList: {
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 20,
  },
  statCard: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  statLabel: {
    color: "#aaa",
  },
  footer: {
    padding: 16,
    backgroundColor: "#222",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  footerDot: {
    color: "#aaa",
  },
});

export default HomeScreen;

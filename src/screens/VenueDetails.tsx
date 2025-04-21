"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, Image, FlatList, StatusBar, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRoute, useNavigation } from "@react-navigation/native"
import Header from "../components/Header"
import Button from "../components/Button"
import UserCard from "../components/UserCard"
import { useVenues } from "../context/VenueContext"
import { useCredits } from "../context/CreditsContext"
import { USERS } from "../data/users"
import type { Venue, User } from "../types"

const VenueDetailsScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { getVenueById, checkInToVenue, activeCheckIn, isLoading } = useVenues()
  const { credits } = useCredits()

  const { venueId } = route.params as { venueId: string } || {}

  if (!venueId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Venue ID not found!</Text>
      </View>
    )
  }

  const [venue, setVenue] = useState<Venue | null>(null)
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isCheckingIn, setIsCheckingIn] = useState(false)

  useEffect(() => {
    const venueDetails = getVenueById(venueId)
    if (venueDetails) {
      setVenue(venueDetails)
      setIsCheckedIn(venueDetails.isCheckedIn || false)
    }

    const mockActiveUsers = USERS.slice(0, 5)
    setActiveUsers(mockActiveUsers)
  }, [venueId, getVenueById])

  const handleCheckIn = async () => {
    if (!venue) return

    setIsCheckingIn(true)
    try {
      await checkInToVenue(venue.id)
      setIsCheckedIn(true)
    } catch (error) {
      console.error("Check-in error:", error)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleUserPress = (user: User) => {
    if (!isCheckedIn) {
      return
    }

    navigation.navigate(
      "Chat" as never,
      {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.avatar,
        isNewChat: true,
      } as never,
    )
  }

  const renderUserItem = ({ item }: { item: User }) => <UserCard user={item} onPress={() => handleUserPress(item)} />

  if (!venue) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Loading venue details...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header title={venue.name} showBackButton transparent />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image source={{ uri: venue.coverImage || venue.image }} style={styles.coverImage} />
          <View style={styles.overlay} />
          <View style={styles.heroContent}>
            <View style={styles.venueInfo}>
              <Text style={styles.venueName}>{venue.name}</Text>
              <View style={styles.venueMetaRow}>
                <Text style={styles.venueType}>{venue.type}</Text>
                <Text style={styles.dot}>•</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{venue.rating}</Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#aaa" />
                <Text style={styles.locationText}>
                  {venue.address}, {venue.city}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{venue.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {venue.features?.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4dabf7" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>People Here</Text>
              <Text style={styles.peopleCount}>{venue.activeUsers} people</Text>
            </View>

            {activeUsers.length > 0 ? (
              <FlatList
                data={activeUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyPeopleContainer}>
                <Text style={styles.emptyPeopleText}>No one is checked in right now</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color="#4dabf7" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Opening Hours</Text>
                  <Text style={styles.detailValue}>{venue.openHours || "Not specified"}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color="#4dabf7" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>
                    {venue.address}, {venue.city}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={20} color="#4dabf7" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Contact</Text>
                  <Text style={styles.detailValue}>+355 69 123 4567</Text>
                </View>
              </View>
            </View>
          </View>

          {!isCheckedIn && (
            <View style={styles.checkInContainer}>
              <Button
                title={isCheckingIn ? "Checking in..." : "Check In"}
                icon="location"
                onPress={handleCheckIn}
                disabled={isCheckingIn}
                loading={isCheckingIn}
                fullWidth
              />
              <Text style={styles.checkInInfo}>Check in to connect with others at this venue</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {isCheckedIn && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.creditsContainer}>
              <Ionicons name="flash" size={16} color="#4dabf7" />
              <Text style={styles.creditsText}>{credits} credits</Text>
            </View>
            <Button
              title="Connect with People"
              icon="people"
              onPress={() => navigation.navigate("PeopleAtVenue" as never, { venueId: venue.id } as never)}
              style={styles.connectButton}
            />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e17",
  },
  loadingText: {
    color: "#aaa",
    marginTop: 12,
  },
  heroContainer: {
    height: 250,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  venueInfo: {},
  venueName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  venueMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  venueType: {
    color: "#fff",
    fontSize: 16,
  },
  dot: {
    color: "#fff",
    fontSize: 16,
    marginHorizontal: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "#aaa",
    fontSize: 14,
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  checkInContainer: {
    marginBottom: 24,
  },
  checkInInfo: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    color: "#aaa",
    fontSize: 14,
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  peopleCount: {
    color: "#aaa",
    fontSize: 14,
  },
  emptyPeopleContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  emptyPeopleText: {
    color: "#aaa",
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 16,
  },
  detailLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  detailValue: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    backgroundColor: "#1a1f2c",
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  creditsText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
  },
  connectButton: {
    backgroundColor: "#4dabf7",
    width: 150,
    marginLeft: "auto",
  },
})

export default VenueDetailsScreen

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Header from "../components/Header"
import UserCard from "../components/UserCard"
import { useVenues } from "../context/VenueContext"
import { USERS } from "../data/users"
import type { User, Venue } from "../types"

const VenueRoomScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()

  // Safely extract venueId from route params
  const { venueId } = route.params as { venueId?: string }

  if (!venueId) {
    // Handle case where venueId is missing
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: venueId is missing!</Text>
      </View>
    )
  }

  const { getVenueById } = useVenues()

  const [venue, setVenue] = useState<Venue | null>(null)
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const venueDetails = getVenueById(venueId)
    if (venueDetails) {
      setVenue(venueDetails)
    } else {
      setVenue(null)
    }

    // Mock active users data (replace with real data in production)
    const mockActiveUsers = USERS.slice(0, 5)
    setActiveUsers(mockActiveUsers)

    setIsLoading(false)
  }, [venueId, getVenueById])

  const handleUserPress = (user: User) => {
    navigation.navigate("Chat" as never, {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar,
      isNewChat: true,
    } as never)
  }

  const renderUserItem = ({ item }: { item: User }) => (
    <UserCard user={item} onPress={() => handleUserPress(item)} />
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Loading venue room...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header title={venue?.name || "Venue Room"} showBackButton transparent />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Text style={styles.venueName}>{venue?.name}</Text>
          <Text style={styles.venueDescription}>{venue?.description}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Users</Text>
            {activeUsers.length > 0 ? (
              <FlatList
                data={activeUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active users in this venue room right now</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  errorText: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  heroContainer: {
    padding: 20,
    backgroundColor: "#1a1f2c",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1f2c",
  },
  venueName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  venueDescription: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1f2c",
    borderRadius: 16,
    padding: 20,
  },
  emptyText: {
    color: "#aaa",
    fontSize: 16,
  },
})

export default VenueRoomScreen

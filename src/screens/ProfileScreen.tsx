"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Share,
  Linking,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Header from "../components/Header"
import Button from "../components/Button"
import { useAuth } from "../context/AuthContext"
import { useCredits } from "../context/CreditsContext"

const ProfileScreen = () => {
  const navigation = useNavigation()
  const { user, logout } = useAuth()
  const { credits } = useCredits()

  const [activeTab, setActiveTab] = useState("about")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [privacyEnabled, setPrivacyEnabled] = useState(false)
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data for demonstration
  const [userStats, setUserStats] = useState({
    checkIns: 26,
    connections: 142,
    venues: 18,
  })

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    // Simulate API call to fetch user data
    setIsLoading(true)
    // In a real app, you would fetch user data from your API
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const onRefresh = async () => {
    setIsRefreshing(true)
    await fetchUserData()
    setIsRefreshing(false)
  }

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            setIsLoading(true)
            await logout()
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          } catch (error) {
            Alert.alert("Error", "Failed to logout. Please try again.")
          } finally {
            setIsLoading(false)
          }
        },
      },
    ])
  }

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my profile on Nata: ${user?.firstName} ${user?.lastName}`,
        // In a real app, you would include a deep link to your profile
        url: "https://nata.app/profile/" + user?.id,
      })
    } catch (error) {
      Alert.alert("Error", "Failed to share profile")
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account? This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // In a real app, you would call an API to delete the account
          Alert.alert(
            "Account Deletion",
            "Your account deletion request has been submitted. We'll process it within 24 hours.",
          )
        },
      },
    ])
  }

  const handleContactSupport = () => {
    // In a real app, you would open an email client or in-app support chat
    Linking.openURL("mailto:support@nata.app?subject=Support%20Request")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "about":
        return (
          <View style={styles.tabContent}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Bio</Text>
              <Text style={styles.infoValue}>{user?.bio || "No bio yet"}</Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {user?.city || "City"}, {user?.country || "Country"}
              </Text>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>March 2023</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.checkIns}</Text>
                <Text style={styles.statLabel}>Check-ins</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.connections}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.venues}</Text>
                <Text style={styles.statLabel}>Venues</Text>
              </View>
            </View>

            <View style={styles.creditsContainer}>
              <View style={styles.creditsHeader}>
                <Text style={styles.creditsTitle}>Your Credits</Text>
                <TouchableOpacity style={styles.buyCreditsButton} onPress={() => navigation.navigate("Credits")}>
                  <Text style={styles.buyCreditsText}>Buy More</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.creditsCard}>
                <View style={styles.creditsIconContainer}>
                  <Ionicons name="flash" size={24} color="#4dabf7" />
                </View>
                <View style={styles.creditsInfo}>
                  <Text style={styles.creditsValue}>{credits}</Text>
                  <Text style={styles.creditsLabel}>Available Credits</Text>
                </View>
              </View>
            </View>

            <View style={styles.activitySection}>
              <Text style={styles.activityTitle}>Recent Activity</Text>
              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Ionicons name="location" size={16} color="#4dabf7" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    You checked in at <Text style={styles.activityHighlight}>Skybar Lounge</Text>
                  </Text>
                  <Text style={styles.activityTime}>2 days ago</Text>
                </View>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  <Ionicons name="people" size={16} color="#4dabf7" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    You connected with <Text style={styles.activityHighlight}>Alex</Text> and 3 others
                  </Text>
                  <Text style={styles.activityTime}>1 week ago</Text>
                </View>
              </View>
            </View>
          </View>
        )
      case "photos":
        return (
          <View style={styles.photosContainer}>
            <View style={styles.photosHeader}>
              <Text style={styles.photosTitle}>My Photos</Text>
              <TouchableOpacity style={styles.addPhotoButton}>
                <Ionicons name="add-circle" size={24} color="#4dabf7" />
                <Text style={styles.addPhotoText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.photosGrid}>
              {Array(9)
                .fill(0)
                .map((_, index) => (
                  <TouchableOpacity key={index} style={styles.photoItem}>
                    <Image
                      source={{ uri: `https://images.unsplash.com/photo-${1550000000000 + index}?q=80&w=400` }}
                      style={styles.photo}
                    />
                    {index === 0 && (
                      <TouchableOpacity style={styles.setProfilePhotoButton}>
                        <Text style={styles.setProfilePhotoText}>Profile</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )
      case "settings":
        return (
          <View style={styles.settingsContainer}>
            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Account</Text>

              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("EditProfile")}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="person-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Privacy</Text>
                </View>
                <Switch
                  value={privacyEnabled}
                  onValueChange={setPrivacyEnabled}
                  trackColor={{ false: "#1a1f2c", true: "#4dabf7" }}
                  thumbColor="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="notifications-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: "#1a1f2c", true: "#4dabf7" }}
                  thumbColor="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="moon-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Dark Mode</Text>
                </View>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={setDarkModeEnabled}
                  trackColor={{ false: "#1a1f2c", true: "#4dabf7" }}
                  thumbColor="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("ChangePassword")}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="key-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={handleShareProfile}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="share-social-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Share Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingSection}>
              <Text style={styles.settingSectionTitle}>Support</Text>

              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("HelpCenter")}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="help-circle-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Help Center</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Contact Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("About")}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="information-circle-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>About</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={() => Linking.openURL("https://nata.app/privacy")}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="document-text-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItem} onPress={() => Linking.openURL("https://nata.app/terms")}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: "rgba(77, 171, 247, 0.1)" }]}>
                    <Ionicons name="document-outline" size={20} color="#4dabf7" />
                  </View>
                  <Text style={styles.settingText}>Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            <Button
              title="Log Out"
              variant="outline"
              onPress={handleLogout}
              style={styles.logoutButton}
              textStyle={styles.logoutText}
              fullWidth
              loading={isLoading}
            />

            <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteAccountText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        )
      default:
        return null
    }
  }

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header title="Profile" rightIcon="settings-outline" onRightIconPress={() => setActiveTab("settings")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
      >
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887" }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>
            {user?.firstName || "John"} {user?.lastName || "Doe"}
          </Text>
          <View style={styles.profileMeta}>
            <Text style={styles.profileAge}>{user?.age || 25}</Text>
            <Text style={styles.profileDot}>•</Text>
            <Text style={styles.profileGender}>{user?.gender || "Not specified"}</Text>
          </View>

          <View style={styles.profileActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("EditProfile")}>
              <View style={styles.actionButtonGradient}>
                <Ionicons name="create-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Credits")}>
              <View style={styles.actionButtonOutline}>
                <Ionicons name="flash-outline" size={20} color="#4dabf7" />
              </View>
              <Text style={styles.actionButtonText}>Credits</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShareProfile}>
              <View style={styles.actionButtonOutline}>
                <Ionicons name="share-social-outline" size={20} color="#4dabf7" />
              </View>
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "about" && styles.activeTab]}
            onPress={() => setActiveTab("about")}
          >
            <Text style={[styles.tabText, activeTab === "about" && styles.activeTabText]}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "photos" && styles.activeTab]}
            onPress={() => setActiveTab("photos")}
          >
            <Text style={[styles.tabText, activeTab === "photos" && styles.activeTabText]}>Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "settings" && styles.activeTab]}
            onPress={() => setActiveTab("settings")}
          >
            <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {renderTabContent()}
      </ScrollView>

      {/* Session indicator */}
      <View style={styles.sessionIndicator}>
        <Ionicons name="wifi" size={14} color="#4dabf7" />
        <Text style={styles.sessionText}>Active session</Text>
      </View>
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
    backgroundColor: "#0a0e17",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  profileAge: {
    color: "#aaa",
    fontSize: 16,
  },
  profileDot: {
    color: "#aaa",
    marginHorizontal: 5,
  },
  profileGender: {
    color: "#aaa",
    fontSize: 16,
  },
  profileActions: {
    flexDirection: "row",
    marginTop: 15,
  },
  actionButton: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  actionButtonGradient: {
    backgroundColor: "#4dabf7",
    padding: 10,
    borderRadius: 50,
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: "#4dabf7",
    padding: 10,
    borderRadius: 50,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    color: "#aaa",
    fontSize: 18,
    fontWeight: "600",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4dabf7",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    paddingHorizontal: 15,
  },
  infoSection: {
    marginBottom: 15,
  },
  infoLabel: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    marginVertical: 20,
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: "#1a1f2c",
    height: 50,
    marginHorizontal: 10,
  },
  creditsContainer: {
    marginTop: 20,
  },
  creditsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  creditsTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  buyCreditsButton: {
    padding: 5,
  },
  buyCreditsText: {
    color: "#4dabf7",
    fontSize: 14,
    fontWeight: "600",
  },
  creditsCard: {
    marginTop: 15,
    flexDirection: "row",
    backgroundColor: "#1a1f2c",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  creditsIconContainer: {
    backgroundColor: "rgba(77, 171, 247, 0.1)",
    padding: 12,
    borderRadius: 50,
  },
  creditsInfo: {
    marginLeft: 15,
  },
  creditsValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  creditsLabel: {
    color: "#aaa",
    fontSize: 14,
  },
  activitySection: {
    marginTop: 25,
    marginBottom: 20,
  },
  activityTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: "row",
    marginBottom: 15,
  },
  activityIconContainer: {
    backgroundColor: "rgba(77, 171, 247, 0.1)",
    padding: 8,
    borderRadius: 50,
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: "#fff",
    fontSize: 14,
  },
  activityHighlight: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  activityTime: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 3,
  },
  photosContainer: {
    paddingHorizontal: 15,
  },
  photosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  photosTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  addPhotoText: {
    color: "#4dabf7",
    marginLeft: 5,
    fontWeight: "600",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoItem: {
    width: "31%",
    marginBottom: 10,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  setProfilePhotoButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(77, 171, 247, 0.8)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  setProfilePhotoText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  settingsContainer: {
    padding: 15,
  },
  settingSection: {
    marginBottom: 20,
  },
  settingSectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    padding: 10,
    borderRadius: 50,
  },
  settingText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  logoutButton: {
    marginTop: 20,
    borderColor: "#e74c3c",
  },
  logoutText: {
    color: "#e74c3c",
  },
  deleteAccountButton: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  deleteAccountText: {
    color: "#e74c3c",
    fontSize: 14,
  },
  sessionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#1a1f2c",
  },
  sessionText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
  },
})

export default ProfileScreen

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useCredits } from "../context/CreditsContext";
import { useReferrals } from "../context/ReferralContext";
import type { Referral } from "../types";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import { useAppNavigation } from "../navigation/useAppNavigation";

type ProfilePhoto = {
  id: string;
  imageUrl: string;
  isProfile: boolean;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

const ProfileScreen = () => {
  const navigation = useAppNavigation();
  const { user, logout } = useAuth();
  const { credits } = useCredits();
  const { referrals, createInvite, shareBaseUrl, inviterReward, inviteeReward, isLoading: isReferralsLoading } = useReferrals();

  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ checkIns: 0, connections: 0, venues: 0 });

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) return;
    await Promise.all([fetchPhotos(), fetchActivity(), fetchStats(), fetchPreferences()]);
  };

  const fetchPhotos = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("profile_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setPhotos(
        data.map((photo) => ({
          id: photo.id,
          imageUrl: photo.image_url,
          isProfile: photo.is_profile,
        })),
      );
    }
  };

  const fetchActivity = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);
    if (!error && data) {
      setActivity(
        data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? "",
          createdAt: new Date(item.created_at).toLocaleString(),
        })),
      );
    }
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    const [{ count: checkIns = 0 }, { count: connections = 0 }, { data: venueRows }] = await Promise.all([
      supabase.from("check_ins").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("contact_book").select("*", { count: "exact", head: true }).eq("owner_id", user.id),
      supabase.from("check_ins").select("venue_id").eq("user_id", user.id),
    ]);
    const uniqueVenues = new Set((venueRows ?? []).map((row) => row.venue_id)).size;
    setStats({ checkIns, connections, venues: uniqueVenues });
  };

  const fetchPreferences = async () => {
    if (!user?.id) return;
    const { data } = await supabase.from("profiles").select("notifications_enabled, is_private").eq("id", user.id).single();
    if (data) {
      setNotificationsEnabled(data.notifications_enabled ?? true);
      setIsPrivate(data.is_private ?? false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfileData();
    setIsRefreshing(false);
  };

  const handleTogglePreference = async (field: "notifications_enabled" | "is_private", value: boolean) => {
    if (!user?.id) return;
    const { error } = await supabase.from("profiles").update({ [field]: value }).eq("id", user.id);
    if (error) {
      Alert.alert("Update failed", "Please try again.");
      return;
    }
    if (field === "notifications_enabled") {
      setNotificationsEnabled(value);
    } else {
      setIsPrivate(value);
    }
  };

  const getStatusColor = (status: Referral["status"]) => {
    switch (status) {
      case "rewarded":
        return "#34d399";
      case "joined":
        return "#60a5fa";
      case "revoked":
        return "#fb7185";
      default:
        return "#fbbf24";
    }
  };

  const statusLabel: Record<Referral["status"], string> = {
    pending: "Waiting",
    joined: "Joined",
    rewarded: "Rewarded",
    revoked: "Revoked",
  };

  const handleInviteFriend = async () => {
    const invite = await createInvite();
    if (!invite) return;
    const link = `${shareBaseUrl}?code=${invite.code}`;
    try {
      await Share.share({
        message: `Join me on Nataa! Use my code ${invite.code} for bonus credits: ${link}`,
        url: link,
        title: "Join me on Nataa",
      });
    } catch (error) {
      console.warn("Invite share cancelled", error);
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Find me on Nataa: ${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
        url: "https://nata.app/profile/" + user?.id,
      });
    } catch {
      Alert.alert("Error", "Failed to share profile");
    }
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Allow photo access to upload images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !user?.id) return;
    const asset = result.assets[0];
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const path = `${user.id}/${Date.now()}.${asset.fileName?.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("profile_photos").upload(path, blob);
    if (error) {
      Alert.alert("Upload failed", "Unable to upload image.");
      return;
    }
    const { data } = supabase.storage.from("profile_photos").getPublicUrl(path);
    await supabase.from("profile_photos").insert({
      user_id: user.id,
      image_url: data.publicUrl,
    });
    fetchPhotos();
  };

  const handleSetProfilePhoto = async (photo: ProfilePhoto) => {
    if (!user?.id) return;
    await supabase
      .from("profile_photos")
      .update({ is_profile: false })
      .eq("user_id", user.id);
    await supabase
      .from("profile_photos")
      .update({ is_profile: true })
      .eq("id", photo.id);
    await supabase.from("profiles").update({ avatar_url: photo.imageUrl }).eq("id", user.id);
    fetchPhotos();
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
          navigation.navigate("Onboarding");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "Are you sure? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => Alert.alert("Account Deletion", "We'll process your request within 24 hours."),
      },
    ]);
  };

  const photoGrid = useMemo(() => photos.slice(0, 9), [photos]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#4dabf7" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <TouchableOpacity style={styles.heroIcon} onPress={() => navigation.navigate("EditProfile")}>
              <Ionicons name="pencil" size={18} color="#0b1023" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroIcon} onPress={handleShareProfile}>
              <Ionicons name="share-social" size={18} color="#0b1023" />
            </TouchableOpacity>
          </View>
          <View style={styles.heroContent}>
            <Image
              source={{
                uri:
                  photos.find((photo) => photo.isProfile)?.imageUrl ??
                  user?.avatar ??
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop",
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.meta}>
              {user?.city ?? "Add city"} • {user?.country ?? "Add country"}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.checkIns}</Text>
                <Text style={styles.statLabel}>Check-ins</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.connections}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{credits}</Text>
                <Text style={styles.statLabel}>Credits</Text>
              </View>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate("Credits")}>
                <Ionicons name="card" size={16} color="#0b1023" />
                <Text style={styles.quickButtonText}>Credits</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate("EditProfile")}>
                <Ionicons name="person-circle" size={16} color="#0b1023" />
                <Text style={styles.quickButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickButton} onPress={() => navigation.navigate("HelpCenter")}>
                <Ionicons name="help-buoy" size={16} color="#0b1023" />
                <Text style={styles.quickButtonText}>Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Invite friends</Text>
            <Text style={styles.sectionSubtitle}>
              +{inviterReward} credits for you • +{inviteeReward} for them
            </Text>
          </View>
          <TouchableOpacity onPress={handleInviteFriend} style={styles.inviteButton}>
            <Ionicons name="gift" size={18} color="#0a0e17" />
            <Text style={styles.inviteButtonText}>Invite</Text>
          </TouchableOpacity>
        </View>
        {isReferralsLoading ? (
          <Text style={styles.sectionBody}>Loading invites...</Text>
        ) : referrals.length === 0 ? (
          <Text style={styles.sectionBody}>Share your link and earn free credits when friends join.</Text>
        ) : (
          <View style={{ marginTop: 14 }}>
            {[referrals[0]].map((referral) => (
              <View key={referral.id} style={styles.referralRow}>
                <View>
                  <Text style={styles.referralCode}>{referral.code}</Text>
                  <Text style={styles.referralMeta}>
                    {referral.inviteeContact ?? "No contact"} • {new Date(referral.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.referralStatusChip, { backgroundColor: getStatusColor(referral.status) }]}>
                  <Text style={styles.referralStatusText}>{statusLabel[referral.status]}</Text>
                </View>
              </View>
            ))}
            {referrals.length > 1 ? (
              <Text style={styles.sectionBody}>{referrals.length - 1}+ invites already created</Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Photo roll</Text>
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
              <Ionicons name="add" size={18} color="#4dabf7" />
              <Text style={styles.addPhotoText}>Add photo</Text>
            </TouchableOpacity>
          </View>
          {photoGrid.length ? (
            <View style={styles.photoGrid}>
              {photoGrid.map((photo) => (
                <TouchableOpacity key={photo.id} style={styles.photoItem} onPress={() => handleSetProfilePhoto(photo)}>
                  <Image source={{ uri: photo.imageUrl }} style={styles.photo} />
                  {photo.isProfile && (
                    <View style={styles.profileBadge}>
                      <Ionicons name="star" size={12} color="#fff" />
                      <Text style={styles.profileBadgeText}>Profile</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionBody}>Add photos from your nights out to showcase your vibe.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <FlatList
            data={activity}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.activityRow}>
                <Ionicons name="sparkles-outline" size={20} color="#fff" />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDescription}>{item.description}</Text>
                  <Text style={styles.activityMeta}>{item.createdAt}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.sectionBody}>Your recent activity will appear here.</Text>}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.preferenceTitle}>Notifications</Text>
              <Text style={styles.preferenceSubtitle}>Get notified about messages and requests.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => handleTogglePreference("notifications_enabled", value)}
              trackColor={{ true: "#4dabf7", false: "#2b314d" }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.preferenceTitle}>Private profile</Text>
              <Text style={styles.preferenceSubtitle}>Hide from venue rooms unless you connect.</Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={(value) => handleTogglePreference("is_private", value)}
              trackColor={{ true: "#4dabf7", false: "#2b314d" }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.preferenceTitle}>Dark mode</Text>
              <Text style={styles.preferenceSubtitle}>Always use the dark theme.</Text>
            </View>
            <Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} trackColor={{ true: "#4dabf7", false: "#2b314d" }} thumbColor="#fff" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.supportRow} onPress={() => navigation.navigate("HelpCenter")}>
            <Ionicons name="help-circle-outline" size={20} color="#fff" />
            <Text style={styles.supportText}>Help Center</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportRow} onPress={() => Linking.openURL("mailto:support@nata.app?subject=Support%20Request")}>
            <Ionicons name="mail-outline" size={20} color="#fff" />
            <Text style={styles.supportText}>Contact support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button
            title="Manage credits"
            onPress={() => navigation.navigate("Credits")}
            variant="ghost"
            style={styles.accountButton}
            textStyle={styles.accountButtonText}
          />
          <Button
            title="Delete account"
            onPress={handleDeleteAccount}
            variant="ghost"
            style={[styles.accountButton, styles.accountDanger]}
            textStyle={[styles.accountButtonText, styles.accountDangerText]}
          />
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="ghost"
            style={[styles.accountButton, styles.accountDanger]}
            textStyle={[styles.accountButtonText, styles.accountDangerText]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030612",
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#0e1327",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4dabf7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4dabf7",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  heroContent: {
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14,
  },
  meta: {
    color: "#8b92c5",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#101632",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  statLabel: {
    color: "#8e95bd",
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  quickButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1f2b55",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  quickButtonText: {
    color: "#dfe7ff",
    fontWeight: "700",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionSubtitle: {
    color: "#8c93c1",
    marginTop: 4,
  },
  sectionBody: {
    color: "#d0d5f2",
    marginTop: 8,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4dabf7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  inviteButtonText: {
    color: "#0a0e17",
    fontWeight: "700",
  },
  referralRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  referralCode: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  referralMeta: {
    color: "#8e95bd",
    fontSize: 12,
    marginTop: 2,
  },
  referralStatusChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  referralStatusText: {
    color: "#0a0e17",
    fontWeight: "700",
    fontSize: 12,
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addPhotoText: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  photoItem: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  profileBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  profileBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  activityRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  activityDescription: {
    color: "#c3c7ea",
    marginTop: 2,
  },
  activityMeta: {
    color: "#8e95bd",
    fontSize: 12,
    marginTop: 4,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  preferenceTitle: {
    color: "#fff",
    fontWeight: "600",
  },
  preferenceSubtitle: {
    color: "#8c93c1",
    fontSize: 12,
    marginTop: 2,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  supportText: {
    color: "#fff",
    fontSize: 15,
  },
  deleteButton: {
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 16,
    borderColor: "#ff7676",
  },
  accountButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0e1327",
    marginTop: 10,
  },
  accountButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  accountDanger: {
    borderColor: "rgba(255,118,118,0.4)",
    backgroundColor: "rgba(255,118,118,0.08)",
  },
  accountDangerText: {
    color: "#ff7676",
  },
});

export default ProfileScreen;

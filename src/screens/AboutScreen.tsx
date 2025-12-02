"use client";

import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../navigation/useAppNavigation";

const aboutLinks = [
  { title: "Privacy Policy", icon: "document-text-outline", url: "https://nata.app/privacy" },
  { title: "Terms of Service", icon: "document-outline", url: "https://nata.app/terms" },
  { title: "Contact Us", icon: "mail-outline", url: "https://nata.app/contact" },
  { title: "Website", icon: "globe-outline", url: "https://nata.app" },
] as const;

const socials = [
  { icon: "logo-instagram", url: "https://instagram.com/nataapp" },
  { icon: "logo-twitter", url: "https://twitter.com/nataapp" },
  { icon: "logo-tiktok", url: "https://tiktok.com/@nataapp" },
] as const;

const AboutScreen = () => {
  const navigation = useAppNavigation();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Nataa</Text>
          <View style={{ width: 40 }} />
        </View>

        <LinearGradient colors={["#1b1f3d", "#080a16"]} style={styles.hero}>
          <View>
            <Text style={styles.appName}>Nataa</Text>
            <Text style={styles.appTagline}>Nightlife, reimagined.</Text>
          </View>
          <View style={styles.versionPill}>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our story</Text>
          <Text style={styles.sectionBody}>
            Nataa connects you to the rooms that matter. We craft premium experiences by blending check-ins, live guest lists, and timed chats,
            so every night feels curated and safe.
          </Text>
        </View>

                <View style={styles.section}>
          <Text style={styles.sectionTitle}>What we stand for</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>24/7</Text>
              <Text style={styles.metricLabel}>Support</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>12</Text>
              <Text style={styles.metricLabel}>Cities</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{"\u221e"}</Text>
              <Text style={styles.metricLabel}>Connections</Text>
            </View>
          </View>
        </View>

        </View>

        <View style={styles.card}>
          {aboutLinks.map((link) => (
            <TouchableOpacity key={link.title} style={styles.linkRow} onPress={() => Linking.openURL(link.url)}>
              <View style={styles.linkLeft}>
                <Ionicons name={link.icon as keyof typeof Ionicons.glyphMap} size={20} color="#4dabf7" />
                <Text style={styles.linkText}>{link.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8e95bd" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow us</Text>
          <View style={styles.socialRow}>
            {socials.map((item) => (
              <TouchableOpacity key={item.icon} style={styles.socialButton} onPress={() => Linking.openURL(item.url)}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.footerText}>(c) {new Date().getFullYear()} Nataa. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#03050f",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#151936",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  hero: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 28,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appName: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  appTagline: {
    color: "#c6cbe3",
    marginTop: 6,
  },
  versionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  versionText: {
    color: "#fff",
    fontWeight: "600",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionBody: {
    color: "#c6cbe3",
    marginTop: 8,
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#0f1425",
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  metricValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  metricLabel: {
    color: "#8f96bb",
    marginTop: 4,
  },
  card: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#0f1425",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
    marginTop: 12,
  },
  socialButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#151936",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#8e95bd",
    textAlign: "center",
    marginTop: 26,
  },
});

export default AboutScreen;

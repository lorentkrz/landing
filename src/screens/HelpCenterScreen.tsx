"use client";

import React, { useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useAppNavigation } from "../navigation/useAppNavigation";

const FAQS = [
  {
    id: 1,
    question: "How do credits work?",
    answer:
      "Credits power everything in Nataa. Use them to start chats, boost your profile, or extend conversations. Buy them directly from the Credits screen.",
  },
  {
    id: 2,
    question: "How do I change my password?",
    answer: "Go to Profile → Account → Change Password to update your credentials securely.",
  },
  {
    id: 3,
    question: "What are check-ins?",
    answer: "Scan the venue QR code to check in. Once checked in, you unlock the live guest list for that venue for a limited time.",
  },
  {
    id: 4,
    question: "How do I report a user?",
    answer: "Open their profile, tap the more icon, and choose Report. For urgent issues, contact support directly.",
  },
] as const;

const quickActions = [
  { icon: "flash-outline", label: "Credits help", link: "mailto:support@nata.app?subject=Credits" },
  { icon: "shield-checkmark-outline", label: "Safety tips", link: "https://nata.app/safety" },
  { icon: "chatbubbles-outline", label: "Live chat", link: "mailto:support@nata.app?subject=Live%20support" },
] as const;

const HelpCenterScreen = () => {
  const navigation = useAppNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter((faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Help Center</Text>
          <View style={{ width: 40 }} />
        </View>

        <LinearGradient colors={["#1c1f3f", "#080a16"]} style={styles.hero}>
          <View>
            <Text style={styles.heroTitle}>Need help?</Text>
            <Text style={styles.heroSubtitle}>Search FAQs, contact support, or report an issue.</Text>
          </View>
          <Ionicons name="help-circle-outline" size={36} color="#fff" />
        </LinearGradient>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#8e95bd" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles"
            placeholderTextColor="#8e95bd"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#8e95bd" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.quickRow}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.label} style={styles.quickCard} onPress={() => Linking.openURL(action.link)}>
              <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={20} color="#fff" />
              <Text style={styles.quickText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Frequently asked</Text>
        {filteredFaqs.length ? (
          filteredFaqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity style={styles.faqHeader} onPress={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons name={openFAQ === faq.id ? "chevron-up" : "chevron-down"} size={18} color="#9aa3c3" />
              </TouchableOpacity>
              {openFAQ === faq.id && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </View>
          ))
        ) : (
          <Text style={styles.emptyFaq}>No results for “{searchQuery}”. Try another keyword.</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need more help?</Text>
          <Text style={styles.sectionBody}>Can't find what you're looking for? Email us and we’ll respond within 24 hours.</Text>
          <Button
            title="Contact support"
            icon="mail-outline"
            onPress={() => Linking.openURL("mailto:support@nata.app?subject=Support%20Request")}
            style={styles.supportButton}
          />
        </View>
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
    justifyContent: "space-between",
    alignItems: "center",
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
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  hero: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#c6cbe3",
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11162b",
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
  },
  quickRow: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#0f1425",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  quickText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 24,
    paddingHorizontal: 20,
  },
  faqItem: {
    marginHorizontal: 20,
    backgroundColor: "#101632",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    color: "#fff",
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    color: "#c5caea",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyFaq: {
    color: "#8e95bd",
    paddingHorizontal: 20,
    marginTop: 12,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionBody: {
    color: "#c5caea",
    marginTop: 6,
    lineHeight: 20,
  },
  supportButton: {
    marginTop: 16,
  },
});

export default HelpCenterScreen;

"use client";

import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { supabase } from "../lib/supabase";

type GuideStep = {
  title: string;
  description: string;
};

type GuideContent = {
  title: string;
  subtitle?: string | null;
  steps: GuideStep[];
  mediaUrl?: string | null;
};

const fallbackGuide: GuideContent = {
  title: "How to check in",
  subtitle: "Scan the venue QR to unlock rooms, offers, and the live feed.",
  mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=800&fit=crop",
  steps: [
    { title: "Find the scanner", description: "Look for the Nataa QR podium near the entrance or ask a host." },
    { title: "Open Scan", description: "Tap the Scan tab and point your camera steadily at the QR." },
    { title: "Wait for the pulse", description: "You’ll feel a quick vibration once the venue unlocks." },
    { title: "Enjoy perks", description: "Redeem offers, chat with guests, and keep your night organized." },
  ],
};

const normalizeSteps = (raw: unknown): GuideStep[] => {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (item && typeof item === "object") {
          const maybeTitle = "title" in item ? String((item as any).title ?? "") : "";
          const maybeDescription = "description" in item ? String((item as any).description ?? "") : "";
          if (maybeTitle.trim().length === 0) return null;
          return { title: maybeTitle, description: maybeDescription };
        }
        return null;
      })
      .filter(Boolean) as GuideStep[];
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return normalizeSteps(parsed);
    } catch {
      return [];
    }
  }

  return [];
};

const HowToCheckInScreen = () => {
  const navigation = useAppNavigation();
  const [guide, setGuide] = useState<GuideContent>(fallbackGuide);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const { data, error } = await supabase.from("app_guides").select("*").eq("slug", "how-to-check-in").maybeSingle();
        if (error || !data) {
          setGuide(fallbackGuide);
          return;
        }

        const parsedSteps = normalizeSteps(data.steps);

        setGuide({
          title: data.title,
          subtitle: data.subtitle,
          mediaUrl: data.media_url,
          steps: parsedSteps.length ? parsedSteps : fallbackGuide.steps,
        });
      } catch {
        setGuide(fallbackGuide);
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {loading ? (
        <View style={[styles.safeArea, styles.center]}>
          <ActivityIndicator size="large" color="#4dabf7" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>How to check in</Text>
            <View style={{ width: 36 }} />
          </View>

          <View style={styles.heroCard}>
            <ImageBackground source={{ uri: guide.mediaUrl ?? fallbackGuide.mediaUrl! }} style={styles.heroImage}>
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>{guide.title}</Text>
                {guide.subtitle ? <Text style={styles.heroSubtitle}>{guide.subtitle}</Text> : null}
                <View style={styles.heroMetaRow}>
                  <View style={styles.heroMetaPill}>
                    <Ionicons name="qr-code-outline" size={16} color="#fff" />
                    <Text style={styles.heroMetaText}>QR + GPS verified</Text>
                  </View>
                  <View style={styles.heroMetaPill}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
                    <Text style={styles.heroMetaText}>Security-protected</Text>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.stepsSection}>
            {guide.steps.map((step, index) => (
              <View key={`${step.title}-${index}`} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{String(index + 1).padStart(2, "0")}</Text>
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Ready to scan?</Text>
            <Text style={styles.ctaSubtitle}>Tap below to open the scanner and check in to your next venue.</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Scan")} style={styles.ctaButton}>
              <Ionicons name="scan" size={18} color="#050b1b" />
              <Text style={styles.ctaButtonText}>Open scanner</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#03050f",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroImage: {
    height: 260,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroContent: {
    padding: 20,
    gap: 6,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#d0d5f2",
  },
  heroMetaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  heroMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  heroMetaText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  stepsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 14,
  },
  stepRow: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(77,171,247,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#4dabf7",
    fontWeight: "700",
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stepDescription: {
    color: "#9ca4c9",
    lineHeight: 20,
  },
  ctaCard: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#0f1425",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 6,
  },
  ctaTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  ctaSubtitle: {
    color: "#8f96bb",
  },
  ctaButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4dabf7",
    borderRadius: 999,
    paddingVertical: 12,
  },
  ctaButtonText: {
    color: "#050b1b",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default HowToCheckInScreen;

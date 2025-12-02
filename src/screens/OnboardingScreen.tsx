"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../components/Button";
import { useAppNavigation } from "../navigation/useAppNavigation";

const { width } = Dimensions.get("window");

// --- Define Cohesive Colors ---
const PRIMARY_DARK_COLOR = "#030612";
const ACCENT_COLOR = "#7ddcff";
const UNIFIED_BACKGROUND_COLOR = "rgba(255, 255, 255, 0.04)";

// --- SLIDES DATA (MODIFIED: Photo 3 URL changed) ---
const SLIDES = [
  {
    id: "1",
    title: "The live nightlife feed",
    description: "See who's lighting up the city right now with heat on the map and live rooms.",
    image: "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?q=80&w=1769",
    icon: "sparkles",
  },
  {
    id: "2",
    title: "Glide through the door",
    description: "Join guest lists, flash your QR, and skip the chaos when you roll up.",
    image: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=1740",
    icon: "scan",
  },
  {
    id: "3",
    title: "Conversations with a timer",
    description: "Short, high-intent chats you can extend with credits when the vibe hits.",
    // --- UPDATED PHOTO 3 ---
    image: "https://images.unsplash.com/photo-1534349767356-b09e861d9a26?q=80&w=1740", 
    icon: "chatbubbles",
  },
] as const;

// --- HIGHLIGHTS DATA (RETAINED) ---
const HIGHLIGHTS = [
  { icon: "navigate", title: "Live pins", copy: "Map updates in real time as venues go live." },
  { icon: "flash", title: "Guest list ready", copy: "Keep your QR pass and credits one tap away." },
  { icon: "chatbubble-ellipses", title: "Social on-fire", copy: "Night-length chats with extensions when you want more." },
] as const;

const OnboardingScreen = () => {
  const navigation = useAppNavigation();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<(typeof SLIDES)[number]>>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
    if (viewableItems.length && typeof viewableItems[0]?.index === "number") {
      setCurrentIndex(viewableItems[0]?.index ?? 0);
    }
  }, []);

  const paginationDots = useMemo(
    () =>
      SLIDES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [6, 20, 6],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: "clamp",
        });
        return <Animated.View key={index.toString()} style={[styles.dot, { width: dotWidth, opacity }]} />;
      }),
    [scrollX],
  );

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      navigation.navigate("Register");
    }
  };

  const handleSkip = () =>
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}> 
      
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={styles.carousel}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 65 }}
        renderItem={({ item, index }) => (
          <View style={styles.slideWrapper}> 
            <ImageBackground 
              source={{ uri: item.image }} 
              style={styles.slide} 
              resizeMode="cover"
              imageStyle={{ top: -30 }} 
            >
              
              <LinearGradient 
                colors={[
                  "rgba(3,6,18,0.0)", 
                  "rgba(3,6,18,0.2)", 
                  "rgba(3,6,18,0.78)", 
                  PRIMARY_DARK_COLOR
                ]} 
                locations={[0.0, 0.4, 0.7, 1.0]} 
                style={styles.overlay} 
              />
              
              <View style={styles.slideContent}>
                <View style={styles.slideTopRow}>
                  <View style={styles.stepPill}>
                    <Text style={styles.stepPillText}>{`0${index + 1} / 0${SLIDES.length}`}</Text>
                  </View>
                  <View style={styles.iconBadge}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={28} color={ACCENT_COLOR} />
                  </View>
                </View>
                <Text style={styles.eyebrow}>Nightlife, live and moving</Text>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideDescription}>{item.description}</Text>
                <View style={styles.slideMetaRow}>
                  <Ionicons name="moon" size={16} color={ACCENT_COLOR} />
                  <Text style={styles.slideMetaText}>Built for after dark</Text>
                </View>
              </View>
            </ImageBackground>

            {/* HEADER OVERLAY: Badge Removed */}
            {index === currentIndex && (
                <View style={[styles.headerOverlay, { paddingTop: Math.max(insets.top, 16), justifyContent: 'flex-end' }]}>
                    {/* BRAND BADGE REMOVED */}
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>
            )}
            
          </View>
        )}
      />

      {/* UNIFIED LOWER SECTION */}
      <View style={styles.unifiedLowerSection}>
        <View style={styles.dotsRow}>{paginationDots}</View>

        <View style={styles.highlightRow}>
          {HIGHLIGHTS.map((item) => (
            <LinearGradient
              key={item.title}
              colors={["rgba(125,220,255,0.16)", "rgba(255,255,255,0.02)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.highlightCard}
            >
              <View style={styles.highlightIconBadge}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={PRIMARY_DARK_COLOR} />
              </View>
              <Text style={styles.highlightTitle}>{item.title}</Text>
              <Text style={styles.highlightCopy}>{item.copy}</Text>
            </LinearGradient>
          ))}
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 16, 32) }]}>
          <Button
            title={currentIndex === SLIDES.length - 1 ? "Create account" : "Next"}
            icon="arrow-forward"
            iconPosition="right"
            onPress={handleNext}
            fullWidth
            style={styles.ctaButton}
            textStyle={styles.ctaButtonText}
          />
          <TouchableOpacity style={styles.loginLink} onPress={handleSkip}>
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_DARK_COLOR,
  },
  carousel: {
    flex: 1, 
  },
  slideWrapper: {
    width,
    flex: 1, 
    position: 'relative',
  },
  slide: {
    width,
    height: "100%", 
    justifyContent: "flex-end",
    backgroundColor: PRIMARY_DARK_COLOR,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  slideContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  
  unifiedLowerSection: {
    backgroundColor: UNIFIED_BACKGROUND_COLOR, 
    paddingTop: 10, 
  },
  
  // --- HEADER OVERLAY ---
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    // ADJUSTED: Only flex-end needed now that the badge is gone
    justifyContent: "flex-end", 
    alignItems: "center",
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  skipText: {
    color: "#fff",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  slideTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    marginBottom: 16,
  },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(3,6,18,0.4)",
  },
  stepPillText: {
    color: "#d7e4ff",
    fontWeight: "700",
    letterSpacing: 0.6,
    fontSize: 12,
  },
  iconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(125,220,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: 'rgba(125,220,255,0.3)',
  },
  eyebrow: {
    color: ACCENT_COLOR,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: '800',
    marginBottom: 8,
  },
  slideTitle: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 0.5,
    lineHeight: 48,
  },
  slideDescription: {
    color: "#c2c7dc",
    marginTop: 18,
    fontSize: 17,
    lineHeight: 26,
  },
  slideMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  slideMetaText: {
    color: "#c2d5ff",
    fontSize: 13,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 2,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: ACCENT_COLOR,
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  highlightIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACCENT_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  highlightTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  highlightCopy: {
    color: "#a7b3d9",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    gap: 14,
    paddingTop: 18,
  },
  ctaButton: {
    backgroundColor: ACCENT_COLOR, 
  },
  ctaButtonText: {
    fontWeight: '800',
    color: PRIMARY_DARK_COLOR,
  },
  loginLink: {
    alignItems: "center",
  },
  loginText: {
    color: "#9aa3c3",
    fontWeight: "600",
  },
});

export default OnboardingScreen;

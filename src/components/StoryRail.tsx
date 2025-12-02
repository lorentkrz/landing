import { useMemo, useState } from "react";
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useStories } from "../context/StoriesContext";
import { palette, radius, gradients } from "../constants/theme";
import { track } from "../utils/analytics";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { ensureConversation } from "../utils/conversations";
import { useAuth } from "../context/AuthContext";

type Props = {
  onPressStory?: () => void;
};

const StoryRail = ({ onPressStory }: Props) => {
  const navigation = useAppNavigation();
  const { user } = useAuth();
  const { stories, postStory, markViewed, deleteStory } = useStories();
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const activeStory = useMemo(() => stories.find((s) => s.id === activeStoryId), [stories, activeStoryId]);
  type StoryItem = { id: string; label: string; isAdd?: boolean; avatar?: string; mediaUrl?: string; isOwn?: boolean };

  const items: StoryItem[] = useMemo(
    () =>
      [
        { id: "add", label: "Add", isAdd: true },
        ...stories.map((s) => ({
          id: s.id,
          label: s.userName ?? "Guest",
          avatar: s.userAvatar,
          mediaUrl: s.mediaUrl,
          isOwn: s.isOwn,
        })),
      ],
    [stories],
  );

  const openStory = (id: string) => {
    const idx = stories.findIndex((s) => s.id === id);
    const story = stories[idx];
    if (!story) return;
    setActiveStoryId(id);
    setActiveIndex(idx);
    markViewed(id);
    track("story_view", { storyId: id });
    onPressStory?.();
  };

  const goNext = () => {
    const nextIdx = activeIndex + 1;
    if (nextIdx < stories.length) {
      openStory(stories[nextIdx].id);
    } else {
      setActiveStoryId(null);
    }
  };

  const goPrev = () => {
    const prevIdx = activeIndex - 1;
    if (prevIdx >= 0) {
      openStory(stories[prevIdx].id);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) =>
          item.isAdd ? (
            <TouchableOpacity style={[styles.bubble, styles.addBubble]} onPress={postStory} activeOpacity={0.85}>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={18} color={palette.background} />
              </View>
              <Text style={styles.label}>Your story</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.bubble} onPress={() => openStory(item.id)} activeOpacity={0.85}>
              <View style={[styles.ring, styles.ringBorder]}>
                <Image
                  source={{
                    uri: item.avatar ?? "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop",
                  }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        }
      />

      <Modal visible={!!activeStory} transparent animationType="fade" onRequestClose={() => setActiveStoryId(null)}>
        {activeStory ? (
          <View style={styles.viewerBackdrop}>
            <Image source={{ uri: activeStory.mediaUrl }} style={styles.viewerFullscreenImage} resizeMode="cover" />
          <LinearGradient colors={["rgba(0,0,0,0.7)", "transparent"]} style={styles.viewerTopOverlay} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.viewerBottomOverlay} />
          <TouchableOpacity style={styles.viewerClose} onPress={() => setActiveStoryId(null)}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          {activeIndex > 0 && (
            <TouchableOpacity style={[styles.viewerNav, { left: 16 }]} onPress={goPrev}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          {activeIndex < stories.length - 1 && (
            <TouchableOpacity style={[styles.viewerNav, { right: 16 }]} onPress={goNext}>
              <Ionicons name="chevron-forward" size={26} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={styles.viewerHeader}>
            <View>
              <Text style={styles.viewerCred}>@{activeStory.userId.slice(0, 8)}</Text>
              <Text style={styles.viewerMeta}>
                Expires {new Date(activeStory.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
              <View style={styles.viewerMetaPill}>
                <Ionicons name="eye" size={14} color="#0b0f1f" />
                <Text style={styles.viewerMetaPillText}>{activeStory.views ?? 0} views</Text>
              </View>
            </View>
            <View style={styles.viewerActions}>
              {activeStory.isOwn ? (
                <TouchableOpacity
                  style={styles.viewerCTASecondary}
                  onPress={async () => {
                    await deleteStory(activeStory.id);
                    setActiveStoryId(null);
                  }}
                >
                  <Ionicons name="trash" size={16} color="#ff7b7b" />
                  <Text style={[styles.viewerCTASecondaryText, { color: "#ff7b7b" }]}>Delete</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.viewerCTASecondary} onPress={() => setActiveStoryId(null)}>
                  <Ionicons name="chevron-back" size={18} color="#fff" />
                  <Text style={styles.viewerCTASecondaryText}>Close</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.viewerCTA}
                onPress={async () => {
                  if (!user?.id) {
                    navigation.navigate("Login");
                    return;
                  }
                  const conversationId = await ensureConversation(user.id, activeStory.userId);
                  navigation.navigate("Chat", {
                    conversationId,
                    userId: activeStory.userId,
                    userName: `@${activeStory.userId.slice(0, 8)}`,
                    userAvatar: activeStory.userAvatar,
                  });
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#0b0f1f" />
                <Text style={styles.viewerCTAText}>Message (credits apply)</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  listContent: {
    paddingVertical: 8,
    gap: 14,
  },
  bubble: {
    alignItems: "center",
    width: 76,
    gap: 8,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  ringBorder: {
    borderWidth: 2,
    borderColor: "#5ce1ff",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.background,
  },
  label: {
    color: palette.text,
    fontSize: 12,
  },
  addBubble: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: 12,
    width: 90,
    backgroundColor: palette.card,
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.text,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerFullscreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  viewerTopOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  viewerBottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },
  viewerHeader: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewerClose: {
    position: "absolute",
    top: 32,
    right: 16,
    zIndex: 2,
  },
  viewerNav: {
    position: "absolute",
    top: "50%",
    zIndex: 2,
    padding: 12,
  },
  viewerCred: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  viewerMeta: {
    color: "#d2d7f5",
    fontSize: 12,
    marginTop: 4,
  },
  viewerMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4dabf7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewerMetaPillText: {
    color: "#0b0f1f",
    fontWeight: "700",
  },
  viewerActions: {
    position: "absolute",
    bottom: 34,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  viewerCTA: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#4dabf7",
  },
  viewerCTAText: {
    color: "#0b0f1f",
    fontWeight: "700",
  },
  viewerCTASecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  viewerCTASecondaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default StoryRail;

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import type { Story } from "../types";
import { track } from "../utils/analytics";

const STORIES_TABLE = "stories";
const STORIES_BUCKET = "stories";

type StoriesContextType = {
  stories: Story[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  postStory: () => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  markViewed: (storyId: string) => Promise<void>;
};

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

const SAMPLE_STORIES: Story[] = [
  {
    id: "sample-1",
    userId: "sample-hero",
    userName: "Nataa",
    userAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop",
    mediaUrl:
      "https://images.unsplash.com/photo-1520440229-641378f57f87?w=800&h=1200&fit=crop&q=80",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
    views: 120,
    isOwn: false,
  },
];

export const StoriesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>(SAMPLE_STORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [supabaseStoriesHealthy, setSupabaseStoriesHealthy] = useState(true);

  const fetchStories = useCallback(async () => {
    if (!supabaseStoriesHealthy) {
      setStories(SAMPLE_STORIES);
      return;
    }
    setIsLoading(true);
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from(STORIES_TABLE)
        .select("id, user_id, media_url, thumb_url, created_at, expires_at, venue_id, views, profiles(first_name, last_name, avatar_url)")
        .gt("expires_at", nowIso)
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("Failed to load stories", error);
        if (`${error.message}`.toLowerCase().includes("does not exist")) {
          setSupabaseStoriesHealthy(false);
        }
        setStories(SAMPLE_STORIES);
        return;
      }
      if (!data) {
        setStories(SAMPLE_STORIES);
        return;
      }
      const mapped: Story[] =
        data.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          userName: `${row.profiles?.first_name ?? ""} ${row.profiles?.last_name ?? ""}`.trim(),
          userAvatar: row.profiles?.avatar_url ?? undefined,
          mediaUrl: row.media_url,
          thumbnailUrl: row.thumb_url ?? undefined,
          venueId: row.venue_id ?? undefined,
          createdAt: row.created_at,
          expiresAt: row.expires_at,
          isOwn: row.user_id === user?.id,
          views: row.views ?? 0,
        })) ?? [];
      const filtered = mapped.filter((s) => new Date(s.expiresAt).getTime() > Date.now());
      setStories(filtered.length ? filtered : SAMPLE_STORIES);
    } catch (err) {
      console.warn("Stories fetch failed", err);
      if (`${(err as Error).message}`.toLowerCase().includes("does not exist")) {
        setSupabaseStoriesHealthy(false);
      }
      setStories(SAMPLE_STORIES);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabaseStoriesHealthy]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const markViewed = async (storyId: string) => {
    let nextViews = 1;
    setStories((prev) =>
      prev.map((story) => {
        if (story.id !== storyId) return story;
        nextViews = (story.views ?? 0) + 1;
        return { ...story, views: nextViews };
      }),
    );
    if (!supabaseStoriesHealthy) return;
    try {
      // Prefer RPC if it exists; otherwise fall back to a simple update.
      const { error: rpcError } = await supabase.rpc("increment_story_view", { p_story_id: storyId });
      if (rpcError) {
        // Attempt a direct update if RPC missing.
        const { error: updateError } = await supabase
          .from(STORIES_TABLE)
          .update({ views: nextViews })
          .eq("id", storyId);
        if (updateError) {
          console.warn("Failed to mark view", updateError);
        }
      }
    } catch (err) {
      console.warn("Failed to mark view", err);
    }
    track("story_view", { storyId });
  };

  const postStory = async () => {
    if (isPosting) return;
    if (!supabaseStoriesHealthy) {
      Alert.alert(
        "Stories not configured",
        "Stories storage/table is missing. Please configure the 'stories' bucket and table in Supabase.",
      );
      return;
    }
    if (!user?.id) {
      Alert.alert("Login required", "Sign in to post a story.");
      return;
    }

    setIsPosting(true);
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" && mediaStatus !== "granted") {
        Alert.alert("Permission required", "Allow camera or photo library access to add a story.");
        return;
      }

      let asset: ImagePicker.ImagePickerAsset | undefined;
      let source: "camera" | "library" | null = null;

      if (cameraStatus === "granted") {
        const cameraResult = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.85,
        });
        if (!cameraResult.canceled && cameraResult.assets[0]) {
          asset = cameraResult.assets[0];
          source = "camera";
        }
      }

      if ((!asset || source === null) && mediaStatus === "granted") {
        const libraryResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.9,
        });
        if (!libraryResult.canceled && libraryResult.assets[0]) {
          asset = libraryResult.assets[0];
          source = "library";
        }
      }

      if (!asset) return;

      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const filename = `${user.id}-${Date.now()}.jpg`;
      const upload = await supabase.storage.from(STORIES_BUCKET).upload(filename, blob, {
        contentType: blob.type ?? "image/jpeg",
      });
      if (upload.error) {
        Alert.alert("Upload failed", upload.error.message);
        return;
      }
      const { data: urlData, error: publicUrlError } = supabase.storage.from(STORIES_BUCKET).getPublicUrl(
        upload.data.path,
      );
      if (publicUrlError || !urlData) {
        Alert.alert("Upload failed", publicUrlError?.message ?? "Could not get public URL");
        return;
      }
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const insert = await supabase
        .from(STORIES_TABLE)
        .insert({
          user_id: user.id,
          media_url: urlData.publicUrl,
          thumb_url: urlData.publicUrl,
          expires_at: expiresAt,
        })
        .select()
        .single();
      if (insert.error) {
        Alert.alert("Story failed", insert.error.message);
        return;
      }
      const newStory: Story = {
        id: insert.data.id,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        userAvatar: user.avatar,
        mediaUrl: urlData.publicUrl,
        thumbnailUrl: urlData.publicUrl,
        createdAt: insert.data.created_at,
        expiresAt,
        isOwn: true,
        views: 0,
      };
      setStories((prev) => [newStory, ...prev]);
      track("story_post", { storyId: newStory.id, source });
      Alert.alert("Story added", "Your story is live for 24 hours.");
    } catch (err) {
      console.warn("Story upload failed", err);
      Alert.alert("Story failed", "We couldn't post your story. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const value = useMemo(
    () => ({
      stories,
      isLoading,
      refresh: fetchStories,
      postStory,
      deleteStory: async (storyId: string) => {
        const target = stories.find((s) => s.id === storyId);
        setStories((prev) => prev.filter((s) => s.id !== storyId));
        if (!target || !supabaseStoriesHealthy) return;
        try {
          await supabase.from(STORIES_TABLE).delete().eq("id", storyId);
          if (target.mediaUrl?.includes(STORIES_BUCKET)) {
            const path = target.mediaUrl.split("/").slice(-1)[0];
            await supabase.storage.from(STORIES_BUCKET).remove([path]);
          }
        } catch (err) {
          console.warn("Failed to delete story", err);
        }
      },
      markViewed,
    }),
    [stories, isLoading, fetchStories, supabaseStoriesHealthy],
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
};

export const useStories = () => {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error("useStories must be used within StoriesProvider");
  return ctx;
};

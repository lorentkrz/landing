import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Venue } from "../types";

const CACHE_KEYS = {
  VENUES: "cached_venues",
  LAST_UPDATE: "venues_last_update",
  USER_LOCATION: "user_location",
  FAVORITE_VENUES: "favorite_venues",
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export class OfflineCache {
  // Cache venues for offline access
  static async cacheVenues(venues: Venue[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.VENUES, JSON.stringify(venues));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString());
    } catch (error) {
      console.error("Failed to cache venues:", error);
    }
  }

  // Get cached venues
  static async getCachedVenues(): Promise<Venue[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.VENUES);
      const lastUpdate = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE);
      
      if (!cached || !lastUpdate) return null;
      
      const updateTimestamp = parseInt(lastUpdate);
      const isExpired = Date.now() - updateTimestamp > CACHE_DURATION;
      
      if (isExpired) {
        await this.clearVenueCache();
        return null;
      }
      
      return JSON.parse(cached);
    } catch (error) {
      console.error("Failed to get cached venues:", error);
      return null;
    }
  }

  // Clear venue cache
  static async clearVenueCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([CACHE_KEYS.VENUES, CACHE_KEYS.LAST_UPDATE]);
    } catch (error) {
      console.error("Failed to clear venue cache:", error);
    }
  }

  // Cache user location
  static async cacheUserLocation(location: { latitude: number; longitude: number }): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.USER_LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error("Failed to cache user location:", error);
    }
  }

  // Get cached user location
  static async getCachedUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.USER_LOCATION);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Failed to get cached location:", error);
      return null;
    }
  }

  // Cache favorite venues
  static async cacheFavoriteVenues(venueIds: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.FAVORITE_VENUES, JSON.stringify(venueIds));
    } catch (error) {
      console.error("Failed to cache favorite venues:", error);
    }
  }

  // Get cached favorite venues
  static async getCachedFavoriteVenues(): Promise<string[]> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.FAVORITE_VENUES);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error("Failed to get cached favorite venues:", error);
      return [];
    }
  }

  // Check if cache is valid
  static async isCacheValid(): Promise<boolean> {
    try {
      const lastUpdate = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE);
      if (!lastUpdate) return false;
      
      const updateTimestamp = parseInt(lastUpdate);
      const isExpired = Date.now() - updateTimestamp > CACHE_DURATION;
      
      return !isExpired;
    } catch (error) {
      console.error("Failed to check cache validity:", error);
      return false;
    }
  }

  // Get cache size (for debugging)
  static async getCacheInfo(): Promise<{
    venuesCount: number;
    lastUpdate: string | null;
    cacheSize: string;
  }> {
    try {
      const venues = await AsyncStorage.getItem(CACHE_KEYS.VENUES);
      const lastUpdate = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATE);
      
      const venuesCount = venues ? JSON.parse(venues).length : 0;
      const cacheSize = venues ? `${(new Blob([venues]).size / 1024).toFixed(2)} KB` : "0 KB";
      
      return {
        venuesCount,
        lastUpdate,
        cacheSize,
      };
    } catch (error) {
      console.error("Failed to get cache info:", error);
      return { venuesCount: 0, lastUpdate: null, cacheSize: "0 KB" };
    }
  }
}

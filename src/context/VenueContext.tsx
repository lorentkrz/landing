import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { CheckIn, User, Venue } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { profileRowToUser } from "../utils/profile";
import { formatDistance, haversineKm } from "../utils/geo";
import { track } from "../utils/analytics";
import { OfflineCache } from "../utils/offlineCache";

type VenueContextType = {
  venues: Venue[];
  isLoading: boolean;
  activeCheckIn: CheckIn | null;
  refreshVenues: () => Promise<void>;
  getVenueById: (id: string) => Venue | undefined;
  checkInToVenue: (venueId: string, coords?: { latitude: number; longitude: number }, opts?: { overrideProximity?: boolean }) => Promise<void>;
  fetchActiveUsersForVenue: (venueId: string) => Promise<User[]>;
  updateUserLocation: (coords: { latitude: number; longitude: number }) => void;
};

interface VenueProviderProps {
  children: ReactNode;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

const FALLBACK_VENUES: Venue[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Zone Club",
    type: "Nightclub",
    description: "Kosovo's iconic electronic club hosting international DJs every weekend.",
    address: "Rruga e Germise 21",
    city: "Prishtina",
    country: "Kosovo",
    rating: 4.8,
    image: "https://storage.googleapis.com/albania-travel-guide/2022/07/Nightlife-in-Tirana-Tirana-Albania-Travel-Guide-960x640.jpg",
    coverImage: undefined,
    features: ["International DJs", "VIP tables", "Laser show"],
    openHours: "22:00 - 04:00",
    capacity: 1000,
    activeUsers: 0,
    distance: undefined,
    isCheckedIn: false,
    updatedAt: undefined,
    latitude: 42.6629,
    longitude: 21.1655,
    mapVisible: true,
    isFeatured: true,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Soluna Beach Bar",
    type: "Beach Bar",
    description: "Sunset-ready cocktail bar right on Vlore's promenade with live sax on Fridays.",
    address: "Rruga Uji i Ftohte 12",
    city: "Vlore",
    country: "Albania",
    rating: 4.6,
    image: "https://scratchyourmapa.com/wp-content/uploads/2022/07/beach-club-set-up-1024x676.jpg",
    coverImage: undefined,
    features: ["Beach beds", "Sunset DJ", "Signature cocktails"],
    openHours: "10:00 - 02:00",
    capacity: 200,
    activeUsers: 0,
    distance: undefined,
    isCheckedIn: false,
    updatedAt: undefined,
    latitude: 40.4711,
    longitude: 19.4914,
    mapVisible: true,
    isFeatured: false,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Infinity Lounge",
    type: "Lounge",
    description: "Modern lounge with ambient lighting, crafted drinks, and Thursday RnB nights.",
    address: "Rruga Adem Jashari 45",
    city: "Peja",
    country: "Kosovo",
    rating: 4.5,
    image: "https://ghostaroundtheglobe.com/wp-content/uploads/2023/09/Pristina-Kosovo-Bars.jpg",
    coverImage: undefined,
    features: ["Live sax", "Craft cocktails", "Cozy booths"],
    openHours: "18:00 - 02:00",
    capacity: 140,
    activeUsers: 0,
    distance: undefined,
    isCheckedIn: false,
    updatedAt: undefined,
    latitude: 42.6593,
    longitude: 20.2883,
    mapVisible: true,
    isFeatured: false,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Sky High Club",
    type: "Nightclub",
    description: "Rooftop nightclub with open-air dance floors, skyline views, and laser light shows.",
    address: "Rruga e Shkupit 5",
    city: "Mitrovica",
    country: "Kosovo",
    rating: 4.7,
    image: "https://www.digitalstudioindia.com/cloud/2021/11/12/Sky-High-Skybar-1-(1).jpg",
    coverImage: undefined,
    features: ["Rooftop views", "Premium bottles", "VIP cabanas"],
    openHours: "21:00 - 03:30",
    capacity: 500,
    activeUsers: 0,
    distance: undefined,
    isCheckedIn: false,
    updatedAt: undefined,
    latitude: 42.8901,
    longitude: 20.8651,
    mapVisible: true,
    isFeatured: true,
  },
];

const mapVenueRow = (row: any, activeCheckIn: CheckIn | null, activeUserCount = 0): Venue => ({
  id: row.id,
  name: row.name,
  type: row.type,
  description: row.description ?? "",
  address: row.address ?? "",
  city: row.city ?? "",
  country: row.country ?? "",
  rating: Number(row.rating ?? 4.5),
  image: row.image_url ?? row.cover_image_url ?? "",
  coverImage: row.cover_image_url ?? undefined,
  features: row.features ?? [],
  openHours: row.open_hours ?? undefined,
  capacity: row.capacity ?? undefined,
  activeUsers: activeUserCount,
  distance: row.distance ?? undefined,
  isCheckedIn: activeCheckIn ? activeCheckIn.venueId === row.id : false,
  updatedAt: row.updated_at ?? undefined,
  latitude: row.latitude ?? undefined,
  longitude: row.longitude ?? undefined,
  mapVisible: row.map_visible ?? true,
  isFeatured: row.is_featured ?? false,
});

export const VenueProvider = ({ children }: VenueProviderProps) => {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchActiveCheckIn(user.id);
    } else {
      setActiveCheckIn(null);
    }
  }, [user?.id]);

  const fetchActiveCheckIn = async (userId: string) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", userId)
      .gte("expires_at", now)
      .order("expires_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Failed to fetch check-ins", error);
      setActiveCheckIn(null);
      return null;
    }

    if (data && data.length > 0) {
      const row = data[0];
      const checkIn: CheckIn = {
        id: row.id,
        venueId: row.venue_id,
        userId: row.user_id,
        timestamp: row.created_at,
        expiresAt: row.expires_at,
      };
      setActiveCheckIn(checkIn);
      return checkIn;
    }

    setActiveCheckIn(null);
    return null;
  };

  const refreshVenues = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to get cached venues first for offline support
      const cachedVenues = await OfflineCache.getCachedVenues();
      if (cachedVenues) {
        setVenues(cachedVenues);
      }

      const now = new Date().toISOString();
      const [{ data: venueRows, error: venuesError }, { data: checkInRows, error: checkInsError }] =
        await Promise.all([
          supabase.from("venues").select("*").order("name"),
          supabase.from("check_ins").select("venue_id").gte("expires_at", now),
        ]);

      if (venuesError) {
        throw venuesError;
      }
      if (checkInsError) {
        throw checkInsError;
      }

      const activeCounts =
        checkInRows?.reduce<Record<string, number>>((acc, row) => {
          acc[row.venue_id] = (acc[row.venue_id] ?? 0) + 1;
          return acc;
        }, {}) ?? {};

      const currentCheckIn = user?.id ? await fetchActiveCheckIn(user.id) : null;
      const mapped =
        venueRows
          ?.filter((row) => row.latitude && row.longitude)
          .map((row) => {
            const distanceKm = haversineKm(
              userLocation?.latitude,
              userLocation?.longitude,
              row.latitude,
              row.longitude,
            );
            const base = mapVenueRow(row, currentCheckIn, activeCounts[row.id] ?? 0);
            return {
              ...base,
              distanceKm: distanceKm ?? undefined,
              distance: formatDistance(distanceKm ?? undefined),
            };
          }) ?? [];
      if (mapped.length === 0) {
        console.warn("No venues returned from Supabase, falling back to local seed data.");
        setVenues(FALLBACK_VENUES);
      } else {
        const sorted = userLocation
          ? [...mapped].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
          : mapped;
        setVenues(sorted);
        
        // Cache the venues for offline support
        await OfflineCache.cacheVenues(sorted);
      }
    } catch (error) {
      console.error("Failed to refresh venues:", error);
      setVenues(FALLBACK_VENUES);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userLocation]);

  useEffect(() => {
    refreshVenues();
  }, [refreshVenues]);

  const getVenueById = (id: string) => venues.find((venue) => venue.id === id);

  const checkInToVenue = async (
    venueId: string,
    coords?: { latitude: number; longitude: number },
    opts?: { overrideProximity?: boolean },
  ) => {
    if (!user?.id) {
      throw new Error("You must be logged in to check in.");
    }
    const venue = getVenueById(venueId);
    if (!venue?.latitude || !venue?.longitude) {
      throw new Error("This venue is missing location data. Try another venue.");
    }
    const currentCoords = coords ?? userLocation;
    let distanceKm = currentCoords
      ? haversineKm(currentCoords.latitude, currentCoords.longitude, venue.latitude, venue.longitude)
      : undefined;
    if (!opts?.overrideProximity) {
      if (!currentCoords) {
        throw new Error("Turn on location to check in. We need your position to verify proximity.");
      }
      if (distanceKm === undefined || distanceKm * 1000 > 50) {
        throw new Error("You need to be at the venue to check in (within 50 meters).");
      }
    }
    if (distanceKm === undefined) distanceKm = 0;
    setIsLoading(true);
    try {
      await supabase.from("check_ins").delete().eq("user_id", user.id);

      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("check_ins").insert({
        venue_id: venueId,
        user_id: user.id,
        expires_at: expiresAt,
      });

      if (error) {
        throw error;
      }

      track("check_in", { venueId, distance_m: Math.round((distanceKm ?? 0) * 1000), override: opts?.overrideProximity ?? false });
      await fetchActiveCheckIn(user.id);
      await refreshVenues();
    } catch (error) {
      console.error("Failed to check in:", error);
      throw new Error("Unable to check in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveUsersForVenue = useCallback(
    async (venueId: string) => {
      const now = new Date().toISOString();
      try {
      const { data, error } = await supabase
        .from("check_ins")
        .select("user_id, user:profiles!check_ins_user_id_fkey(*)")
        .eq("venue_id", venueId)
        .gte("expires_at", now);
      if (error) {
          throw error;
        }

        return (
          data
            ?.map((row) => (row.user ? profileRowToUser(row.user) : null))
            .filter(Boolean) as User[]
        );
      } catch (error) {
        console.error("Failed to load active users:", error);
        return [];
      }
    },
    [],
  );

  const updateUserLocation = (coords: { latitude: number; longitude: number }) => {
    setUserLocation(coords);
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        isLoading,
        activeCheckIn,
        refreshVenues,
        getVenueById,
        checkInToVenue,
        fetchActiveUsersForVenue,
        updateUserLocation,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
};

export const useVenues = () => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error("useVenues must be used within a VenueProvider");
  }
  return context;
};

"use client";
import { Ionicons } from "@expo/vector-icons";
import MapLibreGL, { MapView, Camera, UserLocation, PointAnnotation, Callout } from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

// MapLibre does not require access token for Carto tiles

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

// Type definitions
type Coordinates = [number, number]; // [longitude, latitude]
type BoundingBox = [Coordinates, Coordinates]; // [[minLon, minLat], [maxLon, maxLat]]
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";

import { useVenues } from "../context/VenueContext";
import { useAppNavigation } from "../navigation/useAppNavigation";
import type { Venue } from "../types";
import { track } from "../utils/analytics";
import { computeRegion, type MapRegion } from "../utils/map";
type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const FILTERS = [
  { label: "All", icon: "apps" as const, keywords: [] },
  { label: "Nightclubs", icon: "flash" as const, keywords: ["nightclub", "club"] },
  { label: "Bars", icon: "wine" as const, keywords: ["bar", "cocktail", "lounge"] },
  { label: "Live", icon: "musical-notes" as const, keywords: ["live", "dj"] },
  { label: "Events", icon: "calendar" as const, keywords: ["event", "concert"] },
] as const;

type FilterOption = (typeof FILTERS)[number];
type FilterLabel = FilterOption["label"];

const WINDOW = Dimensions.get("window");
const CARD_WIDTH = Math.min(WINDOW.width * 0.78, 320);
const CARD_SPACING = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;
const CAROUSEL_SIDE_PADDING = (WINDOW.width - CARD_WIDTH) / 2;

const clampValue = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const MapScreen = () => {
  const cameraRef = useRef<React.ComponentRef<typeof Camera> | null>(null);
  const hasCenteredOnUser = useRef(false);
  const hasCenteredOnVenues = useRef(false);
  const hasRequestedLocation = useRef(false);
  const [zoom, setZoom] = useState(12);
  const { venues, refreshVenues, isLoading, updateUserLocation } = useVenues();
  const navigation = useAppNavigation();
  const [initialRegion, setInitialRegion] = useState<MapRegion>({
    latitude: 42.6026,  // Center of Kosovo
    longitude: 20.9030,
    latitudeDelta: 1.2,
    longitudeDelta: 1.2,
  });

  const [activeFilter, setActiveFilter] = useState<FilterLabel>("All");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isListModalVisible, setListModalVisible] = useState(false);
  const carouselRef = useRef<FlatList<Venue> | null>(null);

  const visibleVenues = useMemo(
    () =>
      venues.filter(
        (v) =>
          v.mapVisible !== false &&
          typeof v.latitude === "number" &&
          typeof v.longitude === "number",
      ),
    [venues],
  );

  const filteredVenues = useMemo(() => {
    const base = activeFilter === "All" ? visibleVenues : (() => {
    const config = FILTERS.find((f) => f.label === activeFilter);
    const keywords = config?.keywords ?? [];
    if (!keywords.length) return visibleVenues;
    return visibleVenues.filter((v) => {
      const typeValue = v.type?.toLowerCase?.() ?? "";
      return keywords.some((keyword) => typeValue.includes(keyword));
    });
  })();
    return [...base].sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER));
  }, [visibleVenues, activeFilter]);

  const featuredCount = useMemo(
    () => filteredVenues.filter((v) => v.isFeatured).length,
    [filteredVenues],
  );

  const totalActiveUsers = useMemo(
    () =>
      filteredVenues.reduce((sum, venue) => sum + (venue.activeUsers ?? 0), 0),
    [filteredVenues],
  );

  useEffect(() => {
    if (!filteredVenues.length) {
      setSelectedVenue(null);
      return;
    }

    const stillVisible = selectedVenue
      ? filteredVenues.some((v) => v.id === selectedVenue.id)
      : false;
    if (stillVisible) return;

    if (userLocation) {
      const nearest = [...filteredVenues].sort(
        (a, b) =>
          (a.distanceKm ?? Number.MAX_SAFE_INTEGER) -
          (b.distanceKm ?? Number.MAX_SAFE_INTEGER),
      )[0];
      setSelectedVenue(nearest ?? null);
      return;
    }

    setSelectedVenue(null);
  }, [filteredVenues, selectedVenue?.id, userLocation]);

  const defaultRegion = useMemo(
    () => computeRegion(filteredVenues),
    [filteredVenues],
  );
  const initialCenter: Coordinates = useMemo(() => {
    if (userLocation) {
      return [userLocation.longitude, userLocation.latitude];
    }
    if (filteredVenues.length) {
      return [
        defaultRegion.longitude,
        defaultRegion.latitude,
      ];
    }
    return [initialRegion.longitude, initialRegion.latitude];
  }, [
    filteredVenues.length,
    initialRegion.latitude,
    initialRegion.longitude,
    defaultRegion.latitude,
    defaultRegion.longitude,
    userLocation,
  ]);

  useEffect(() => {
    const nextZoom = userLocation ? 14 : filteredVenues.length ? 12 : 9;
    setZoom(nextZoom);
  }, [filteredVenues.length, userLocation]);
  const [userLocation, setUserLocation] = useState<MapRegion | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isCarouselCollapsed, setCarouselCollapsed] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const moveToVenue = useCallback(
    (target: Venue | MapRegion | null, animate = true) => {
      if (!target) return;
      const latitude = target.latitude;
      const longitude = target.longitude;
      if (typeof latitude !== "number" || typeof longitude !== "number") return;

      const region: MapRegion = {
        latitude,
        longitude,
        latitudeDelta:
          "latitudeDelta" in target && typeof target.latitudeDelta === "number"
            ? target.latitudeDelta
            : 0.05,
        longitudeDelta:
          "longitudeDelta" in target && typeof target.longitudeDelta === "number"
            ? target.longitudeDelta
            : 0.05,
      };

      if ("id" in target) {
        setSelectedVenue(target);
      }

      if (cameraRef.current && animate) {
        cameraRef.current.flyTo([region.longitude, region.latitude], 450);
        cameraRef.current.setCamera?.({
          zoomLevel: 15,
          centerCoordinate: [region.longitude, region.latitude],
          animationMode: "flyTo",
          animationDuration: 450,
        });
      }
    },
    [],
  );

  const flyToLocation = (coords: Coordinates) => {
    if (cameraRef.current) {
      cameraRef.current.flyTo(coords, 1000);
    }
  };

  const scrollToCard = useCallback(
    (index: number, animated = true) => {
      if (!carouselRef.current) return;
      if (index < 0 || index >= filteredVenues.length) return;
      try {
        carouselRef.current.scrollToIndex({ index, animated });
      } catch {
        const offset = index * SNAP_INTERVAL;
        carouselRef.current.scrollToOffset?.({ offset, animated });
      }
    },
    [filteredVenues.length],
  );

  useEffect(() => {
    if (filteredVenues.length) {
      requestAnimationFrame(() => scrollToCard(0, false));
    }
  }, [filteredVenues.length, scrollToCard]);

  const handleCarouselMomentumEnd = useCallback(
    (event: any) => {
      if (!filteredVenues.length) return;
      const offsetX = event.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(offsetX / SNAP_INTERVAL);
      const index = clampValue(
        rawIndex,
        0,
        Math.max(filteredVenues.length - 1, 0),
      );
      const focusedVenue = filteredVenues[index];
      if (focusedVenue && focusedVenue.id !== selectedVenue?.id) {
        setSelectedVenue(focusedVenue);
        moveToVenue(focusedVenue, false);
      }
    },
    [filteredVenues, moveToVenue, selectedVenue?.id],
  );

  const handleMarkerPress = useCallback(
    (venue: Venue) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedVenue(venue);
      moveToVenue(venue);
      const index = filteredVenues.findIndex((v) => v.id === venue.id);
      if (index >= 0) {
        requestAnimationFrame(() => scrollToCard(index));
      }
    },
    [filteredVenues, moveToVenue, scrollToCard],
  );

  const handleOpenList = () => setListModalVisible(true);
  const handleCloseList = () => setListModalVisible(false);
  const recenterSelected = () => {
    if (selectedVenue) {
      moveToVenue(selectedVenue);
      return;
    }
    if (userLocation) {
      flyToLocation([userLocation.longitude, userLocation.latitude]);
      return;
    }
    moveToVenue(defaultRegion, true);
  };

  const computeVenueMeta = useCallback((item: Venue) => {
    const openLabel = getOpenLabel(item.openHours);
    const ratingLabel =
      typeof item.rating === "number"
        ? `${item.rating.toFixed(1)} rating`
        : "New spot";
    const chipValues = [
      ratingLabel,
      item.distance,
      item.features?.[0],
    ].filter(Boolean) as string[];

    return { openLabel, chipValues };
  }, []);

  const getUserLocation = useCallback(async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setIsLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setUserLocation(region);
      flyToLocation([location.coords.longitude, location.coords.latitude]);
      updateUserLocation({ latitude: region.latitude, longitude: region.longitude });
      refreshVenues();
      track("map_location", { latitude: region.latitude, longitude: region.longitude });
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Could not get your location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  }, [refreshVenues, updateUserLocation]);

  const onUserLocationChange = (location: { coords: { longitude: number; latitude: number } }) => {
    const { longitude, latitude } = location.coords;
    // Keep location for state if needed later, but don't constantly re-center the map
    // cameraRef.current?.flyTo([longitude, latitude], 1000);
  };

  useEffect(() => {
    if (!userLocation || !cameraRef.current || hasCenteredOnUser.current) return;
    hasCenteredOnUser.current = true;
    cameraRef.current.flyTo([userLocation.longitude, userLocation.latitude], 650);
    cameraRef.current.setCamera?.({
      zoomLevel: 14,
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      animationMode: "flyTo",
      animationDuration: 650,
    });
  }, [userLocation]);

  useEffect(() => {
    if (hasCenteredOnVenues.current) return;
    if (!filteredVenues.length || userLocation) return;
    const center = () => {
      if (hasCenteredOnVenues.current) return;
      const camera = cameraRef.current;
      if (!camera) return;
      hasCenteredOnVenues.current = true;
      camera.flyTo([defaultRegion.longitude, defaultRegion.latitude], 600);
      camera.setCamera?.({
        centerCoordinate: [defaultRegion.longitude, defaultRegion.latitude],
        zoomLevel: 12,
        animationMode: "flyTo",
        animationDuration: 600,
      });
    };
    // Try immediately, then once more shortly after to catch late camera mounts.
    center();
    setTimeout(center, 250);
  }, [defaultRegion.longitude, defaultRegion.latitude, filteredVenues.length, userLocation]);

  useFocusEffect(
    useCallback(() => {
      if (hasRequestedLocation.current) return;
      hasRequestedLocation.current = true;
      getUserLocation();
    }, [getUserLocation]),
  );

  const getOpenLabel = (hours?: string) => {
    if (!hours) return "Hours not set";
    const [start, end] = hours.split("-").map((x) => x.trim());
    if (!start || !end) return hours;
    return `${start} - ${end}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={["#1b2242", "#0d1228"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroRow}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.heroCopy}>
              <Text style={styles.title}>Discover on map</Text>
              <Text style={styles.subtitle}>
                Pins update once venues go live.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleOpenList}
            >
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {filteredVenues.length}
              </Text>
              <Text style={styles.heroStatLabel}>Venues nearby</Text>
            </View>

            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{totalActiveUsers}</Text>
              <Text style={styles.heroStatLabel}>Active tonight</Text>
            </View>

            <TouchableOpacity
              style={styles.heroAction}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleOpenList();
              }}
            >
              <Ionicons name="list" size={16} color="#0d1228" />
              <Text style={styles.heroActionText}>View list</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.mapContainer}>
        <MapLibreGL.MapView
          style={styles.map}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          attributionEnabled={true}
          logoEnabled={false}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          onDidFailLoadingMap={() => setMapError("Map failed to load. Check your connection.")}
        >
          <MapLibreGL.Camera
            ref={(ref) => {
              cameraRef.current = ref;
            }}
            zoomLevel={zoom}
            animationMode="flyTo"
            animationDuration={2000}
            defaultSettings={{
              centerCoordinate: initialCenter,
              zoomLevel: zoom,
            }}
          />
          
          <MapLibreGL.UserLocation
            visible={true}
            onUpdate={onUserLocationChange}
          />
          
          {/* TODO: Consider clustering for performance with large venue datasets
          <MapLibreGL.ShapeSource
            id="clustered-venues"
            cluster={true}
            clusterRadius={50}
            clusterMaxZoomLevel={15}
          >
            <MapLibreGL.SymbolLayer
              id="cluster-count"
              style={{
                textField: '{point_count}',
                textSize: 12,
                textColor: '#fff',
                textHaloColor: '#000',
                textHaloWidth: 1,
              }}
            />
          </MapLibreGL.ShapeSource>
          */}
          
          {filteredVenues?.map((v) => 
            typeof v.latitude === "number" && typeof v.longitude === "number" ? (
              <MapLibreGL.PointAnnotation
                key={v.id}
                id={v.id}
                coordinate={[v.longitude, v.latitude]}
                onSelected={() => handleMarkerPress(v)}
                onDeselected={() => setSelectedVenue(null)}
                selected={selectedVenue?.id === v.id}
              >
                <View style={styles.markerContainer}>
                  <View style={[
                    styles.marker,
                    { backgroundColor: v.isFeatured ? '#fcd34d' : '#4dabf7' }
                  ]} />
                </View>
                <MapLibreGL.Callout title="Venue Info">
                  <View style={{padding: 8}}>
                    <Text style={{fontWeight: 'bold'}}>{v.name}</Text>
                    {v.address && <Text style={{fontSize: 12}}>{v.address}</Text>}
                  </View>
                </MapLibreGL.Callout>
              </MapLibreGL.PointAnnotation>
            ) : null
          )}
        </MapLibreGL.MapView>

        {/* Location Button */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getUserLocation}
          disabled={isLoadingLocation}
        >
          <Ionicons 
            name="navigate"
            size={22}
            color={isLoadingLocation ? '#666' : '#fff'}
          />
        </TouchableOpacity>

        {/* List Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleOpenList();
          }}
        >
          <Ionicons name="list" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Recenter Button */}
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={recenterSelected}
        >
          <Ionicons name="compass" size={20} color="#fff" />
        </TouchableOpacity>
        
        {/* Map Error Toast */}
        {mapError && (
          <View style={styles.errorToast}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.errorText}>{mapError}</Text>
          </View>
        )}

        {/* Location Error Toast */}
        {locationError && (
          <View style={styles.errorToast}>
            <Ionicons name="warning" size={16} color="#fff" />
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity onPress={getUserLocation}>
              <Text style={styles.errorRetry}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mapLegend}>
          <Text style={styles.legendTitle}>Pins</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#fcd34d" }]} />
            <Text style={styles.legendText}>Featured</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: "#4dabf7" }]} />
            <Text style={styles.legendText}>Venues</Text>
          </View>
        </View>

        {isLoading && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.mapLoadingText}>Loading venues...</Text>
          </View>
        )}
      </View>

      {isCarouselCollapsed ? (
        <TouchableOpacity
          style={styles.carouselRevealButton}
          onPress={() => setCarouselCollapsed(false)}
        >
          <Ionicons name="chevron-up" size={16} color="#fff" />
          <Text style={styles.carouselRevealText}>Show venues</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.carouselContainer} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.carouselCollapseButton}
            onPress={() => setCarouselCollapsed(true)}
          >
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </TouchableOpacity>
          <FlatList
            ref={(ref) => {
              if (ref) {
                carouselRef.current = ref;
              }
            }}
            data={filteredVenues}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.carouselContent,
              { paddingHorizontal: CAROUSEL_SIDE_PADDING },
            ]}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            snapToAlignment="start"
            onMomentumScrollEnd={handleCarouselMomentumEnd}
            getItemLayout={(_, index) => ({
              length: SNAP_INTERVAL,
              offset: SNAP_INTERVAL * index,
              index,
            })}
            ListEmptyComponent={() => (
              <View
                style={[
                  styles.listCard,
                  styles.carouselCard,
                  styles.carouselEmptyCard,
                ]}
              >
                <Text style={styles.listName}>No venues yet</Text>
                <Text style={styles.listMeta}>Try a different filter.</Text>
              </View>
            )}
            renderItem={({ item, index }) => {
              const isActive = selectedVenue?.id === item.id;
              const { openLabel, chipValues } = computeVenueMeta(item);

              return (
                <TouchableOpacity
                  style={[
                    styles.listCard,
                    styles.carouselCard,
                    isActive && styles.carouselCardActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    moveToVenue(item);
                    scrollToCard(index);
                  }}
                  activeOpacity={0.9}
                >
                  <View style={styles.listHeaderRow}>
                    <View style={styles.venueImagePlaceholder}>
                      <Ionicons name="location" size={20} color="#4dabf7" />
                    </View>
                    <View style={styles.venueInfo}>
                      <View style={styles.listTitleRow}>
                        <Text style={styles.listName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.isFeatured && (
                          <View style={styles.featuredBadge}>
                            <Ionicons name="star" size={12} color="#0a0e17" />
                            <Text style={styles.featuredText}>Featured</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.listMeta} numberOfLines={1}>
                        {item.city}, {item.country}
                      </Text>
                    </View>
                    <Text style={styles.venueTypeRightAligned}>{item.type}</Text>
                  </View>

                  <View style={styles.listChipsRow}>
                    {chipValues.slice(0, 2).map((chip) => (
                      <View key={chip} style={styles.listChip}>
                        <Text style={styles.listChipText} numberOfLines={1}>
                          {chip}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.listStats}>
                    <View style={styles.listStatItem}>
                      <Ionicons name="time" size={13} color="#8bd1ff" />
                      <Text style={styles.statText}>{openLabel}</Text>
                    </View>
                    <View style={styles.listStatItem}>
                      <Ionicons name="people" size={13} color="#8bd1ff" />
                      <Text style={styles.statText}>
                        {item.activeUsers || 0} active
                      </Text>
                    </View>
                    {item.distance ? (
                      <View style={styles.listStatItem}>
                        <Ionicons name="navigate" size={13} color="#8bd1ff" />
                        <Text style={styles.statText}>{item.distance}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.listDescription} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.listFooterActions}>
                    <TouchableOpacity
                      style={styles.ghostButton}
                      activeOpacity={0.85}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        moveToVenue(item);
                        scrollToCard(index);
                      }}
                    >
                      <Ionicons name="navigate" size={14} color="#8bd1ff" />
                      <Text style={styles.ghostButtonText}>Focus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        navigation.navigate("VenueDetails", {
                          venueId: item.id,
                        });
                      }}
                    >
                      <Text style={styles.viewBtnText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      )}

      <Modal
        visible={isListModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseList}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Browse venues</Text>
                <Text style={styles.modalSubtitle}>
                  Showing {filteredVenues.length}{" "}
                  {activeFilter === "All"
                    ? "venues"
                    : activeFilter.toLowerCase()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={handleCloseList}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredVenues}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
              ListEmptyComponent={() => (
                <View style={[styles.listCard, styles.carouselEmptyCard]}>
                  <Text style={styles.listName}>No venues yet</Text>
                  <Text style={styles.listMeta}>Try another filter.</Text>
                </View>
              )}
              renderItem={({ item, index }) => {
                const isActive = selectedVenue?.id === item.id;
                const { openLabel, chipValues } = computeVenueMeta(item);

                return (
                  <TouchableOpacity
                    style={[styles.listCard, isActive && styles.listCardActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      moveToVenue(item);
                      scrollToCard(index);
                      handleCloseList();
                    }}
                    activeOpacity={0.9}
                  >
                    <View style={styles.listHeaderRow}>
                      <View style={styles.venueImagePlaceholder}>
                        <Ionicons name="location" size={20} color="#4dabf7" />
                      </View>
                      <View style={styles.venueInfo}>
                        <View style={styles.listTitleRow}>
                          <Text style={styles.listName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {item.isFeatured && (
                            <View style={styles.featuredBadge}>
                              <Ionicons name="star" size={12} color="#0a0e17" />
                              <Text style={styles.featuredText}>Featured</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.listMeta} numberOfLines={1}>
                          {item.city}, {item.country}
                        </Text>
                      </View>
                      <Text style={styles.venueTypeRightAligned}>
                        {item.type}
                      </Text>
                    </View>

                    <View style={styles.listChipsRow}>
                      {chipValues.slice(0, 2).map((chip) => (
                        <View key={chip} style={styles.listChip}>
                          <Text style={styles.listChipText} numberOfLines={1}>
                            {chip}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.listStats}>
                      <View style={styles.listStatItem}>
                        <Ionicons name="time" size={13} color="#8bd1ff" />
                        <Text style={styles.statText}>{openLabel}</Text>
                      </View>
                      <View style={styles.listStatItem}>
                        <Ionicons name="people" size={13} color="#8bd1ff" />
                        <Text style={styles.statText}>
                          {item.activeUsers || 0} active
                        </Text>
                      </View>
                      {item.distance ? (
                        <View style={styles.listStatItem}>
                          <Ionicons name="navigate" size={13} color="#8bd1ff" />
                          <Text style={styles.statText}>{item.distance}</Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.listDescription} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={styles.listFooterActions}>
                      <TouchableOpacity
                        style={styles.ghostButton}
                        activeOpacity={0.85}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          moveToVenue(item);
                          scrollToCard(index);
                          handleCloseList();
                        }}
                      >
                        <Ionicons name="navigate" size={14} color="#8bd1ff" />
                        <Text style={styles.ghostButtonText}>Focus</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.viewBtn}
                        activeOpacity={0.85}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light,
                          );
                          handleCloseList();
                          navigation.navigate("VenueDetails", {
                            venueId: item.id,
                          });
                        }}
                      >
                        <Text style={styles.viewBtnText}>Details</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#03050f",
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    height: 30,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  marker: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#4dabf7',
  },
  heroContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  heroGradient: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
  },
  iconButton: {
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
  subtitle: {
    color: "#8f96bb",
    fontSize: 13,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    marginTop: 4,
  },
  heroStat: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(3,5,15,0.4)",
  },
  heroStatValue: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  heroStatLabel: {
    color: "#8f96bb",
    fontSize: 11,
    marginTop: 2,
  },
  heroAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd479",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  heroActionText: {
    color: "#0d1228",
    fontWeight: "700",
    fontSize: 12,
  },
  heroHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  heroHintText: {
    color: "#d4d9ff",
    fontSize: 11,
  },
  filterWrapper: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  filterRow: {
    paddingVertical: 12,
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(14,17,35,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: "#4dabf7",
    borderColor: "#4dabf7",
  },
  filterIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  filterIconBadgeActive: {
    backgroundColor: "#fff",
  },
  filterText: {
    color: "#8f96bb",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#0d1228",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  findMeButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  errorToast: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  errorRetry: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  locationButton: {
    position: "absolute",
    bottom: 24,
    right: 76,
    backgroundColor: "rgba(3,5,15,0.85)",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  recenterButton: {
    position: "absolute",
    bottom: 84,
    right: 16,
    backgroundColor: "rgba(3,5,15,0.85)",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  filterButton: {
    position: "absolute",
    bottom: 24,
    right: 16,
    backgroundColor: "rgba(3,5,15,0.85)",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  legendTitle: {
    color: "#8f96bb",
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  mapLoading: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(3,5,15,0.75)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapLoadingText: {
    color: "#cdd7ff",
    fontSize: 12,
  },
  carouselContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
  },
  carouselContent: {
    paddingVertical: 10,
  },
  carouselCollapseButton: {
    alignSelf: "flex-end",
    marginRight: 24,
    backgroundColor: "rgba(3,5,15,0.65)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 6,
  },
  carouselRevealButton: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(3,5,15,0.85)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  carouselRevealText: {
    color: "#fff",
    fontWeight: "600",
  },
  carouselCard: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
  },
  carouselCardActive: {
    borderColor: "#4dabf7",
    shadowColor: "#4dabf7",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  carouselEmptyCard: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3,5,15,0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#050816",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: WINDOW.height * 0.6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: "#8e95bd",
    fontSize: 13,
    marginTop: 4,
    textTransform: "capitalize",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalList: {
    paddingBottom: 40,
  },
  listCard: {
    backgroundColor: "rgba(9,12,25,0.95)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  listCardActive: {
    borderColor: "#4dabf7",
    shadowColor: "#4dabf7",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  listMeta: {
    color: "#8e95bd",
    fontSize: 12,
    marginTop: 4,
  },
  listChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  listChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 6,
  },
  listChipText: {
    color: "#d4d9ff",
    fontSize: 11,
  },
  listStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  listStatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginTop: 6,
  },
  statText: {
    color: "#cfe0ff",
    fontSize: 12,
  },
  listDescription: {
    color: "#9da6d1",
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  listFooterActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(77,171,247,0.15)",
    borderWidth: 1,
    borderColor: "rgba(77,171,247,0.3)",
  },
  ghostButtonText: {
    color: "#8bd1ff",
    fontWeight: "600",
    marginLeft: 6,
  },
  venueInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  venueImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffd479",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  featuredText: {
    color: "#0a0e17",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  viewBtn: {
    backgroundColor: "#4dabf7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  viewBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  venueTypeRightAligned: {
    color: "#8e95bd",
    fontSize: 12,
    marginLeft: 'auto',
    backgroundColor: 'rgba(79, 86, 125, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
    // Add these new styles
  mapLegend: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legendTitleBold: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
});

"use client";

import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: any;
  borderRadius?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  style, 
  borderRadius = 4 
}) => {
  const shimmerValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const shimmerTranslateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[styles.skeleton, { width, height, borderRadius }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#e0e0e0', '#f0f0f0', '#e0e0e0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

// Venue Card Skeleton
export const VenueCardSkeleton: React.FC = () => {
  return (
    <View style={styles.venueCard}>
      <SkeletonLoader height={120} style={styles.venueImage} />
      <View style={styles.venueContent}>
        <SkeletonLoader width="60%" height={20} style={styles.venueTitle} />
        <SkeletonLoader width="80%" height={14} style={styles.venueDescription} />
        <View style={styles.venueMeta}>
          <SkeletonLoader width={40} height={12} />
          <SkeletonLoader width={40} height={12} />
        </View>
      </View>
    </View>
  );
};

// Event Card Skeleton
export const EventCardSkeleton: React.FC = () => {
  return (
    <View style={styles.eventCard}>
      <SkeletonLoader height={100} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <SkeletonLoader width="70%" height={18} style={styles.eventTitle} />
        <SkeletonLoader width="50%" height={14} style={styles.eventDate} />
        <View style={styles.eventMeta}>
          <SkeletonLoader width={60} height={12} />
          <SkeletonLoader width={40} height={12} />
        </View>
      </View>
    </View>
  );
};

// Map Marker Skeleton
export const MapMarkerSkeleton: React.FC = () => {
  return (
    <View style={styles.markerContainer}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
    </View>
  );
};

// List Skeleton (for horizontal scrolling lists)
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader width={60} height={60} borderRadius={30} />
          <View style={styles.listItemContent}>
            <SkeletonLoader width="80%" height={16} />
            <SkeletonLoader width="60%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
};

// Activity Feed Skeleton
export const ActivityFeedSkeleton: React.FC = () => {
  return (
    <View style={styles.activityFeed}>
      {Array.from({ length: 5 }).map((_, index) => (
        <View key={index} style={styles.activityItem}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
          <View style={styles.activityContent}>
            <SkeletonLoader width="70%" height={14} />
            <SkeletonLoader width="50%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    width: 200,
  },
  
  // Venue Card Skeleton
  venueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  venueImage: {
    borderRadius: 8,
    marginBottom: 12,
  },
  venueContent: {
    gap: 8,
  },
  venueTitle: {
    marginBottom: 4,
  },
  venueDescription: {
    marginBottom: 8,
  },
  venueMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Event Card Skeleton
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    borderRadius: 8,
    marginBottom: 12,
  },
  eventContent: {
    gap: 6,
  },
  eventTitle: {
    marginBottom: 4,
  },
  eventDate: {
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Map Marker Skeleton
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // List Skeleton
  listContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  listItem: {
    alignItems: 'center',
    gap: 8,
  },
  listItemContent: {
    gap: 4,
  },
  
  // Activity Feed Skeleton
  activityFeed: {
    padding: 16,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Venue } from '../types';

interface VenueCardProps {
  venue: Venue;
  onPress: (venue: Venue) => void;
  style?: any;
  compact?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.44;

const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress, style, compact = false }) => {
  return (
    <TouchableOpacity
      style={[styles.container, compact ? styles.compactContainer : {}, style]}
      onPress={() => onPress(venue)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: venue.imageUrl }} style={styles.image} />

      {venue.isCheckedIn && (
        <View style={styles.checkedInBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#fff" />
          <Text style={styles.checkedInText}>Checked In</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{venue.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.type}>{venue.category}</Text>
          {!compact && (
            <>
              <Text style={styles.dot}>•</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.rating}>{venue.rating ?? '4.5'}</Text>
              </View>
            </>
          )}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={14} color="#fff" />
            <Text style={styles.statText}>{venue.activeUsers}</Text>
          </View>
          {!compact && venue.distance && (
            <View style={styles.stat}>
              <Ionicons name="location-outline" size={14} color="#fff" />
              <Text style={styles.statText}>{venue.distance}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#1a1f2c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  compactContainer: {
    width: 140,
    height: 160,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  checkedInBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4dabf7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  checkedInText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 2,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    color: '#ddd',
    fontSize: 12,
  },
  dot: {
    color: '#ddd',
    fontSize: 12,
    marginHorizontal: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
});

export default VenueCard;

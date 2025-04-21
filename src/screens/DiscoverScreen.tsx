import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import VenueCard from '../components/VenueCard';
import { useVenues } from '../context/VenueContext';
import { Venue } from '../types';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'trending', name: 'Trending', icon: 'trending-up' },
  { id: 'nightclubs', name: 'Nightclubs', icon: 'moon' },
  { id: 'bars', name: 'Bars', icon: 'wine' },
  { id: 'events', name: 'Events', icon: 'calendar' },
  { id: 'live', name: 'Live Music', icon: 'musical-notes' },
  { id: 'beach', name: 'Beach Clubs', icon: 'umbrella' },
];

const DiscoverScreen = () => {
  const navigation = useNavigation();
  const { venues = [], refreshVenues = () => {}, isLoading = false } = useVenues() || {};

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animation for the featured banner
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [venues, selectedCategory, searchQuery]);

  const filterVenues = () => {
    let filtered = [...venues];

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'trending') {
        filtered = filtered.filter((venue) => venue.rating >= 4.7);
      } else if (selectedCategory === 'nightclubs') {
        filtered = filtered.filter((venue) =>
          venue.type.toLowerCase().includes('nightclub')
        );
      } else if (selectedCategory === 'bars') {
        filtered = filtered.filter((venue) =>
          venue.type.toLowerCase().includes('bar') ||
          venue.type.toLowerCase().includes('lounge')
        );
      } else if (selectedCategory === 'live') {
        filtered = filtered.filter((venue) =>
          venue.type.toLowerCase().includes('live') ||
          venue.type.toLowerCase().includes('music') ||
          venue.type.toLowerCase().includes('jazz')
        );
      } else if (selectedCategory === 'beach') {
        filtered = filtered.filter((venue) =>
          venue.type.toLowerCase().includes('beach') ||
          venue.type.toLowerCase().includes('pool')
        );
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(query) ||
          venue.type.toLowerCase().includes(query) ||
          venue.city.toLowerCase().includes(query)
      );
    }

    setFilteredVenues(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshVenues();
    } catch (error) {
      console.error('Error refreshing venues:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleVenuePress = (venue: Venue) => {
    navigation.navigate('VenueDetails' as never, { venueId: venue.id } as never);
  };

  const renderVenueItem = ({ item }: { item: Venue }) => (
    <VenueCard
      venue={item}
      onPress={handleVenuePress}
      style={styles.venueCard}
    />
  );

  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View
        style={[
          styles.categoryIcon,
          selectedCategory === item.id && styles.categoryIconSelected,
        ]}
      >
        <Ionicons
          name={item.icon as any}
          size={18}
          color={selectedCategory === item.id ? '#fff' : '#4dabf7'}
        />
      </View>
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.categoryTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle='light-content' />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map' as never)}
        >
          <Ionicons name='map-outline' size={24} color='#fff' />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name='search' size={20} color='#8e8e93' style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder='Search venues, events...'
          placeholderTextColor='#8e8e93'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name='close-circle' size={18} color='#8e8e93' />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategoryItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#4dabf7' />
        </View>
      ) : filteredVenues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name='search' size={60} color='#4dabf7' />
          <Text style={styles.emptyTitle}>No venues found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search or category filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVenues}
          renderItem={renderVenueItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.venueRow}
          contentContainerStyle={styles.venuesList}
          showsVerticalScrollIndicator={false}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListHeaderComponent={
            <Animated.View style={[styles.featuredContainer, { opacity: fadeAnim }]}>
              <View style={styles.featuredGradient}>
                <View style={styles.featuredContent}>
                  <Ionicons name='flash' size={24} color='#fff' />
                  <View style={styles.featuredTextContainer}>
                    <Text style={styles.featuredTitle}>Weekend Special</Text>
                    <Text style={styles.featuredSubtitle}>50% off at premium venues</Text>
                  </View>
                  <TouchableOpacity style={styles.featuredButton}>
                    <Text style={styles.featuredButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  mapButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1f2c',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2c',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 46,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2c',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  categoryItemSelected: {
    backgroundColor: '#4dabf7',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryIconSelected: {
    color: '#fff',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
  venuesList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  venueRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  venueCard: {
    marginBottom: 20,
  },
  featuredContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  featuredGradient: {
    borderRadius: 16,
    backgroundColor: '#4dabf7',
    overflow: 'hidden',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featuredTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  featuredButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  featuredButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DiscoverScreen;

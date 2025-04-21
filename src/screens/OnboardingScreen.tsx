import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Welcome to Nata',
    description: 'The app that connects you with people at nightlife venues in real-time.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1740',
    icon: 'moon',
  },
  {
    id: '2',
    title: 'Check In at Venues',
    description: 'Scan the venue QR code to check in and see who else is there.',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740',
    icon: 'scan',
  },
  {
    id: '3',
    title: 'Connect with People',
    description: 'Use credits to start conversations with people at the same venue.',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1769',
    icon: 'people',
  },
  {
    id: '4',
    title: 'Timed Chats',
    description: 'Chats are timed to keep things exciting. Extend them with credits if you want to keep talking.',
    image: 'https://images.unsplash.com/photo-1578736641330-3155e606cd40?q=80&w=1740',
    icon: 'time',
  },
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('Register' as never);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Register' as never);
  };

  const renderItem = ({ item, index }: { item: typeof ONBOARDING_DATA[0], index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.overlay} />
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon as any} size={40} color="#fff" />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {ONBOARDING_DATA.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <View style={styles.footer}>
        <Button
          title={currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
          icon="arrow-forward"
          iconPosition="right"
          onPress={handleNext}
          style={styles.nextButton}
          fullWidth
        />

        {currentIndex === ONBOARDING_DATA.length - 1 && (
          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#aaa',
    fontSize: 16,
  },
  slide: {
    width,
    height,
  },
  imageContainer: {
    width,
    height: height * 0.6,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  iconContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#aaa',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  nextButton: {
    marginBottom: 10,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    color: '#aaa',
    fontSize: 16,
  },
});

export default OnboardingScreen;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types';

interface UserCardProps {
  user: User;
  onPress: (user: User) => void;
  style?: any;
}

const UserCard: React.FC<UserCardProps> = ({ user, onPress, style }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(user)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        {user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{user.age}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.infoText}>{user.gender}</Text>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#aaa" />
          <Text style={styles.locationText}>{user.city}, {user.country}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.connectButton} onPress={() => onPress(user)}>
        <Ionicons name="chatbubble-outline" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2c',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4dabf7',
    borderWidth: 2,
    borderColor: '#1a1f2c',
  },
  content: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
  },
  dot: {
    color: '#aaa',
    fontSize: 14,
    marginHorizontal: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#aaa',
    fontSize: 12,
    marginLeft: 4,
  },
  connectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserCard;

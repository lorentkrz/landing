// components/ConversationItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import type { Conversation } from '../types';

type Props = {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
};

const ConversationItem = ({ conversation, onPress }: Props) => {
  const { user, lastMessage } = conversation;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(conversation)}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ccc',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
});

export default ConversationItem;

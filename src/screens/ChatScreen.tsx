import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '../components/Header';
import { useCredits } from '../context/CreditsContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { useCredit } = useCredits();

  const { userId, userName, userAvatar, isNewChat, conversationId } = route.params as {
    userId: string;
    userName: string;
    userAvatar: string;
    isNewChat?: boolean;
    conversationId?: string;
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(100); // 100 seconds
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [isExtending, setIsExtending] = useState(false);
  const [hasCreditsAvailable, setHasCreditsAvailable] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkCredits = async () => {
      setHasCreditsAvailable(await useCredit());
    };
    checkCredits();
  }, [useCredit]);

  useEffect(() => {
    if (isNewChat) {
      setMessages([{
        id: '1',
        text: `Hi! I'm ${userName.split(' ')[0]}. Nice to connect with you!`,
        isUser: false,
        timestamp: new Date(),
      }]);
    } else {
      setMessages([
        {
          id: '1',
          text: `Hi! I'm ${userName.split(' ')[0]}. Nice to connect with you!`,
          isUser: false,
          timestamp: new Date(Date.now() - 60000),
        },
        {
          id: '2',
          text: 'Hey there! Nice to meet you too. Are you enjoying the venue?',
          isUser: true,
          timestamp: new Date(Date.now() - 50000),
        },
        {
          id: '3',
          text: 'Yes, it\'s amazing! The music is great. What brings you here tonight?',
          isUser: false,
          timestamp: new Date(Date.now() - 40000),
        },
      ]);
    }

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isNewChat, userName]);

  const startTimer = () => {
    setIsTimerActive(true);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    setTimeout(() => {
      const replies = [
        'That sounds interesting!',
        'I agree with you.',
        'What do you think about the music?',
        'Have you been to this place before?',
        'Would you like to grab a drink?',
      ];

      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, replyMessage]);
    }, 1000 + Math.random() * 2000);
  };

  const handleExtendTime = async () => {
    setIsExtending(true);

    try {
      if (hasCreditsAvailable) {
        setTimeRemaining(prev => prev + 100);

        if (!isTimerActive) {
          startTimer();
        }

        const systemMessage: Message = {
          id: Date.now().toString(),
          text: 'Chat time extended by 100 seconds.',
          isUser: true,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, systemMessage]);
      } else {
        Alert.alert(
          'Insufficient Credits',
          'You need 1 credit to extend the chat. Would you like to purchase more credits?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy Credits', onPress: () => navigation.navigate('Credits' as never) }
          ]
        );
      }
    } finally {
      setIsExtending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isSystem = item.text.includes('Chat time extended');

    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, item.isUser ? styles.userMessageContainer : styles.otherMessageContainer]}>
        {!item.isUser && <Image source={{ uri: userAvatar }} style={styles.avatar} />}
        <View style={[styles.messageBubble, item.isUser ? styles.userMessageBubble : styles.otherMessageBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {item.timestamp.getHours()}:{item.timestamp.getMinutes().toString().padStart(2, '0')}
          </Text>
        </View>
        {item.isUser && <View style={styles.avatarPlaceholder} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title={userName} showBackButton />

      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={16} color={timeRemaining > 30 ? "#4dabf7" : "#ff6b6b"} />
        <Text style={[styles.timerText, timeRemaining > 30 ? styles.timerNormal : styles.timerLow]}>
          {formatTime(timeRemaining)}
        </Text>
        <TouchableOpacity style={styles.extendButton} onPress={handleExtendTime} disabled={isExtending}>
          <Text style={styles.extendButtonText}>{isExtending ? 'Extending...' : 'Extend +100s'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {timeRemaining > 0 ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#8e8e93"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.expiredContainer}>
          <Text style={styles.expiredText}>Chat time expired</Text>
          <TouchableOpacity style={styles.extendChatButton} onPress={handleExtendTime} disabled={isExtending}>
            <Text style={styles.extendChatButtonText}>{isExtending ? 'Extending...' : 'Extend Chat (1 Credit)'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#1a1f2c',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  timerNormal: {
    color: '#4dabf7',
  },
  timerLow: {
    color: '#ff6b6b',
  },
  extendButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(77, 171, 247, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  extendButtonText: {
    color: '#4dabf7',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
  },
  userMessageBubble: {
    backgroundColor: '#4dabf7',
    borderTopRightRadius: 0,
    marginLeft: 'auto',
  },
  otherMessageBubble: {
    backgroundColor: '#2a2e3d',
    borderTopLeftRadius: 0,
    marginRight: 'auto',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
  messageTime: {
    fontSize: 10,
    color: '#aaa',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    marginLeft: 8,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  systemMessageText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1f2c',
    backgroundColor: '#0a0e17',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#2a2e3d',
    borderRadius: 20,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#4dabf7',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#3a3e4d',
  },
  expiredContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1f2c',
  },
  expiredText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  extendChatButton: {
    backgroundColor: '#4dabf7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  extendChatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatScreen;

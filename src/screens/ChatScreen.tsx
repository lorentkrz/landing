"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useCredits } from "../context/CreditsContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useAppNavigation } from "../navigation/useAppNavigation";
import Button from "../components/Button";
import { track } from "../utils/analytics";

type MessageItem = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
};

const ChatScreen = () => {
  const navigation = useAppNavigation();
  const route = useRoute();
  const { spendCredits } = useCredits();
  const { user } = useAuth();

  const { conversationId, userId, userName, userAvatar } = route.params as {
    conversationId: string;
    userId: string;
    userName: string;
    userAvatar: string;
  };

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [isExtending, setIsExtending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("sent_at", { ascending: true });
      if (!error && data) {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            text: msg.body,
            isUser: msg.sender_id === user?.id,
            timestamp: new Date(msg.sent_at),
            status: msg.sender_id === user?.id ? "delivered" : "read",
          })),
        );
      }
    };

    const channel = supabase
      .channel(`public:messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => [
            ...prev,
            {
            id: newMsg.id,
            text: newMsg.body,
            isUser: newMsg.sender_id === user?.id,
            timestamp: new Date(newMsg.sent_at),
            status: newMsg.sender_id === user?.id ? "delivered" : "read",
          },
        ]);
      },
      )
      .subscribe();

    loadMessages();
    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, user?.id]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = useMemo(() => {
    return `${Math.floor(timeRemaining / 60)}:${`0${timeRemaining % 60}`.slice(-2)}`;
  }, [timeRemaining]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id) return;
    const text = inputText.trim();
    setInputText("");
    const tempId = Date.now().toString();
    setMessages((prev) => [...prev, { id: tempId, text, isUser: true, timestamp: new Date(), status: "sent" }]);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: userId,
      body: text,
    });
    if (error) {
      Alert.alert("Failed to send", "Please try again.");
      return;
    }
    setMessages((prev) =>
      prev.map((msg) => (msg.id === tempId ? { ...msg, status: "delivered" } : msg)),
    );
    track("message_send", { conversationId, targetUser: userId });
  };

  const handleExtendTime = async () => {
    setIsExtending(true);
    try {
      const success = await spendCredits(1, "Chat extension");
      if (!success) {
        Alert.alert("Need credits", "Add credits to extend this chat.", [
          { text: "Cancel", style: "cancel" },
          { text: "Buy credits", onPress: () => navigation.navigate("Credits") },
        ]);
        return;
      }
      setTimeRemaining((prev) => prev + 60);
    } finally {
      setIsExtending(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageItem }) => (
    <View style={[styles.bubbleRow, item.isUser ? styles.bubbleRowUser : styles.bubbleRowOther]}>
      {!item.isUser && <Image source={{ uri: userAvatar }} style={styles.avatar} />}
      <View style={[styles.messageBubble, item.isUser ? styles.bubbleUser : styles.bubbleOther]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.messageTime}>{item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
          {item.isUser && (
            <View style={styles.statusPill}>
              <Ionicons
                name={item.status === "read" ? "checkmark-done" : "checkmark"}
                size={12}
                color={item.status === "read" ? "#b8f7ff" : "#d7e7ff"}
              />
              <Text style={styles.statusText}>{item.status ?? "sent"}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{userName}</Text>
          <Text style={styles.headerMeta}>{isTyping ? "typing…" : "Tap to view profile"}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile", { userId })}>
          <Ionicons name="person-circle-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.timerBar}>
        <Ionicons name="time-outline" size={16} color={timeRemaining > 30 ? "#4dabf7" : "#ff6b6b"} />
        <Text style={[styles.timerText, timeRemaining <= 30 && styles.timerLow]}>{formatTime}</Text>
        <TouchableOpacity style={styles.extendButton} onPress={handleExtendTime} disabled={isExtending}>
          <Text style={styles.extendText}>{isExtending ? "Extending…" : "+60s (1 credit)"}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputRow}>
          <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#8e95bd"
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            setIsTyping(true);
            if (typingTimer.current) clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setIsTyping(false), 1200);
          }}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030612",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerMeta: {
    color: "#8e95bd",
    fontSize: 12,
  },
  timerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#101632",
  },
  timerText: {
    color: "#4dabf7",
    fontWeight: "700",
    fontSize: 14,
  },
  timerLow: {
    color: "#ff6b6b",
  },
  extendButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(77,171,247,0.15)",
  },
  extendText: {
    color: "#4dabf7",
    fontSize: 12,
    fontWeight: "600",
  },
  messagesList: {
    padding: 20,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-end",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowOther: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: "#4dabf7",
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: "#111632",
    borderBottomLeftRadius: 2,
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  messageTime: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    color: "#d7e7ff",
    fontSize: 11,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#030612",
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111632",
    color: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4dabf7",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#33405c",
  },
});

export default ChatScreen;

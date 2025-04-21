"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import ConversationItem from "../components/ConversationItem"
import Header from "../components/Header"
import { CONVERSATIONS } from "../data/conversations"
import type { Conversation } from "../types"

const MessagesScreen = () => {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS)
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>(CONVERSATIONS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    filterConversations()
  }, [conversations, activeTab, searchQuery])

  const filterConversations = () => {
    let filtered = [...conversations]

    // Filter by tab
    if (activeTab === "online") {
      filtered = filtered.filter((conversation) => conversation.user.isOnline)
    } else if (activeTab === "active") {
      filtered = filtered.filter((conversation) => conversation.isActive)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (conversation) =>
          conversation.user.firstName.toLowerCase().includes(query) ||
          conversation.user.lastName.toLowerCase().includes(query) ||
          conversation.lastMessage.toLowerCase().includes(query),
      )
    }

    setFilteredConversations(filtered)
  }

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate("Chat" as never, { conversationId: conversation.id } as never)
  }

  const handleNewMessage = () => {
    navigation.navigate("NewMessage" as never)
  }

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <ConversationItem conversation={item} onPress={handleConversationPress} />
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header title="Messages" rightIcon="create-outline" onRightIconPress={handleNewMessage} />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#8e8e93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#8e8e93" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "online" && styles.activeTab]}
          onPress={() => setActiveTab("online")}
        >
          <Text style={[styles.tabText, activeTab === "online" && styles.activeTabText]}>Online</Text>
          <View style={styles.onlineDot} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>Active</Text>
          <Ionicons
            name="time-outline"
            size={14}
            color={activeTab === "active" ? "#4dabf7" : "#aaa"}
            style={styles.tabIcon}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4dabf7" />
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#4dabf7" />
              <Text style={styles.emptyTitle}>No messages found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : activeTab === "online"
                    ? "No contacts are online right now"
                    : activeTab === "active"
                      ? "No active conversations"
                      : "Start connecting with people at venues"}
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Scan" as never)}>
          <Ionicons name="scan-outline" size={22} color="#fff" />
          <Text style={styles.quickActionText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Contacts" as never)}>
          <Ionicons name="people-outline" size={22} color="#fff" />
          <Text style={styles.quickActionText}>Contacts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate("Requests" as never)}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <Text style={styles.quickActionText}>Requests</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1f2c",
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
    height: "100%",
    color: "#fff",
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#1a1f2c",
  },
  tabText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#fff",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4dabf7",
    marginLeft: 6,
  },
  tabIcon: {
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  conversationsList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#1a1f2c",
  },
  quickActionButton: {
    alignItems: "center",
  },
  quickActionText: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 5,
  },
})

export default MessagesScreen
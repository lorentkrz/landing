"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity style={styles.faqQuestion} onPress={onToggle}>
        <Text style={styles.questionText}>{question}</Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#aaa"
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqAnswer}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  )
}

const HelpCenterScreen = () => {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState("")
  const [openFAQ, setOpenFAQ] = useState(null)

  const faqs = [
    {
      id: 1,
      question: "How do credits work?",
      answer: "Credits are used to unlock premium features in the app. You can use them to boost your profile visibility, send special messages, and access exclusive venues. Credits can be purchased in the Credits section of your profile.",
    },
    {
      id: 2,
      question: "How do I change my password?",
      answer: "To change your password, go to your Profile, tap on Settings, then select 'Change Password'. You'll need to enter your current password and then your new password twice to confirm.",
    },
    {
      id: 3,
      question: "How do I delete my account?",
      answer: "To delete your account, go to your Profile, tap on Settings, and scroll down to find the 'Delete Account' option. Please note that account deletion is permanent and cannot be undone.",
    },
    {
      id: 4,
      question: "What are check-ins?",
      answer: "Check-ins allow you to mark your presence at a venue. When you check in, other users at the same venue can see you and connect with you. Check-ins expire after 24 hours.",
    },
    {
      id: 5,
      question: "How do I report inappropriate behavior?",
      answer: "If you encounter inappropriate behavior, you can report a user by visiting their profile, tapping the three dots in the top right corner, and selecting 'Report User'. You can also contact our support team directly for urgent issues.",
    },
  ]

  const filteredFAQs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  const handleContactSupport = () => {
    Linking.openURL("mailto:support@nata.app?subject=Support%20Request")
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#aaa" />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {filteredFAQs.length > 0 ? (
          <View style={styles.faqContainer}>
            {filteredFAQs.map((faq) => (
              <FAQItem
                key={faq.id}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === faq.id}
                onToggle={() => toggleFAQ(faq.id)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
        )}

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Need more help?</Text>
          <Text style={styles.supportText}>
            Our support team is available 24/7 to assist you with any questions or issues you may have.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Ionicons name="mail-outline" size={20} color="#fff" style={styles.contactIcon} />
            <Text style={styles.contactText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 60,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginVertical: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  faqContainer: {
    marginBottom: 30,
  },
  faqItem: {
    marginBottom: 10,
    backgroundColor: "#1a1f2c",
    borderRadius: 8,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  questionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  faqAnswer: {
    padding: 15,
    paddingTop: 0,
  },
  answerText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
  },
  noResultsText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 20,
  },
  supportSection: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  supportTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  supportText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: "#4dabf7",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default HelpCenterScreen

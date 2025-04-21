"use client"

import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const AboutScreen = () => {
  const navigation = useNavigation()
  const appVersion = "1.0.0"

  const handleOpenLink = (url) => {
    Linking.openURL(url)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1550000000000-1?q=80&w=400" }}
            style={styles.logo}
          />
          <Text style={styles.appName}>Nata</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Nata</Text>
          <Text style={styles.sectionText}>
            Nata is a social nightlife app designed to help you discover venues, connect with people, and make the most of your night out. Our mission is to create meaningful connections and unforgettable experiences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.sectionText}>
            We're a passionate team of developers, designers, and nightlife enthusiasts working together to create the best social experience for nightlife lovers around the world.
          </Text>
        </View>

        <View style={styles.linksSection}>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleOpenLink("https://nata.app/privacy")}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="document-text-outline" size={20} color="#4dabf7" />
              <Text style={styles.linkText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleOpenLink("https://nata.app/terms")}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="document-outline" size={20} color="#4dabf7" />
              <Text style={styles.linkText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleOpenLink("https://nata.app/contact")}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="mail-outline" size={20} color="#4dabf7" />
              <Text style={styles.linkText}>Contact Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => handleOpenLink("https://nata.app")}
          >
            <View style={styles.linkLeft}>
              <Ionicons name="globe-outline" size={20} color="#4dabf7" />
              <Text style={styles.linkText}>Website</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>
        </View>

        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenLink("https://instagram.com/nataapp")}
            >
              <Ionicons name="logo-instagram" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenLink("https://twitter.com/nataapp")}
            >
              <Ionicons name="logo-twitter" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenLink("https://facebook.com/nataapp")}
            >
              <Ionicons name="logo-facebook" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenLink("https://tiktok.com/@nataapp")}
            >
              <Ionicons name="logo-tiktok" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.copyright}>© 2023 Nata. All rights reserved.</Text>
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
  logoContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 15,
  },
  appName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 5,
  },
  appVersion: {
    color: "#aaa",
    fontSize: 14,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 22,
  },
  linksSection: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    marginBottom: 25,
    overflow: "hidden",
  },
  linkItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
  },
  socialSection: {
    marginBottom: 25,
  },
  socialTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialIcon: {
    backgroundColor: "#1a1f2c",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  copyright: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 30,
  },
})

export default AboutScreen

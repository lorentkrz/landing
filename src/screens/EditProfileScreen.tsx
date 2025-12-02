"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Button from "../components/Button"
import { useAuth } from "../context/AuthContext"
import { useAppNavigation } from "../navigation/useAppNavigation"

const EditProfileScreen = () => {
  const navigation = useAppNavigation()
  const { user, updateUser } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [avatar, setAvatar] = useState(user?.avatar || "")
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [city, setCity] = useState(user?.city || "")
  const [country, setCountry] = useState(user?.country || "")
  const [age, setAge] = useState(user?.age?.toString() || "")
  const [gender, setGender] = useState(user?.gender || "")
  const [showGenderPicker, setShowGenderPicker] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)
    // In a real app, you would fetch the latest user data from your API
    setTimeout(() => {
      // Mock data fetch
      setIsLoading(false)
    }, 1000)
  }

  const handleSave = async () => {
    // Validate required fields
    if (!firstName.trim()) {
      Alert.alert("Error", "First name is required")
      return
    }

    if (!lastName.trim()) {
      Alert.alert("Error", "Last name is required")
      return
    }

    setIsSaving(true)

    try {
      // In a real app, you would call your API to update the user profile
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        bio,
        city,
        country,
        age: parseInt(age) || 0,
        gender,
        avatar,
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user in context
      await updateUser(updatedUser)

      Alert.alert("Success", "Profile updated successfully")
      navigation.goBack()
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePhoto = () => {
    // In a real app, you would use ImagePicker from expo-image-picker
    Alert.alert(
      "Change Profile Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => console.log("Take Photo pressed"),
        },
        {
          text: "Choose from Library",
          onPress: () => {
            // Mock selecting a new photo
            setAvatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000")
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    )
  }

  const handleSelectGender = (selectedGender) => {
    setGender(selectedGender)
    setShowGenderPicker(false)
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.photoSection}>
          <Image
            source={{ uri: avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887" }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowGenderPicker(true)}>
              <Text style={gender ? styles.inputText : styles.inputPlaceholder}>
                {gender || "Select your gender"}
              </Text>
            </TouchableOpacity>
          </View>

          {showGenderPicker && (
            <View style={styles.genderPicker}>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleSelectGender("Male")}
              >
                <Text style={styles.genderOptionText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleSelectGender("Female")}
              >
                <Text style={styles.genderOptionText}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleSelectGender("Non-binary")}
              >
                <Text style={styles.genderOptionText}>Non-binary</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleSelectGender("Prefer not to say")}
              >
                <Text style={styles.genderOptionText}>Prefer not to say</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderOption, styles.cancelOption]}
                onPress={() => setShowGenderPicker(false)}
              >
                <Text style={styles.cancelOptionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.sectionTitle, styles.locationTitle]}>Location</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>City</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Enter your city"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Country</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Enter your country"
              placeholderTextColor="#aaa"
            />
          </View>

          <Text style={[styles.sectionTitle, styles.bioTitle]}>About You</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself"
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          fullWidth
          loading={isSaving}
        />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0a0e17",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
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
  photoSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  changePhotoButton: {
    backgroundColor: "rgba(77, 171, 247, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  changePhotoText: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
  },
  locationTitle: {
    marginTop: 20,
  },
  bioTitle: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
  },
  inputText: {
    color: "#fff",
    fontSize: 16,
  },
  inputPlaceholder: {
    color: "#aaa",
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  footer: {
    padding: 15,
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
  },
  genderPicker: {
    backgroundColor: "#1a1f2c",
    borderRadius: 8,
    marginTop: -10,
    marginBottom: 15,
    overflow: "hidden",
  },
  genderOption: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  genderOptionText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelOption: {
    borderBottomWidth: 0,
  },
  cancelOptionText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default EditProfileScreen

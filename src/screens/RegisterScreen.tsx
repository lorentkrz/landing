"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Button from "../components/Button"

const RegisterScreen = () => {
  const navigation = useNavigation()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [birthdate, setBirthdate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [birthdateText, setBirthdateText] = useState("")
  const [bio, setBio] = useState("")
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = () => {
    // Check if required fields are filled
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name")
      return
    }

    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name")
      return
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email")
      return
    }

    if (!password) {
      Alert.alert("Error", "Please enter your password")
      return
    }

    if (!birthdateText) {
      Alert.alert("Error", "Please enter your birthday")
      return
    }

    // Mock registration functionality with loading state
    setLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      setLoading(false)
      // Navigate to MainTabs instead of Home
      navigation.navigate("MainTabs")
    }, 1500)
  }

  const handleDateSelect = (day, month, year) => {
    const newDate = new Date(year, month - 1, day)
    setBirthdate(newDate)
    setBirthdateText(`${month}/${day}/${year}`)
    setShowDatePicker(false)
  }

  const handleAddPhoto = () => {
    // Mock photo selection
    // In a real app, you would use ImagePicker from expo-image-picker
    setPhoto("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000")
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>
        </View>

        <View style={styles.photoContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={40} color="#aaa" />
            </View>
          )}
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Text style={styles.addPhotoText}>{photo ? "Change Photo" : "Add Photo"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              placeholderTextColor="#aaa"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              placeholderTextColor="#aaa"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#aaa" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
            <Ionicons name="calendar-outline" size={20} color="#aaa" style={styles.inputIcon} />
            <Text style={[styles.input, !birthdateText && styles.placeholderText]}>
              {birthdateText || "Birthday *"}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <Text style={styles.datePickerTitle}>Select Birthday</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateInputsContainer}>
                  <View style={styles.dateInputGroup}>
                    <Text style={styles.dateInputLabel}>Month</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="MM"
                      placeholderTextColor="#aaa"
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={(text) => {
                        const month = Number.parseInt(text) || 1
                        const day = birthdate.getDate()
                        const year = birthdate.getFullYear()
                        if (month >= 1 && month <= 12) {
                          handleDateSelect(day, month, year)
                        }
                      }}
                      defaultValue={String(birthdate.getMonth() + 1)}
                    />
                  </View>

                  <View style={styles.dateInputGroup}>
                    <Text style={styles.dateInputLabel}>Day</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD"
                      placeholderTextColor="#aaa"
                      keyboardType="number-pad"
                      maxLength={2}
                      onChangeText={(text) => {
                        const day = Number.parseInt(text) || 1
                        const month = birthdate.getMonth() + 1
                        const year = birthdate.getFullYear()
                        if (day >= 1 && day <= 31) {
                          handleDateSelect(day, month, year)
                        }
                      }}
                      defaultValue={String(birthdate.getDate())}
                    />
                  </View>

                  <View style={styles.dateInputGroup}>
                    <Text style={styles.dateInputLabel}>Year</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY"
                      placeholderTextColor="#aaa"
                      keyboardType="number-pad"
                      maxLength={4}
                      onChangeText={(text) => {
                        const year = Number.parseInt(text) || 2000
                        const month = birthdate.getMonth() + 1
                        const day = birthdate.getDate()
                        if (year >= 1920 && year <= new Date().getFullYear()) {
                          handleDateSelect(day, month, year)
                        }
                      }}
                      defaultValue={String(birthdate.getFullYear())}
                    />
                  </View>
                </View>

                <Button
                  title="Confirm"
                  onPress={() => setShowDatePicker(false)}
                  style={styles.confirmDateButton}
                  fullWidth
                />
              </View>
            </View>
          )}

          <View style={[styles.inputContainer, styles.bioContainer]}>
            <Ionicons name="create-outline" size={20} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Bio (optional)"
              placeholderTextColor="#aaa"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <Button
            title="Register"
            onPress={handleRegister}
            style={styles.registerButton}
            fullWidth
            loading={loading}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addPhotoButton: {
    padding: 5,
  },
  addPhotoText: {
    color: "#fff",
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  bioContainer: {
    height: 120,
    alignItems: "flex-start",
    paddingTop: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  bioInput: {
    height: 90,
  },
  placeholderText: {
    color: "#aaa",
  },
  eyeIcon: {
    padding: 10,
  },
  registerButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: "#4dabf7", // Match your app's primary color
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginText: {
    color: "#aaa",
    fontSize: 16,
  },
  loginLink: {
    color: "#4dabf7", // Match your app's primary color
    fontSize: 16,
    fontWeight: "bold",
  },
  datePickerModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  datePickerContainer: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  datePickerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  dateInputsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateInputGroup: {
    width: "30%",
  },
  dateInputLabel: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 5,
  },
  dateInput: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    height: 50,
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  confirmDateButton: {
    marginTop: 10,
    backgroundColor: "#4dabf7", // Match your app's primary color
  },
})

export default RegisterScreen

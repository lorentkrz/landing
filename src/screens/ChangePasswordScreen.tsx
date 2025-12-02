"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Button from "../components/Button"
import { useAuth } from "../context/AuthContext"
import { useAppNavigation } from "../navigation/useAppNavigation"

const ChangePasswordScreen = () => {
  const navigation = useAppNavigation()
  const { updatePassword } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password")
      return
    }

    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password")
      return
    }

    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would call your API to update the password
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update password in context if needed
      if (updatePassword) {
        await updatePassword(currentPassword, newPassword)
      }

      Alert.alert("Success", "Password changed successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to change password. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Create a new password that is at least 8 characters long. A strong password contains a mix of letters, numbers,
          and symbols.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showCurrentPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons
                name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#aaa"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>
        </View>

        {newPassword ? (
          <View style={styles.strengthContainer}>
            <Text style={styles.strengthLabel}>Password Strength:</Text>
            <View style={styles.strengthBars}>
              <View
                style={[
                  styles.strengthBar,
                  newPassword.length >= 4 ? styles.strengthBarFilled : styles.strengthBarEmpty,
                ]}
              />
              <View
                style={[
                  styles.strengthBar,
                  newPassword.length >= 8 ? styles.strengthBarFilled : styles.strengthBarEmpty,
                ]}
              />
              <View
                style={[
                  styles.strengthBar,
                  newPassword.length >= 8 && /[A-Z]/.test(newPassword)
                    ? styles.strengthBarFilled
                    : styles.strengthBarEmpty,
                ]}
              />
              <View
                style={[
                  styles.strengthBar,
                  newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword)
                    ? styles.strengthBarFilled
                    : styles.strengthBarEmpty,
                ]}
              />
            </View>
            <Text style={styles.strengthText}>
              {newPassword.length < 8
                ? "Weak"
                : newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /\d/.test(newPassword)
                ? "Strong"
                : "Medium"}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          title="Change Password"
          onPress={handleChangePassword}
          fullWidth
          loading={isLoading}
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
    paddingTop: 20,
  },
  description: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  strengthContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  strengthLabel: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 8,
  },
  strengthBars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  strengthBarEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  strengthBarFilled: {
    backgroundColor: "#4dabf7",
  },
  strengthText: {
    color: "#4dabf7",
    fontSize: 14,
  },
  footer: {
    padding: 15,
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
  },
})

export default ChangePasswordScreen

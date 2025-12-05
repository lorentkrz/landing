"use client";

import { useState, useMemo } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { useRoute } from "@react-navigation/native";

const PasswordUpdateScreen = () => {
  const navigation = useAppNavigation();
  const route = useRoute();
  const params = (route.params as { email?: string } | undefined) ?? {};
  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const handleUpdate = async () => {
    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();
    if (!trimmedEmail || !isEmailValid) {
      Alert.alert("Error", "Enter a valid email.");
      return;
    }
    if (!trimmedCode || trimmedCode.length < 4) {
      Alert.alert("Error", "Enter the code we sent to your email.");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const { error: otpError, data: otpData } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedCode,
        type: "recovery",
      });
      if (otpError || !otpData) {
        Alert.alert("Reset failed", otpError?.message ?? "Invalid or expired code.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        Alert.alert("Reset failed", updateError.message);
        return;
      }
      Alert.alert("Success", "Password updated. Please log in.", [
        { text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: "Login" as never }] }) },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update password.";
      Alert.alert("Reset failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={["#151a2c", "#05060d"]} style={styles.hero}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.kicker}>Account</Text>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.subtitle}>Enter the code from your email and set a new password.</Text>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#70779e" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#6f779b"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="keypad-outline" size={18} color="#70779e" style={styles.inputIcon} />
              <TextInput
                placeholder="6-digit code"
                placeholderTextColor="#6f779b"
                style={styles.input}
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                editable={!loading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={18} color="#70779e" style={styles.inputIcon} />
              <TextInput
                placeholder="New password"
                placeholderTextColor="#6f779b"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={18} color="#70779e" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor="#6f779b"
                style={styles.input}
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                editable={!loading}
              />
            </View>

            <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={handleUpdate} disabled={loading}>
              <Text style={styles.primaryButtonText}>{loading ? "Updating..." : "Update password"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.navigate("Login")} disabled={loading}>
              <Ionicons name="log-in" size={16} color="#4dabf7" />
              <Text style={styles.backToLoginText}>Return to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030610",
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  kicker: {
    color: "#8c93b5",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
  },
  subtitle: {
    color: "#b4bad6",
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#0c101c",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#111628",
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#111628",
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#4dabf7",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#0a0e17",
    fontWeight: "700",
    fontSize: 16,
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 8,
  },
  backToLoginText: {
    color: "#4dabf7",
    fontWeight: "600",
  },
});

export default PasswordUpdateScreen;

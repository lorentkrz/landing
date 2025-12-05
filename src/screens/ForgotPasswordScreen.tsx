"use client";

import { useState } from "react";
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
import Button from "../components/Button";
import * as Linking from "expo-linking";

const ForgotPasswordScreen = () => {
  const navigation = useAppNavigation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Use a valid email format.");
      return;
    }
    try {
      setStatus("sending");
      setError(null);
      await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: Linking.createURL("/reset-password"),
      });
      setStatus("sent");
      navigation.navigate("ResetPassword", { email: trimmedEmail });
      Alert.alert("Check your inbox", "Enter the code we sent to your email to reset your password.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to send reset instructions right now.";
      setError(message);
      setStatus("idle");
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
            <Text style={styles.title}>Forgot password</Text>
            <Text style={styles.subtitle}>
              Enter the email linked to your account and we’ll send reset instructions.
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={18} color="#70779e" style={styles.inputIcon} />
              <TextInput
                placeholder="Email address"
                placeholderTextColor="#6f779b"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError(null);
                }}
                editable={status !== "sending"}
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button title="Send reset link" onPress={handleSubmit} loading={status === "sending"} />

            {status === "sent" ? (
              <View style={styles.successRow}>
                <Ionicons name="checkmark-circle" size={18} color="#4dabf7" />
                <Text style={styles.successText}>Email sent. Check your inbox.</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => navigation.navigate("Login")}
              disabled={status === "sending"}
            >
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
  errorText: {
    color: "#ff7676",
    fontSize: 12,
    marginBottom: -4,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successText: {
    color: "#8ad7ff",
    fontSize: 13,
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 4,
  },
  backToLoginText: {
    color: "#4dabf7",
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;

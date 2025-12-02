"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../components/Button";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { useAuth } from "../context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { REMEMBER_ME_KEY, REMEMBERED_EMAIL_KEY } from "../constants/storageKeys";

const LoginScreen = () => {
  const navigation = useAppNavigation();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const canGoBack = navigation.canGoBack();
  const isFormValid = /\S+@\S+\.\S+/.test(email.trim()) && password.length >= 6;

  useEffect(() => {
    const loadRemembered = async () => {
      try {
        const remembered = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
        if (remembered === "true") {
          const savedEmail = await SecureStore.getItemAsync(REMEMBERED_EMAIL_KEY);
          if (savedEmail) {
            setEmail(savedEmail);
          }
          setRememberMe(true);
        }
      } catch (error) {
        console.warn("Failed to load remembered credentials", error);
      }
    };
    loadRemembered();
  }, []);

  const persistRememberPreference = async (value: boolean, emailValue: string) => {
    try {
      if (value) {
        await SecureStore.setItemAsync(REMEMBER_ME_KEY, "true");
        await SecureStore.setItemAsync(REMEMBERED_EMAIL_KEY, emailValue);
      } else {
        await SecureStore.deleteItemAsync(REMEMBER_ME_KEY);
        await SecureStore.deleteItemAsync(REMEMBERED_EMAIL_KEY);
      }
    } catch (error) {
      console.warn("Failed to persist remember me preference", error);
    }
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      nextErrors.email = "Enter a valid email.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(email.trim(), password);
      await persistRememberPreference(rememberMe, email.trim());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please check your credentials and try again.";
      Alert.alert("Login failed", message);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleCTAPress = () => {
    if (!validate()) return;
    handleLogin();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient colors={["#151a2c", "#05060d"]} style={styles.hero}>
            {canGoBack && (
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>
            )}
            <Text style={styles.kicker}>Welcome back</Text>
            <Text style={styles.title}>Log back into the vibe.</Text>
            <Text style={styles.subtitle}>Track venues you love and jump straight into the guest list.</Text>
          </LinearGradient>

          <View style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#7f85a2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6c7495"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#7f85a2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#6c7495"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
              />
              <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword((prev) => !prev)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#7f85a2" />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <View style={styles.preferenceRow}>
              <View style={styles.rememberRow}>
                <Text style={styles.rememberText}>Remember me</Text>
                <Switch
                  value={rememberMe}
                  onValueChange={async (value) => {
                    setRememberMe(value);
                    if (!value) {
                      await persistRememberPreference(false, "");
                    } else if (email.trim()) {
                      await persistRememberPreference(true, email.trim());
                    }
                  }}
                  trackColor={{ true: "#4dabf7", false: "#2b314d" }}
                  thumbColor="#fff"
                />
              </View>
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Login"
              onPress={handleCTAPress}
              fullWidth
              loading={isLoading}
              disabled={!isFormValid || isLoading}
              style={styles.primaryButton}
            />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New to Nataa? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  kicker: {
    color: "#8c93b5",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
  },
  subtitle: {
    color: "#b4bad6",
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#0c101c",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 24,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
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
  eyeIcon: {
    paddingHorizontal: 8,
    height: "100%",
    justifyContent: "center",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: "#8c93b5",
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 10,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  preferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rememberText: {
    color: "#8c93b5",
    fontSize: 14,
  },
  registerText: {
    color: "#8c93b5",
  },
  registerLink: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default LoginScreen;

import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useAppNavigation } from "../navigation/useAppNavigation";

type VerifyEmailScreenProps = {
  route: { params: { email: string } };
};

const VerifyEmailScreen = ({ route }: VerifyEmailScreenProps) => {
  const navigation = useAppNavigation();
  const { verifyEmailCode, resendVerificationCode, isLoading, pendingRegistrationEmail } = useAuth();
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const email = route.params?.email ?? pendingRegistrationEmail ?? "";

  const handleVerify = async () => {
    if (!email) {
      Alert.alert("Missing email", "Go back and start signup again.");
      return;
    }
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      Alert.alert("Enter code", "Type the 6-digit code from your email.");
      return;
    }
    try {
      await verifyEmailCode(email, trimmed);
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" as never }],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed. Please try again.";
      Alert.alert("Invalid code", message);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert("Missing email", "Go back and start signup again.");
      return;
    }
    try {
      setIsResending(true);
      await resendVerificationCode(email);
      Alert.alert("New code sent", `Check ${email} for the latest code.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not resend code right now.";
      Alert.alert("Resend failed", message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <LinearGradient colors={["#151a3c", "#090c16"]} style={styles.hero}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.kicker}>One step left</Text>
          <Text style={styles.title}>Check your inbox</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code we sent to</Text>
          <Text style={styles.email}>{email}</Text>
        </LinearGradient>

        <View style={styles.card}>
          <View style={styles.codeRow}>
            <Ionicons name="keypad-outline" size={20} color="#7f85a2" />
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor="#6c7495"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.codeInput}
            />
          </View>
          <Text style={styles.helperText}>
            Codes expire after 10 minutes. If you don&apos;t see the email, check spam or tap resend.
          </Text>

          <Button title="Verify email" fullWidth loading={isLoading} disabled={isLoading} onPress={handleVerify} />

          <TouchableOpacity
            style={styles.resendRow}
            onPress={handleResend}
            disabled={isResending || isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={16} color="#4dabf7" />
            <Text style={[styles.resendText, isResending && { opacity: 0.6 }]}>
              {isResending ? "Sending..." : "Resend code"}
            </Text>
          </TouchableOpacity>
        </View>
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
  hero: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
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
  email: {
    color: "#5ce1ff",
    fontWeight: "700",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#0c101c",
    marginHorizontal: 20,
    marginTop: -26,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  codeInput: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    letterSpacing: 2,
  },
  helperText: {
    color: "#8c93b5",
    fontSize: 13,
    lineHeight: 18,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
  },
  resendText: {
    color: "#4dabf7",
    fontWeight: "700",
  },
});

export default VerifyEmailScreen;

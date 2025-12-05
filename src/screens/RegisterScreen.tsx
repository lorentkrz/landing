"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Image,
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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DatePicker from "react-native-date-picker";
import * as ImagePicker from "expo-image-picker";
import Button from "../components/Button";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { useAuth } from "../context/AuthContext";
import * as Linking from "expo-linking";

const RegisterScreen = () => {
  const navigation = useAppNavigation();
  const { register, isLoading } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [birthdate, setBirthdate] = useState(new Date(2000, 0, 1));
  const [birthdateLabel, setBirthdateLabel] = useState("");
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [referralCode, setReferralCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isFormValid =
    !!firstName.trim() &&
    !!lastName.trim() &&
    /\S+@\S+\.\S+/.test(email.trim()) &&
    password.length >= 6 &&
    !!birthdateLabel &&
    acceptedTerms;

  const ageMinimumDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 60);
    return date;
  }, []);

  const ageMaximumDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date;
  }, []);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);

  const validate = () => {
    const nextErrors: Record<string, string | undefined> = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password || password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!birthdateLabel) {
      nextErrors.birthdate = "Select your date of birth.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      const { email: registeredEmail } = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        bio: bio.trim(),
        avatar: photo ?? undefined,
        birthdate: birthdate.toISOString().split("T")[0],
        referralCode: referralCode.trim(),
      });

      // Force the email verification flow regardless of session state.
      navigation.navigate("VerifyEmail", { email: registeredEmail });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      Alert.alert("Registration Error", message);
    }
  };

  const handleDateConfirm = (selectedDate: Date) => {
    setIsDatePickerVisible(false);
    setBirthdate(selectedDate);
    setBirthdateLabel(formatDate(selectedDate));
    if (errors.birthdate) setErrors((prev) => ({ ...prev, birthdate: undefined }));
  };

  const handleAddPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission required", "Allow photo library access to choose a profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhoto(result.assets[0]?.uri ?? null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to pick an image right now.";
      Alert.alert("Photo selection failed", message);
    }
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
          <LinearGradient colors={["#1a1f33", "#05060d"]} style={styles.hero}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.kicker}>Create profile</Text>
            <Text style={styles.title}>Tell us who’s joining the party.</Text>
            <Text style={styles.subtitle}>Real names only. We use this to keep guest lists curated.</Text>
          </LinearGradient>

          <View style={styles.formCard}>
            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoPlaceholder} onPress={handleAddPhoto}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.profilePhoto} />
                ) : (
                  <>
                    <Ionicons name="camera" size={24} color="#d0d5f2" />
                    <Text style={styles.addPhotoText}>Add photo</Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={styles.photoCopy}>
                <Text style={styles.photoTitle}>Your first impression</Text>
                <Text style={styles.photoSubtitle}>Clear, recent photo only. Swap anytime from your profile.</Text>
              </View>
            </View>

            <View style={styles.inputContainerTall}>
              <Ionicons name="person-outline" size={20} color="#7f85a2" style={styles.inputIcon} />
              <TextInput
                style={styles.inputLarge}
                placeholder="First name"
                placeholderTextColor="#6c7495"
                value={firstName}
                onChangeText={(value) => {
                  setFirstName(value);
                  if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
              />
            </View>
            <View style={styles.inputContainerTall}>
              <Ionicons name="person-outline" size={20} color="#7f85a2" style={styles.inputIcon} />
              <TextInput
                style={styles.inputLarge}
                placeholder="Last name"
                placeholderTextColor="#6c7495"
                value={lastName}
                onChangeText={(value) => {
                  setLastName(value);
                  if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
              />
            </View>
            {(errors.firstName || errors.lastName) && (
              <Text style={styles.errorText}>{errors.firstName ?? errors.lastName}</Text>
            )}

            <View style={styles.inputContainerTall}>
              <Ionicons name="mail-outline" size={20} color="#7f85a2" style={styles.inputIcon} />
              <TextInput
                style={styles.inputLarge}
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

            <View style={styles.inputContainerTall}>
              <Ionicons name="lock-closed-outline" size={20} color="#7f85a2" style={styles.inputIcon} />
              <TextInput
                style={styles.inputLarge}
                placeholder="Password"
                placeholderTextColor="#6c7495"
                autoCapitalize="none"
                secureTextEntry={!showPassword}
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

            <View>
              <View style={styles.inputContainerTall}>
                <Ionicons name="gift-outline" size={20} color="#7f85a2" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputLarge}
                  placeholder="Referral code (optional)"
                  placeholderTextColor="#6c7495"
                  value={referralCode}
                  onChangeText={(value) => setReferralCode(value.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={12}
                />
              </View>
              <Text style={styles.helperText}>If someone invited you, enter their code to unlock bonus credits.</Text>
            </View>

            <TouchableOpacity style={styles.inputContainerTall} onPress={() => setIsDatePickerVisible(true)}>
              <Ionicons name="calendar" size={20} color="#7f85a2" style={styles.inputIcon} />
              <Text style={[styles.inputLarge, !birthdateLabel && styles.placeholder]}>
                {birthdateLabel || "Birthdate"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#7f85a2" />
            </TouchableOpacity>
            {errors.birthdate && <Text style={styles.errorText}>{errors.birthdate}</Text>}

            <View style={[styles.inputContainer, styles.bioContainer]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                placeholder="Bio (what's your vibe?)"
                placeholderTextColor="#6c7495"
                multiline
                value={bio}
                onChangeText={(value) => setBio(value)}
              />
            </View>

            <View style={styles.termsRow}>
              <TouchableOpacity onPress={() => setAcceptedTerms((prev) => !prev)} style={styles.checkbox}>
                {acceptedTerms ? (
                  <Ionicons name="checkbox" size={20} color="#4dabf7" />
                ) : (
                  <Ionicons name="square-outline" size={20} color="#6c7495" />
                )}
              </TouchableOpacity>
              <Text style={styles.termsCopy}>
                I agree to the{" "}
                <Text style={styles.link} onPress={() => Linking.openURL("https://nata.app/terms")}>
                  Terms
                </Text>{" "}
                and{" "}
                <Text style={styles.link} onPress={() => Linking.openURL("https://nata.app/privacy")}>
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>

            <Button
              title="Create account"
              fullWidth
              loading={isLoading}
              disabled={isLoading || !isFormValid}
              onPress={handleRegister}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginCopy}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DatePicker
        modal
        mode="date"
        open={isDatePickerVisible}
        date={birthdate}
        maximumDate={ageMaximumDate}
        minimumDate={ageMinimumDate}
        onConfirm={handleDateConfirm}
        onCancel={() => setIsDatePickerVisible(false)}
        theme="dark"
      />
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
    paddingBottom: 40,
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
  photoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 16,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#151b30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  profilePhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  addPhotoText: {
    color: "#d0d5f2",
    fontSize: 12,
    marginTop: 6,
  },
  photoCopy: {
    flex: 1,
  },
  photoTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  photoSubtitle: {
    color: "#8c93b5",
    marginTop: 4,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#111628",
    paddingHorizontal: 14,
    height: 56,
  },
  inputContainerTall: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: "#111628",
    paddingHorizontal: 16,
    height: 64,
    marginTop: 6,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  inputLarge: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
  },
  placeholder: {
    color: "#6c7495",
  },
  eyeIcon: {
    paddingHorizontal: 8,
    height: "100%",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spacer: {
    width: 12,
  },
  bioContainer: {
    height: 120,
    alignItems: "flex-start",
    paddingTop: 14,
  },
  bioInput: {
    textAlignVertical: "top",
    height: "100%",
  },
  helperText: {
    color: "#6c7495",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  termsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 4,
  },
  checkbox: {
    padding: 4,
  },
  termsCopy: {
    color: "#8c93b5",
    flex: 1,
    fontSize: 13,
  },
  link: {
    color: "#4dabf7",
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  loginCopy: {
    color: "#8c93b5",
  },
  loginLink: {
    color: "#4dabf7",
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: -2,
    marginBottom: 6,
    marginLeft: 4,
  },
});

export default RegisterScreen;

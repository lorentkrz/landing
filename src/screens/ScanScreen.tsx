"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Button from "../components/Button";
import { useVenues } from "../context/VenueContext";
import { useAppNavigation } from "../navigation/useAppNavigation";
import { haversineKm } from "../utils/geo";
import { track } from "../utils/analytics";

const { width } = Dimensions.get("window");

const ScanScreen = () => {
  const navigation = useAppNavigation();
  const { venues, checkInToVenue } = useVenues();
  const [permission, requestPermission] = useCameraPermissions();
  const [flashOn, setFlashOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const frameAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(frameAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(frameAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();

    return () => {
      frameAnim.stopAnimation();
      scanLineAnim.stopAnimation();
    };
  }, [frameAnim, scanLineAnim]);

  const frameBorderColor = frameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(77,171,247,0.5)", "rgba(77,171,247,1)"],
  });

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(width * 0.3), width * 0.3],
  });

  const permissionCopy = useMemo(
    () => ({
      title: "Camera permission required",
      description: "Allow access so you can scan the venue QR code at the entrance.",
    }),
    [],
  );

  const resolveVenueId = (rawData: string | undefined) => {
    if (!rawData) return null;
    if (rawData.includes(":")) {
      const [, id] = rawData.split(":");
      if (id && venues.some((venue) => venue.id === id)) {
        return id;
      }
    }
    return venues[0]?.id ?? null;
  };

  const processScan = async (data: string) => {
    if (scanned || processing) return;
    setScanned(true);
    setProcessing(true);
    Vibration.vibrate(150);

    try {
      const venueId = resolveVenueId(data);
      if (!venueId) throw new Error("Unknown venue");

      await checkInToVenue(venueId, undefined, { overrideProximity: true });
      track("check_in", { via: "qr", venueId });
      navigation.navigate("VenueDetails", { venueId });
    } catch (error) {
      Alert.alert("Invalid QR code", "This code is not linked to a venue on Nataa.");
      setScanned(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleLocationCheckIn = async () => {
    if (processing || isLocating) return;
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location needed", "Enable location to find the closest venue.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = position.coords;
      const nearest = venues
        .map((venue) => ({
          venue,
          distanceKm: haversineKm(latitude, longitude, venue.latitude, venue.longitude),
        }))
        .filter((v) => typeof v.distanceKm === "number")
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))[0];

      if (!nearest || nearest.distanceKm === null || nearest.distanceKm === undefined) {
        Alert.alert("No venues nearby", "We couldn't find a venue close enough. Try scanning the QR instead.");
        return;
      }

      if (nearest.distanceKm > 0.5) {
        Alert.alert(
          "Too far away",
          `The closest venue is ${nearest.distanceKm.toFixed(1)} km away. Move closer or scan the venue QR.`,
        );
        return;
      }

      await checkInToVenue(nearest.venue.id, { latitude, longitude });
      track("check_in", { via: "geo", venueId: nearest.venue.id, distanceKm: nearest.distanceKm });
      navigation.navigate("VenueDetails", { venueId: nearest.venue.id });
    } catch (error) {
      console.warn("Location check-in failed", error);
      Alert.alert("Could not check in", "Turn on location services and try again.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (data) processScan(data);
  };

  if (!permission) {
    return (
      <View style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.loadingText}>Requesting camera access…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]} edges={["top", "bottom"]}>
        <Ionicons name="camera-outline" size={48} color="#4dabf7" />
        <Text style={styles.permissionTitle}>{permissionCopy.title}</Text>
        <Text style={styles.permissionDescription}>{permissionCopy.description}</Text>
        <Button title="Grant permission" onPress={requestPermission} style={styles.permissionButton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check in</Text>
        <TouchableOpacity style={styles.helpButton} onPress={() => navigation.navigate("HelpCenter")}>
          <Ionicons name="help-circle" size={22} color="#9fb3ff" />
        </TouchableOpacity>
      </View>

      <LinearGradient colors={["#141937", "#080b18"]} style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.heroKicker}>Step 1</Text>
          <Text style={styles.heroTitle}>Scan the QR code at the entrance.</Text>
          <Text style={styles.heroSubtitle}>
            Unlock the live guest list, active rooms, and conversation credits for this venue.
          </Text>
        </View>
        <View style={styles.heroIcons}>
          <View style={styles.heroIcon}>
            <Ionicons name="qr-code-outline" size={26} color="#fff" />
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles-outline" size={26} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          enableTorch={flashOn}
        >
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanFrameWrapper}>
                <Animated.View style={[styles.scanFrame, { borderColor: frameBorderColor }]}>
                  <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]} />
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </Animated.View>
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom}>
              <Text style={styles.overlayTitle}>Align the QR code inside the frame</Text>
              <Text style={styles.overlaySubtitle}>It usually sits near the entrance or host stand.</Text>
            </View>
          </View>
        </CameraView>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.controlButton, flashOn && styles.controlButtonActive]}
            onPress={() => setFlashOn((prev) => !prev)}
          >
            <Ionicons name={flashOn ? "flash" : "flash-off"} size={20} color="#fff" />
            <Text style={styles.controlText}>{flashOn ? "Flash on" : "Flash off"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              setScanned(false)
              setProcessing(false)
            }}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.controlText}>Reset scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={() => navigation.navigate("HelpCenter")}>
            <Ionicons name="information-circle" size={20} color="#fff" />
            <Text style={styles.controlText}>Where to find it?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, scanned ? styles.statusDotScanning : styles.statusDotIdle]} />
          <Text style={styles.statusText}>
            {processing ? "Validating QR code..." : scanned ? "Processing..." : "Ready to scan"}
          </Text>
        </View>
        <View style={styles.bottomActions}>
          <Button
            title={processing ? "Checking in..." : "Refresh QR"}
            onPress={() => {
              setScanned(false)
              setProcessing(false)
            }}
            disabled={processing}
            variant="outline"
            style={{ flex: 1 }}
          />
          <Button
            title={isLocating ? "Locating..." : "Use my location"}
            onPress={handleLocationCheckIn}
            disabled={processing || isLocating}
            loading={isLocating}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#03050f",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#03050f",
  },
  loadingText: {
    marginTop: 12,
    color: "#94a2d6",
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  permissionDescription: {
    color: "#94a2d6",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 30,
  },
  permissionButton: {
    marginTop: 18,
    width: "70%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },
  heroText: {
    flex: 1,
    gap: 6,
  },
  heroKicker: {
    color: "#8f96bb",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontSize: 12,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "#b7beda",
    fontSize: 13,
  },
  heroIcons: {
    flexDirection: "row",
    gap: 10,
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(3,5,16,0.65)",
  },
  overlayMiddle: {
    flexDirection: "row",
    height: width * 0.75,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(3,5,16,0.65)",
  },
  scanFrameWrapper: {
    width: width * 0.75,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    position: "absolute",
    width: "80%",
    height: 2,
    backgroundColor: "#4dabf7",
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#4dabf7",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  overlayBottom: {
    padding: 20,
    backgroundColor: "rgba(3,5,16,0.65)",
    alignItems: "center",
  },
  overlayTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  overlaySubtitle: {
    color: "#9da4ca",
    textAlign: "center",
    marginTop: 6,
  },
  bottomCard: {
    backgroundColor: "#0b0f1f",
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 24,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  controlButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#151b33",
    paddingVertical: 10,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  controlButtonActive: {
    borderColor: "#4dabf7",
    backgroundColor: "rgba(77,171,247,0.15)",
  },
  controlText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomActions: {
    flexDirection: "row",
    gap: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4dabf7",
  },
  statusDotIdle: {
    opacity: 0.5,
  },
  statusDotScanning: {
    opacity: 1,
  },
  statusText: {
    color: "#a0a7c7",
    fontSize: 13,
  },
});

export default ScanScreen;

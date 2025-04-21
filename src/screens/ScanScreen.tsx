"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ActivityIndicator,
  Dimensions,
  Vibration,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import Header from "../components/Header"
import Button from "../components/Button"
import { useVenues } from "../context/VenueContext"

const { width, height } = Dimensions.get("window")

// Mock component for preview mode - will be replaced by real Camera in production
const MockCameraView = ({ children, style, flashMode }) => {
  return (
    <View style={[style, { backgroundColor: "#1e1e1e" }]}>
      {flashMode === "on" && <View style={styles.flashOverlay} />}
      {children}
    </View>
  )
}

const ScanScreen = () => {
  const navigation = useNavigation()
  const { venues, checkInToVenue } = useVenues()
  const [hasPermission, setHasPermission] = useState(null)
  const [scanning, setScanning] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [recentCheckIns, setRecentCheckIns] = useState([
    { id: "1", name: "Pulse Nightclub", time: "Yesterday, 11:30 PM", venueId: "1" },
    { id: "2", name: "Sky Lounge", time: "Last week, 10:15 PM", venueId: "2" },
    { id: "3", name: "Club Onyx", time: "2 weeks ago, 1:05 AM", venueId: "3" },
  ])

  // Animation refs
  const frameAnim = useRef(new Animated.Value(0)).current
  const scanLineAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(0)).current

  // Request camera permissions on mount
  useEffect(() => {
    const getCameraPermissions = async () => {
      try {
        // For demo purposes, simulate permission request
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setHasPermission(true)
      } catch (error) {
        console.error("Error requesting camera permission:", error)
        setHasPermission(false)
      }
    }

    getCameraPermissions()
  }, [])

  // Start animations when scanning
  useEffect(() => {
    if (scanning && !scanned) {
      // Frame animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(frameAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(frameAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
      ).start()

      // Scan line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start()

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      // Stop animations
      frameAnim.stopAnimation()
      scanLineAnim.stopAnimation()
      pulseAnim.stopAnimation()
    }

    return () => {
      frameAnim.stopAnimation()
      scanLineAnim.stopAnimation()
      pulseAnim.stopAnimation()
    }
  }, [scanning, scanned])

  // Animation interpolations
  const borderColor = frameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(77, 171, 247, 0.4)", "rgba(77, 171, 247, 1)"],
  })

  const borderWidth = frameAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, 3.5],
  })

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(width * 0.3), width * 0.3],
  })

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.7, 0.4],
  })

  // Handle barcode scanning
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned || processing) return

    setScanned(true)
    setProcessing(true)

    // Provide haptic feedback
    Vibration.vibrate(200)

    // Process QR code data
    try {
      // In a real app, parse the QR code data to get venue information
      // For demo purposes, we'll just navigate to a venue
      setTimeout(() => {
        setProcessing(false)

        // Add to recent check-ins
        const newCheckIn = {
          id: Date.now().toString(),
          name: "Scanned Venue",
          time: "Just now",
          venueId: "1",
        }

        setRecentCheckIns([newCheckIn, ...recentCheckIns.slice(0, 2)])

        // Navigate to venue details
        navigation.navigate("VenueDetails", { venueId: "1" })
      }, 1500)
    } catch (error) {
      setProcessing(false)
      setScanned(false)
      Alert.alert("Invalid QR Code", "The scanned code is not a valid venue QR code.")
    }
  }

  // Manual scan for demo purposes
  const handleManualScan = () => {
    if (processing) return

    if (scanned) {
      // Reset scanner
      setScanned(false)
      setScanning(true)
      return
    }

    // Simulate scanning
    handleBarCodeScanned({ type: "qr", data: "venue:1" })
  }

  // Toggle flash
  const toggleFlash = () => {
    setFlashOn(!flashOn)
  }

  // Handle gallery selection
  const handleGallerySelect = () => {
    Alert.alert("Select from Gallery", "This feature would allow you to select a QR code image from your gallery.", [
      { text: "OK" },
    ])
  }

  // Loading state
  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    )
  }

  // Permission denied state
  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-off-outline" size={60} color="#4dabf7" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please grant camera permission to scan QR codes and check in to venues.
        </Text>
        <Button title="Grant Permission" onPress={() => setHasPermission(true)} style={styles.permissionButton} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header title="Scan QR Code" showBackButton />

      <View style={styles.cameraContainer}>
        {/* In a real app, replace MockCameraView with Camera component */}
        <MockCameraView style={styles.camera} flashMode={flashOn ? "on" : "off"}>
          <View style={styles.scannerOverlay}>
            <View style={styles.dimOverlay} />

            {/* Scanning frame */}
            <Animated.View
              style={[
                styles.scanSquare,
                {
                  borderColor,
                  borderWidth,
                },
              ]}
            >
              {/* Corner markers */}
              <View style={[styles.cornerMarker, styles.topLeftMarker]} />
              <View style={[styles.cornerMarker, styles.topRightMarker]} />
              <View style={[styles.cornerMarker, styles.bottomLeftMarker]} />
              <View style={[styles.cornerMarker, styles.bottomRightMarker]} />

              {/* Scanning line */}
              {scanning && !scanned && (
                <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTranslateY }] }]} />
              )}

              {/* Processing indicator */}
              {processing && (
                <View style={styles.processingContainer}>
                  <Animated.View style={[styles.processingPulse, { opacity: pulseOpacity }]} />
                  <ActivityIndicator size="large" color="#4dabf7" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              )}
            </Animated.View>

            {/* Instructions */}
            <View style={styles.instructions}>
              <Text style={styles.scanTitle}>
                {scanned ? "QR Code Detected" : processing ? "Processing QR Code" : "Hold your phone up to the QR code"}
              </Text>
              <Text style={styles.scanSubtitle}>
                {scanned
                  ? "Tap 'Try Again' to scan another code"
                  : processing
                    ? "Please wait while we verify the venue"
                    : "The code will be scanned automatically"}
              </Text>
            </View>
          </View>
        </MockCameraView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlIcon, flashOn && styles.activeControl]} onPress={toggleFlash}>
          <Ionicons name={flashOn ? "flash" : "flash-outline"} size={24} color="#fff" />
        </TouchableOpacity>

        <Button
          title={processing ? "Processing..." : scanned ? "Try Again" : "Scan QR Code"}
          icon={scanned ? "refresh" : "scan-outline"}
          loading={processing}
          onPress={handleManualScan}
          style={styles.scanButton}
        />

        <TouchableOpacity style={styles.controlIcon} onPress={handleGallerySelect}>
          <Ionicons name="images-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Recent check-ins */}
      <View style={styles.recentScans}>
        <Text style={styles.recentTitle}>Recent Check-ins</Text>

        {recentCheckIns.length > 0 ? (
          recentCheckIns.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              onPress={() => navigation.navigate("VenueDetails", { venueId: item.venueId })}
            >
              <Ionicons name="time-outline" size={20} color="#4dabf7" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.recentName}>{item.name}</Text>
                <Text style={styles.recentTime}>{item.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#aaa" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent check-ins</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#0a0e17",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  permissionText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  permissionButton: {
    marginTop: 20,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 200, 0.15)",
  },
  scannerOverlay: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dimOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(10,10,10,0.5)",
  },
  scanSquare: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cornerMarker: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#4dabf7",
  },
  topLeftMarker: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRightMarker: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeftMarker: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRightMarker: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    width: "85%",
    height: 2,
    backgroundColor: "#4dabf7",
    position: "absolute",
  },
  processingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(10, 14, 23, 0.7)",
    borderRadius: 12,
  },
  processingPulse: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#4dabf7",
  },
  processingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },
  instructions: {
    position: "absolute",
    top: 50,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scanTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  scanSubtitle: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1a1f2c",
    justifyContent: "center",
    alignItems: "center",
  },
  activeControl: {
    backgroundColor: "#4dabf7",
  },
  scanButton: {
    flex: 1,
    marginHorizontal: 15,
  },
  recentScans: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  recentTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151a25",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  recentName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  recentTime: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: "#151a25",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    color: "#aaa",
    fontSize: 14,
  },
})

export default ScanScreen

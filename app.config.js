import { ConfigContext, ExpoConfig } from "expo/config";

const projectId = "5d88a233-c4eb-4f7c-9319-34c784ee4c24";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Nataa",
  slug: "nataapp",
  version: "1.0.1",
  scheme: "nataapp",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#0a0e17",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: "Allow Nataa to show live venues around you.",
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_MAPS_API_KEY ?? process.env.IOS_MAPS_API_KEY,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#0a0e17",
    },
    package: "com.nataapp.lori",
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "CAMERA",
      "READ_MEDIA_IMAGES",
      "READ_MEDIA_VIDEO",
      "READ_EXTERNAL_STORAGE",
    ],
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_ANDROID_MAPS_API_KEY ?? process.env.ANDROID_MAPS_API_KEY,
      },
    },
  },
  plugins: [
    [
      "@maplibre/maplibre-react-native",
      {
        locationLayer: true,
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "35.0.0",
          kotlinVersion: "2.0.21",
        },
      },
    ],
  ],
  extra: {
    ...config.extra,
    eas: {
      projectId,
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  owner: "lorentkryeziu",
});

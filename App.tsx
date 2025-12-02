import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import DiscoverScreen from "./src/screens/DiscoverScreen";
import ScanScreen from "./src/screens/ScanScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import VenueDetails from "./src/screens/VenueDetails";
import VenueRoomScreen from "./src/screens/VenueRoomScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import AuthCallbackScreen from "./src/screens/AuthCallbackScreen";
import ChatScreen from "./src/screens/ChatScreen";
import VerifyEmailScreen from "./src/screens/VerifyEmailScreen";

// New Screens
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import CreditsScreen from "./src/screens/CreditsScreen";
import HelpCenterScreen from "./src/screens/HelpCenterScreen";
import AboutScreen from "./src/screens/AboutScreen";
import MapScreen from "./src/screens/MapScreen";
import ContactsScreen from "./src/screens/ContactsScreen";
import RequestsScreen from "./src/screens/RequestsScreen";
import NewMessageScreen from "./src/screens/NewMessageScreen";
import HowToCheckInScreen from "./src/screens/HowToCheckInScreen";

// Context Providers
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { VenueProvider } from "./src/context/VenueContext";
import { CreditsProvider } from "./src/context/CreditsContext";
import { ReferralProvider } from "./src/context/ReferralContext";
import { StoriesProvider } from "./src/context/StoriesContext";
import { EventsProvider } from "./src/context/EventsContext";

// Components
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import type { MainTabParamList, RootStackParamList } from "./src/types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const getTabIcon = (routeName: string, focused: boolean) => {
  let iconName: keyof typeof Ionicons.glyphMap;

  switch (routeName) {
    case "Home":
      iconName = focused ? "home" : "home-outline";
      break;
    case "Discover":
      iconName = focused ? "compass" : "compass-outline";
      break;
    case "Scan":
      iconName = focused ? "scan" : "scan-outline";
      break;
    case "Messages":
      iconName = focused ? "chatbubbles" : "chatbubbles-outline";
      break;
    case "Profile":
      iconName = focused ? "person" : "person-outline";
      break;
    default:
      iconName = "ellipse-outline";
  }

  return iconName;
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#4dabf7",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#0a0e17",
          borderTopColor: "#1a1f2c",
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 6,
          height: 60 + insets.bottom,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0a0e17" }}>
        <ActivityIndicator size="large" color="#4dabf7" />
      </View>
    );
  }

  const linking = {
    prefixes: [Linking.createURL("/")],
    config: {
      screens: {
        AuthCallback: "auth-callback",
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="VenueDetails" component={VenueDetails} />
            <Stack.Screen name="VenueRoom" component={VenueRoomScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="Credits" component={CreditsScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Contacts" component={ContactsScreen} />
            <Stack.Screen name="Requests" component={RequestsScreen} />
            <Stack.Screen name="NewMessage" component={NewMessageScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="HowToCheckIn" component={HowToCheckInScreen} />
            <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e17" />
      <ErrorBoundary>
        <AuthProvider>
          <VenueProvider>
            <CreditsProvider>
              <ReferralProvider>
                <StoriesProvider>
                  <EventsProvider>
                    <AppNavigator />
                  </EventsProvider>
                </StoriesProvider>
              </ReferralProvider>
            </CreditsProvider>
          </VenueProvider>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;

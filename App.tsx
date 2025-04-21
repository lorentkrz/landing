import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import DiscoverScreen from "./src/screens/DiscoverScreen";
import ScanScreen from "./src/screens/ScanScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import VenueDetails from "./src/screens/VenueDetails";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import LoginScreen from "./src/screens/LoginScreen";

// New Screens
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import CreditsScreen from "./src/screens/CreditsScreen";
import HelpCenterScreen from "./src/screens/HelpCenterScreen";
import AboutScreen from "./src/screens/AboutScreen";

// Context Providers
import { AuthProvider } from "./src/context/AuthContext";
import { VenueProvider } from "./src/context/VenueContext";
import { CreditsProvider } from "./src/context/CreditsContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

const TabNavigator = () => (
  <Tab.Navigator
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
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
      headerShown: false,
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 5,
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

const App = () => {
  return (
    <AuthProvider>
      <VenueProvider>
        <CreditsProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen name="VenueDetails" component={VenueDetails} />

              {/* Add the new screens */}
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
              <Stack.Screen name="Credits" component={CreditsScreen} />
              <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </CreditsProvider>
      </VenueProvider>
    </AuthProvider>
  );
};

export default App;
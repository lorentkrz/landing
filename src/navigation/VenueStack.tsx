import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VenueDetailsScreen from '../screens/VenueDetailsScreen'; // Correct path
import VenueRoomScreen from '../screens/VenueRoomScreen'; // Correct path

const Stack = createStackNavigator();

const VenueStack = () => (
  <Stack.Navigator initialRouteName="VenueDetails">
    <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
    <Stack.Screen name="VenueRoom" component={VenueRoomScreen} />
  </Stack.Navigator>
);

export default VenueStack;

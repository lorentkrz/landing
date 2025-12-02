import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VenueDetailsScreen from '../screens/VenueDetails';
import VenueRoomScreen from '../screens/VenueRoomScreen';

const Stack = createStackNavigator();

const VenueStack = () => (
  <Stack.Navigator id={undefined} initialRouteName="VenueDetails">
    <Stack.Screen name="VenueDetails" component={VenueDetailsScreen} />
    <Stack.Screen name="VenueRoom" component={VenueRoomScreen} />
  </Stack.Navigator>
);

export default VenueStack;

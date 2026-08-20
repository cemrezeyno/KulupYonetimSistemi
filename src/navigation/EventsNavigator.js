import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EventsScreen from '../screens/events/EventsScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';

const Stack = createNativeStackNavigator();

const EventsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="EventsList"
        component={EventsScreen}
      />

      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
      />

    
    </Stack.Navigator>
  );
};

export default EventsNavigator;
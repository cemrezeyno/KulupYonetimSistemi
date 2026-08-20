import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import JoinedEventsScreen from "../screens/profile/JoinedEventsScreen";

const Stack =
  createNativeStackNavigator();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />

      <Stack.Screen
        name="JoinedEvents"
        component={JoinedEventsScreen}
      />
    </Stack.Navigator>
  );
}
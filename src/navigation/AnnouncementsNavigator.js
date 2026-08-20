import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import AnnouncementsScreen from "../screens/announcements/AnnouncementsScreen";
import AnnouncementDetailScreen from "../screens/announcements/AnnouncementDetailScreen";

const Stack =
  createNativeStackNavigator();

export default function AnnouncementsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="AnnouncementsList"
        component={AnnouncementsScreen}
      />

      <Stack.Screen
        name="AnnouncementDetail"
        component={AnnouncementDetailScreen}
      />
    </Stack.Navigator>
  );
}
import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import NotificationDetailScreen from "../screens/notifications/NotificationDetailScreen";
import AnnouncementsNavigator from "./AnnouncementsNavigator";

const Stack =
  createNativeStackNavigator();

export default function NotificationsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="NotificationsList"
        component={NotificationsScreen}
      />

      <Stack.Screen
        name="NotificationDetail"
        component={NotificationDetailScreen}
      />

      <Stack.Screen
        name="Announcements"
        component={AnnouncementsNavigator}
      />
    </Stack.Navigator>
  );
}
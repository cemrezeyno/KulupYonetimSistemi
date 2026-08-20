import React from "react";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/home/HomeScreen";
import EventsNavigator from "./EventsNavigator";
import ClubsNavigator from "./ClubsNavigator";
import NotificationsNavigator from "./NotificationsNavigator";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ProfileNavigator from "./ProfileNavigator";
const Tab =
  createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          "#2563EB",

        tabBarInactiveTintColor:
          "#94A3B8",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarIcon: ({
          color,
          size,
        }) => {
          let iconName = "ellipse";

          switch (route.name) {
            case "Home":
              iconName = "home";
              break;

            case "Events":
              iconName = "calendar";
              break;

            case "Clubs":
              iconName = "people";
              break;

            case "Notifications":
              iconName =
                "notifications";
              break;

            case "Profile":
              iconName = "person";
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Events"
        component={EventsNavigator}
      />

      <Tab.Screen
        name="Clubs"
        component={ClubsNavigator}
      />

      <Tab.Screen
        name="Notifications"
        component={
          NotificationsNavigator
        }
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
      />
    </Tab.Navigator>
  );
}
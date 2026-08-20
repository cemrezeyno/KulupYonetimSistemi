import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import ClubPresidentDashboardScreen from "../screens/clubPresident/ClubPresidentDashboardScreen";

import ClubPresidentClubDetailScreen from "../screens/clubPresident/ClubPresidentClubDetailScreen";

import ClubPresidentParticipantsScreen from "../screens/clubPresident/ClubPresidentParticipantsScreen";

import ClubPresidentMembershipsScreen from "../screens/clubPresident/ClubPresidentMembershipsScreen";

import AdminEventsScreen from "../screens/admin/AdminEventsScreen";

import AdminEventDetailScreen from "../screens/admin/AdminEventDetailScreen";

import AdminCreateEventScreen from "../screens/admin/AdminCreateEventScreen";

import AdminAnnouncementsScreen from "../screens/admin/AdminAnnouncementsScreen";

import AdminCreateAnnouncementScreen from "../screens/admin/AdminCreateAnnouncementScreen";

import AdminEditAnnouncementScreen from "../screens/admin/AdminEditAnnouncementScreen";

import AdminNotificationsScreen from "../screens/admin/AdminNotificationsScreen";

import AdminCreateNotificationScreen from "../screens/admin/AdminCreateNotificationScreen";

import AdminEditNotificationScreen from "../screens/admin/AdminEditNotificationScreen";

import ClubsScreen from "../screens/clubs/ClubsScreen";

import ClubDetailScreen from "../screens/clubs/ClubDetailScreen";


const Stack =
  createNativeStackNavigator();


export default function ClubPresidentNavigator() {

  return (

    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >

      {/* ================================================= */}
      {/* KULÜP BAŞKANI ANA SAYFA */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubPresidentDashboard"
        component={
          ClubPresidentDashboardScreen
        }
      />


      {/* ================================================= */}
      {/* KULÜP BİLGİLERİ */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubPresidentClubDetail"
        component={
          ClubPresidentClubDetailScreen
        }
      />


      {/* ================================================= */}
      {/* ETKİNLİKLER */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubPresidentEvents"
        component={
          AdminEventsScreen
        }
      />

      <Stack.Screen
        name="ClubPresidentEventDetail"
        component={
          AdminEventDetailScreen
        }
      />

      <Stack.Screen
        name="ClubPresidentCreateEvent"
        component={
          AdminCreateEventScreen
        }
      />


      {/* ================================================= */}
      {/* KATILIMCILAR */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubPresidentParticipants"
        component={
          ClubPresidentParticipantsScreen
        }
      />


      {/* ================================================= */}
      {/* ÜYE OLDUĞUM KULÜPLER */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubPresidentMemberships"
        component={
          ClubPresidentMembershipsScreen
        }
      />


      {/* ================================================= */}
      {/* DUYURU YÖNETİMİ */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubPresidentAnnouncements"
        component={
          AdminAnnouncementsScreen
        }
      />

      <Stack.Screen
        name="AdminCreateAnnouncement"
        component={
          AdminCreateAnnouncementScreen
        }
      />

      <Stack.Screen
        name="AdminEditAnnouncement"
        component={
          AdminEditAnnouncementScreen
        }
      />


      {/* ================================================= */}
      {/* BİLDİRİM YÖNETİMİ */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubPresidentNotifications"
        component={
          AdminNotificationsScreen
        }
      />

      <Stack.Screen
        name="AdminCreateNotification"
        component={
          AdminCreateNotificationScreen
        }
      />

      <Stack.Screen
        name="AdminEditNotification"
        component={
          AdminEditNotificationScreen
        }
      />


      {/* ================================================= */}
      {/* GENEL KULÜPLER */}
      {/* ================================================= */}

      <Stack.Screen
        name="ClubsList"
        component={
          ClubsScreen
        }
      />

      <Stack.Screen
        name="ClubDetail"
        component={
          ClubDetailScreen
        }
      />

    </Stack.Navigator>
  );
}
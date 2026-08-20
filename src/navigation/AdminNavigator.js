import React from "react";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";

import AdminClubsScreen from "../screens/admin/AdminClubsScreen";

import AdminClubDetailScreen from "../screens/admin/AdminClubDetailScreen";

import AdminCreateClubScreen from "../screens/admin/AdminCreateClubScreen";

import AdminUsersScreen from "../screens/admin/AdminUsersScreen";

import AdminUserDetailScreen from "../screens/admin/AdminUserDetailScreen";

import AdminEventsScreen from "../screens/admin/AdminEventsScreen";

import AdminEventDetailScreen from "../screens/admin/AdminEventDetailScreen";

import AdminCreateEventScreen from "../screens/admin/AdminCreateEventScreen";

import AdminAnnouncementsScreen from "../screens/admin/AdminAnnouncementsScreen";

import AdminCreateAnnouncementScreen from "../screens/admin/AdminCreateAnnouncementScreen";

import AdminEditAnnouncementScreen from "../screens/admin/AdminEditAnnouncementScreen";

import AdminNotificationsScreen from "../screens/admin/AdminNotificationsScreen";

import AdminCreateNotificationScreen from "../screens/admin/AdminCreateNotificationScreen";

import AdminEditNotificationScreen from "../screens/admin/AdminEditNotificationScreen";

import AdminStatisticsScreen from "../screens/admin/AdminStatisticsScreen";


const Stack =
  createNativeStackNavigator();


export default function AdminNavigator() {

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >

      {/* =====================================================
          ADMIN ANA SAYFA
      ===================================================== */}

      <Stack.Screen
        name="AdminDashboard"
        component={
          AdminDashboardScreen
        }
      />


      {/* =====================================================
          KULÜPLER
      ===================================================== */}

      <Stack.Screen
        name="AdminClubs"
        component={
          AdminClubsScreen
        }
      />

      <Stack.Screen
        name="AdminClubDetail"
        component={
          AdminClubDetailScreen
        }
      />

      <Stack.Screen
        name="AdminCreateClub"
        component={
          AdminCreateClubScreen
        }
      />


      {/* =====================================================
          KULLANICILAR
      ===================================================== */}

      <Stack.Screen
        name="AdminUsers"
        component={
          AdminUsersScreen
        }
      />

      <Stack.Screen
        name="AdminUserDetail"
        component={
          AdminUserDetailScreen
        }
      />


      {/* =====================================================
          ETKİNLİKLER
      ===================================================== */}

      <Stack.Screen
        name="AdminEvents"
        component={
          AdminEventsScreen
        }
      />

      <Stack.Screen
        name="AdminEventDetail"
        component={
          AdminEventDetailScreen
        }
      />

      <Stack.Screen
        name="AdminCreateEvent"
        component={
          AdminCreateEventScreen
        }
      />


      {/* =====================================================
          DUYURULAR
      ===================================================== */}

      <Stack.Screen
        name="AdminAnnouncements"
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


      {/* =====================================================
          BİLDİRİMLER
      ===================================================== */}

      <Stack.Screen
        name="AdminNotifications"
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


      {/* =====================================================
          İSTATİSTİKLER
      ===================================================== */}

      <Stack.Screen
        name="AdminStatistics"
        component={
          AdminStatisticsScreen
        }
      />

    </Stack.Navigator>
  );
}
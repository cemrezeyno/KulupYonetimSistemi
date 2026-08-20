import React from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

export default function NotificationDetailScreen({
  route,
  navigation,
}) {
  const { notification } =
    route.params || {};

  if (!notification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Bildirim bulunamadı
          </Text>

          <Text style={styles.errorText}>
            Bildirim bilgileri alınamadı.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getIcon = () => {
    switch (notification.notification_type) {
      case "event":
        return "calendar-outline";

      case "announcement":
        return "megaphone-outline";

      case "success":
        return "checkmark-circle-outline";

      case "warning":
        return "warning-outline";

      default:
        return "notifications-outline";
    }
  };

  const getIconColor = () => {
    switch (notification.notification_type) {
      case "event":
        return "#2563EB";

      case "announcement":
        return "#F59E0B";

      case "success":
        return "#16A34A";

      case "warning":
        return "#DC2626";

      default:
        return "#7C3AED";
    }
  };

  const formattedDate =
    notification.created_at
      ? new Date(
          notification.created_at
        ).toLocaleDateString(
          "tr-TR",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "Tarih belirtilmemiş";

  const formattedTime =
    notification.created_at
      ? new Date(
          notification.created_at
        ).toLocaleTimeString(
          "tr-TR",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.goBack()
            }
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Bildirim Detayı
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Bildirim */}
        <View style={styles.hero}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: `${getIconColor()}15`,
              },
            ]}
          >
            <Ionicons
              name={getIcon()}
              size={32}
              color={getIconColor()}
            />
          </View>

          <Text style={styles.title}>
            {notification.title}
          </Text>

          <View style={styles.dateContainer}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color="#64748B"
            />

            <Text style={styles.date}>
              {formattedDate}
            </Text>

            <Ionicons
              name="time-outline"
              size={16}
              color="#64748B"
              style={styles.timeIcon}
            />

            <Text style={styles.date}>
              {formattedTime}
            </Text>
          </View>
        </View>

        {/* Mesaj */}
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            Bildirim
          </Text>

          <Text style={styles.message}>
            {notification.message}
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },

  headerSpacer: {
    width: 42,
  },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 28,
    backgroundColor: "#F8FAFC",
  },

  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },

  date: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },

  timeIcon: {
    marginLeft: 15,
  },

  messageCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  messageTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  message: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 25,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  errorTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },

  errorText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },

  bottomSpacing: {
    height: 30,
  },
});
import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function NotificationCard({
  title,
  message,
  notificationType,
  isRead,
  createdAt,
  onPress,
}) {
  const getIcon = () => {
    switch (notificationType) {
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
    switch (notificationType) {
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

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(
        "tr-TR",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        !isRead && styles.unreadCard,
      ]}
    >
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
          size={23}
          color={getIconColor()}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          </Text>

          {!isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>

        <Text
          numberOfLines={2}
          style={styles.message}
        >
          {message}
        </Text>

        <Text style={styles.date}>
          {formattedDate}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#CBD5E1"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  content: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  title: {
    flex: 1,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
    marginLeft: 8,
  },

  message: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
  },

  date: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
  },
});
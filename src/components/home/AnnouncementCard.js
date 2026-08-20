import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function AnnouncementCard({
  title,
  content,
  date,
  createdAt,
  onPress,
}) {
  const displayDate = date || createdAt;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.icon}>
        <Ionicons
          name="megaphone"
          size={24}
          color="#FFFFFF"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text
          numberOfLines={2}
          style={styles.text}
        >
          {content}
        </Text>

        {displayDate && (
          <Text style={styles.date}>
            {displayDate}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 18,
    flexDirection: "row",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  icon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  text: {
    color: "#64748B",
    lineHeight: 20,
    fontSize: 14,
  },

  date: {
    marginTop: 10,
    fontWeight: "600",
    color: "#2563EB",
    fontSize: 12,
  },
});
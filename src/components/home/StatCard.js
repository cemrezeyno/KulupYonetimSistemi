import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function StatCard({
  title,
  number,
  icon,
  color,
  backgroundColor = "#FFFFFF",
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: color + "20",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={color}
        />
      </View>

      <Text style={styles.value}>
        {number}
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>

      <View
        style={[
          styles.bottomLine,
          {
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    margin: 6,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 6,
    overflow: "hidden",
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  value: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
  },

  title: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 15,
  },

  bottomLine: {
    height: 4,
    width: "100%",
    borderRadius: 20,
    marginTop: 16,
  },
});
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={loading || disabled}
      onPress={onPress}
      style={[
        styles.container,
        disabled && { opacity: 0.7 },
      ]}
    >
      <LinearGradient
        colors={
          disabled
            ? ["#CBD5E1", "#CBD5E1"]
            : [
                "#2563EB",
                "#4F46E5",
                "#7C3AED",
                "#9333EA",
              ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator
            color="#FFFFFF"
            size="small"
          />
        ) : (
          <>
            <Text style={styles.text}>
              {title}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 5,
  },

  button: {
    height: 62,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  text: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
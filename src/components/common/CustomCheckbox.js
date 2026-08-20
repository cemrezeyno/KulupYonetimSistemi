import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../theme/colors";

export default function CustomCheckbox({
  checked,
  onPress,
  label,
}) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.box,
          checked && styles.checked,
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={16}
            color="#fff"
          />
        )}
      </View>

      <Text style={styles.label}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },

  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  checked: {
    backgroundColor: Colors.primary,
  },

  label: {
    marginLeft: 10,
    color: "#475569",
    flex: 1,
    fontSize: 14,
  },
});
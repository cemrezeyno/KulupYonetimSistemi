import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import Colors from "../../theme/colors";
import Fonts from "../../theme/fonts";
export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  icon,
  maxLength,
}) {
  const [hidden, setHidden] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.container,
        focused && styles.containerFocused,
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={focused ? Colors.primary : "#94A3B8"}
        style={styles.icon}
      />

      <View style={{ flex: 1 }}>
  <Text style={styles.label}>
    {placeholder}
  </Text>

  <TextInput
    style={styles.input}
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
    autoCapitalize="none"
    maxLength={maxLength}
    secureTextEntry={hidden}
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    placeholder={placeholder}
placeholderTextColor="#94A3B8"
  />
</View>

      {secureTextEntry && (
        <TouchableOpacity onPress={() => setHidden(!hidden)}>
          <Ionicons
            name={
              hidden
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color={
              focused
                ? Colors.primary
                : "#94A3B8"
            }
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,

    borderRadius: 18,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,

    borderColor: "#E5E7EB",

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 18,

    marginBottom: 18,
  },

  containerFocused: {
    borderColor: Colors.primary,

    backgroundColor: "#FFFFFF",

    shadowColor: Colors.primary,

    shadowOpacity: 0.18,

    shadowRadius: 15,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 6,
  },

  icon: {
    marginRight: 12,
  },

  input: {
  flex: 1,
  fontSize: Fonts.body,
  color: Colors.text,

  borderWidth: 0,
  outlineStyle: "none", // Web için
  backgroundColor: "transparent",

  paddingVertical: 0,
},
  label: {
  fontSize: 12,
  color: "#64748B",
  marginBottom: 4,
  fontWeight: "600",
},
});
import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function HomeHeader({
  user,
  onProfilePress,
}) {
  return (
    <View style={styles.container}>

      {/* SOL TARAF */}
      <View style={styles.textContainer}>

        <Text style={styles.greeting}>
          Günaydın 👋
        </Text>

        <Text
          style={styles.name}
          numberOfLines={1}
        >
          {user?.first_name || ""}
          {user?.last_name
            ? ` ${user.last_name}`
            : ""}
        </Text>

        {user?.department ? (
          <Text
            style={styles.info}
            numberOfLines={1}
          >
            {user.department}
          </Text>
        ) : null}

      </View>

      {/* PROFİL BUTONU */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onProfilePress}
        style={styles.avatarContainer}
      >

        {user?.profile_image ? (
          <Image
            source={{
              uri: user.profile_image,
            }}
            style={styles.avatar}
          />
        ) : (
          <Ionicons
            name="person"
            size={30}
            color="#2563EB"
          />
        )}

      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,

    backgroundColor: "#F8FAFC",
  },

  textContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 16,
  },

  greeting: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },

  name: {
    color: "#0F172A",
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 31,
  },

  info: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },

  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EFF6FF",

    borderWidth: 1,
    borderColor: "#DBEAFE",

    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
});
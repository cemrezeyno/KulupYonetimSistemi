import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const actions = [
  {
    title: "Etkinlikler",
    icon: "calendar",
    color: "#2563EB",
    screen: "Events",
  },
  {
    title: "Kulüpler",
    icon: "people",
    color: "#7C3AED",
    screen: "Clubs",
  },
  {
    title: "Duyurular",
    icon: "megaphone",
    color: "#F59E0B",
    screen: "Announcements",
  },
  {
    title: "Profil",
    icon: "person",
    color: "#22C55E",
    screen: "Profile",
  },
];

export default function QuickActionGrid() {

  const navigation = useNavigation();

  return (

    <View style={styles.container}>

      {actions.map((item) => (

        <TouchableOpacity
          key={item.title}
          style={styles.card}
          onPress={() => navigation.navigate(item.screen)}
        >

          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: item.color,
              },
            ]}
          >

            <Ionicons
              name={item.icon}
              size={28}
              color="#FFFFFF"
            />

          </View>

          <Text style={styles.title}>
            {item.title}
          </Text>

        </TouchableOpacity>

      ))}

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 22,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 5,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

});
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

export default function AnnouncementDetailScreen({
  route,
  navigation,
}) {
  const { announcement } =
    route.params || {};

  if (!announcement) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            Duyuru bulunamadı
          </Text>

          <Text style={styles.errorText}>
            Duyuru bilgileri alınamadı.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate =
    announcement.created_at
      ? new Date(
          announcement.created_at
        ).toLocaleDateString(
          "tr-TR",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "Tarih belirtilmemiş";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
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
            Duyuru Detayı
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="megaphone"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.title}>
            {announcement.title}
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
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>
            Duyuru
          </Text>

          <Text style={styles.contentText}>
            {announcement.content}
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
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F59E0B",
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
    marginTop: 15,
  },

  date: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },

  contentCard: {
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

  contentTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  contentText: {
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
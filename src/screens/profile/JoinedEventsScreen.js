import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import EventCard from "../../components/home/EventCard";

import {
  getJoinedEvents,
} from "../../services/profileService";

import Colors from "../../theme/colors";

export default function JoinedEventsScreen({
  navigation,
}) {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadEvents = async () => {
    try {
      const data =
        await getJoinedEvents();

      setEvents(data);
    } catch (error) {
      console.error(
        "JoinedEventsScreen error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleEventPress = (event) => {
    if (!event?.id) {
      return;
    }

    navigation.navigate(
      "EventDetail",
      {
        event,
      }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color={Colors.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
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
            Katıldığım Etkinlikler
          </Text>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* Açıklama */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Etkinliklerim
            </Text>

            <Text style={styles.infoText}>
              Katıldığınız etkinlikleri
              burada görebilirsiniz.
            </Text>
          </View>
        </View>

        {/* Etkinlikler */}
        <Text style={styles.sectionTitle}>
          {events.length} Etkinlik
        </Text>

        {events.length > 0 ? (
          events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              description={
                event.description
              }
              date={event.event_date}
              time={event.event_time}
              location={event.location}
              participantCount={
                event.participant_count ||
                0
              }
              category={
                event.category_name
              }
              onPress={() =>
                handleEventPress(event)
              }
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={34}
                color="#94A3B8"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Henüz etkinliğe
              katılmadınız
            </Text>

            <Text style={styles.emptyText}>
              Katıldığınız etkinlikler
              burada görünecektir.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(
                  "Events"
                )
              }
              style={styles.eventsButton}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text
                style={styles.eventsButtonText}
              >
                Etkinlikleri Keşfet
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={styles.bottomSpacing}
        />
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
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  infoText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 15,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },

  emptyCard: {
    marginHorizontal: 20,
    marginTop: 5,
    paddingVertical: 40,
    paddingHorizontal: 25,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 7,
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  eventsButton: {
    height: 48,
    paddingHorizontal: 18,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  eventsButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  bottomSpacing: {
    height: 30,
  },
});
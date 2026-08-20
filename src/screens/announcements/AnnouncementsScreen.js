import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import AnnouncementCard from "../../components/home/AnnouncementCard";

import {
  getAnnouncements,
} from "../../services/announcementService";

import Colors from "../../theme/colors";

export default function AnnouncementsScreen({
  navigation,
}) {
  const [announcements, setAnnouncements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadAnnouncements = async () => {
    try {
      const data =
        await getAnnouncements();

      setAnnouncements(data);
    } catch (error) {
      console.error(
        "AnnouncementsScreen error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnnouncements();
  };

  const handleAnnouncementPress = (
    announcement
  ) => {
    if (!announcement?.id) {
      return;
    }

    navigation.navigate(
      "AnnouncementDetail",
      {
        announcement,
      }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
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
        <View style={styles.header}>
          <Text style={styles.title}>
            Duyurular
          </Text>

          <Text style={styles.subtitle}>
            Kulüplerden gelen son duyurular
          </Text>
        </View>

        {announcements.length > 0 ? (
          announcements.map(
            (announcement) => (
              <AnnouncementCard
                key={announcement.id}
                title={announcement.title}
                content={announcement.content}
                createdAt={
                  announcement.created_at
                }
                onPress={() =>
                  handleAnnouncementPress(
                    announcement
                  )
                }
              />
            )
          )
        ) : (
          <View style={styles.emptyCard}>
            <View
              style={styles.emptyIcon}
            >
              <Text style={styles.emptyIconText}>
                📢
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              Henüz duyuru yok
            </Text>

            <Text style={styles.emptyText}>
              Yayınlanan duyurular burada
              görünecek.
            </Text>
          </View>
        )}
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 6,
  },

  emptyCard: {
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 45,
    paddingHorizontal: 25,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 30,
  },

  emptyTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
});
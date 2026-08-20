import React, {
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
  TouchableOpacity,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import NotificationCard from "../../components/notifications/NotificationCard";

import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

import Colors from "../../theme/colors";

export default function NotificationsScreen({
  navigation,
}) {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadNotifications = async () => {
    try {
      const data =
        await getNotifications();

      setNotifications(data);
    } catch (error) {
      console.error(
        "NotificationsScreen error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  /*
   * Bildirime basıldığında:
   *
   * 1. Önce detay ekranına git
   * 2. Daha sonra bildirim okunmamışsa
   *    arka planda okundu olarak işaretle
   */
  const handleNotificationPress = (
    notification
  ) => {
    if (!notification?.id) {
      return;
    }

    // Önce detay ekranını aç
    navigation.navigate(
      "NotificationDetail",
      {
        notification,
      }
    );

    // Bildirim okunmamışsa okundu olarak işaretle
    if (!notification.is_read) {
      markNotificationAsRead(
        notification.id
      )
        .then(() => {
          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (item) =>
                  item.id === notification.id
                    ? {
                        ...item,
                        is_read: true,
                      }
                    : item
              )
          );
        })
        .catch((error) => {
          console.error(
            "Mark notification read error:",
            error
          );
        });
    }
  };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
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
          <View>
            <Text style={styles.title}>
              Bildirimler
            </Text>

            <Text style={styles.subtitle}>
              {unreadCount > 0
                ? `${unreadCount} okunmamış bildirim`
                : "Tüm bildirimler okundu"}
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="notifications"
              size={24}
              color="#2563EB"
            />
          </View>
        </View>

        {/* Duyurular */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate(
              "Announcements"
            )
          }
          style={styles.announcementCard}
        >
          <View
            style={styles.announcementIcon}
          >
            <Ionicons
              name="megaphone"
              size={24}
              color="#F59E0B"
            />
          </View>

          <View
            style={styles.announcementContent}
          >
            <Text
              style={styles.announcementTitle}
            >
              Duyurular
            </Text>

            <Text
              style={styles.announcementText}
            >
              Kulüpler tarafından yayınlanan
              duyuruları görüntüle.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#94A3B8"
          />
        </TouchableOpacity>

        {/* Bildirimler başlığı */}
        <Text style={styles.sectionTitle}>
          Bildirimler
        </Text>

        {/* Bildirim listesi */}
        {notifications.length > 0 ? (
          notifications.map(
            (notification) => (
              <NotificationCard
                key={notification.id}
                title={notification.title}
                message={
                  notification.message
                }
                notificationType={
                  notification.notification_type
                }
                isRead={
                  notification.is_read
                }
                createdAt={
                  notification.created_at
                }
                onPress={() =>
                  handleNotificationPress(
                    notification
                  )
                }
              />
            )
          )
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={34}
                color="#94A3B8"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Bildirim yok
            </Text>

            <Text style={styles.emptyText}>
              Henüz herhangi bir bildiriminiz
              bulunmuyor.
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
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  announcementCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 17,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  announcementIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  announcementContent: {
    flex: 1,
  },

  announcementTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },

  announcementText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },

  emptyCard: {
    marginHorizontal: 20,
    marginTop: 10,
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
    marginBottom: 7,
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
});
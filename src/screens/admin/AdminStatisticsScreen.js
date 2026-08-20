import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  supabase,
} from "../../config/supabase";

export default function AdminStatisticsScreen({
  navigation,
}) {
  const [stats, setStats] = useState({
    users: 0,
    clubs: 0,
    events: 0,
    announcements: 0,
    notifications: 0,
    memberships: 0,
    registrations: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * =====================================================
   * İSTATİSTİKLERİ YÜKLE
   * =====================================================
   */

  const loadStatistics = async () => {
    try {
      const [
        usersResult,
        clubsResult,
        eventsResult,
        announcementsResult,
        notificationsResult,
        membershipsResult,
        registrationsResult,
      ] = await Promise.all([
        supabase
          .from("users")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("club")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("events")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("announcements")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("notifications")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("club_members")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from("event_participants")
          .select(
            "id",
            {
              count: "exact",
              head: true,
            }
          ),
      ]);

      if (usersResult.error) {
        console.error(
          "Users statistics:",
          usersResult.error
        );
      }

      if (clubsResult.error) {
        console.error(
          "Clubs statistics:",
          clubsResult.error
        );
      }

      if (eventsResult.error) {
        console.error(
          "Events statistics:",
          eventsResult.error
        );
      }

      if (
        announcementsResult.error
      ) {
        console.error(
          "Announcements statistics:",
          announcementsResult.error
        );
      }

      if (
        notificationsResult.error
      ) {
        console.error(
          "Notifications statistics:",
          notificationsResult.error
        );
      }

      if (
        membershipsResult.error
      ) {
        console.error(
          "Membership statistics:",
          membershipsResult.error
        );
      }

      if (
        registrationsResult.error
      ) {
        console.error(
          "Registration statistics:",
          registrationsResult.error
        );
      }

      setStats({
        users:
          usersResult.count || 0,

        clubs:
          clubsResult.count || 0,

        events:
          eventsResult.count || 0,

        announcements:
          announcementsResult.count || 0,

        notifications:
          notificationsResult.count || 0,

        memberships:
          membershipsResult.count || 0,

        registrations:
          registrationsResult.count || 0,
      });
    } catch (error) {
      console.error(
        "Statistics error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * =====================================================
   * İLK YÜKLEME
   * =====================================================
   */

  useEffect(() => {
    loadStatistics();
  }, []);

  /*
   * =====================================================
   * YENİLE
   * =====================================================
   */

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        {/* SABİT HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerContent
            }
          >
            <Text
              style={styles.title}
            >
              İstatistikler
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Sistem genel görünümü
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="stats-chart"
              size={23}
              color="#7C3AED"
            />
          </View>
        </View>

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#7C3AED"
          />
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =====================================================
   * EKRAN
   * =====================================================
   */

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* =================================================
          SABİT HEADER
      ================================================= */}

      <View style={styles.header}>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.backButton
          }
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerContent
          }
        >
          <Text
            style={styles.title}
          >
            İstatistikler
          </Text>

          <Text
            style={styles.subtitle}
          >
            Sistem genel görünümü
          </Text>
        </View>

        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="stats-chart"
            size={23}
            color="#7C3AED"
          />
        </View>

      </View>

      {/* =================================================
          SADECE İÇERİK KAYACAK
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[
              "#7C3AED",
            ]}
          />
        }
      >

        {/* ANA İSTATİSTİKLER */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Genel Bakış
        </Text>

        <View
          style={styles.card}
        >
          <StatRow
            icon="people-outline"
            title="Toplam Kullanıcı"
            value={stats.users}
            color="#2563EB"
          />

          <StatRow
            icon="people-circle-outline"
            title="Toplam Kulüp"
            value={stats.clubs}
            color="#7C3AED"
          />

          <StatRow
            icon="calendar-outline"
            title="Toplam Etkinlik"
            value={stats.events}
            color="#F59E0B"
          />

          <StatRow
            icon="megaphone-outline"
            title="Toplam Duyuru"
            value={
              stats.announcements
            }
            color="#16A34A"
          />

          <StatRow
            icon="notifications-outline"
            title="Toplam Bildirim"
            value={
              stats.notifications
            }
            color="#DC2626"
            last
          />
        </View>

        {/* ÜYELİKLER */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Katılım
        </Text>

        <View
          style={styles.card}
        >
          <StatRow
            icon="people-outline"
            title="Kulüp Üyelikleri"
            value={
              stats.memberships
            }
            color="#0891B2"
          />

          <StatRow
            icon="ticket-outline"
            title="Etkinlik Kayıtları"
            value={
              stats.registrations
            }
            color="#EA580C"
            last
          />
        </View>

        {/* ÖZET */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Özet
        </Text>

        <View
          style={
            styles.summaryGrid
          }
        >
          <SummaryCard
            icon="people"
            title="Kullanıcılar"
            value={stats.users}
            background="#EFF6FF"
            iconColor="#2563EB"
          />

          <SummaryCard
            icon="business"
            title="Kulüpler"
            value={stats.clubs}
            background="#F5F3FF"
            iconColor="#7C3AED"
          />

          <SummaryCard
            icon="calendar"
            title="Etkinlikler"
            value={stats.events}
            background="#FFF7ED"
            iconColor="#F59E0B"
          />

          <SummaryCard
            icon="megaphone"
            title="Duyurular"
            value={
              stats.announcements
            }
            background="#F0FDF4"
            iconColor="#16A34A"
          />
        </View>

        <View
          style={
            styles.bottomSpacing
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
}

/*
 * =====================================================
 * STAT ROW
 * =====================================================
 */

function StatRow({
  icon,
  title,
  value,
  color,
  last = false,
}) {
  return (
    <View
      style={[
        styles.statRow,
        !last &&
          styles.statRowBorder,
      ]}
    >
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor:
              color + "15",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={color}
        />
      </View>

      <Text
        style={styles.statTitle}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.statValue,
          {
            color,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

/*
 * =====================================================
 * SUMMARY CARD
 * =====================================================
 */

function SummaryCard({
  icon,
  title,
  value,
  background,
  iconColor,
}) {
  return (
    <View
      style={
        styles.summaryCard
      }
    >
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor:
              background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={23}
          color={iconColor}
        />
      </View>

      <Text
        style={
          styles.summaryValue
        }
      >
        {value}
      </Text>

      <Text
        style={
          styles.summaryTitle
        }
      >
        {title}
      </Text>
    </View>
  );
}

/*
 * =====================================================
 * STYLES
 * =====================================================
 */

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingBottom: 30,
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    /*
     * HEADER
     */

    header: {
      minHeight: 78,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
      zIndex: 10,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    headerContent: {
      flex: 1,
    },

    title: {
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
    },

    subtitle: {
      color: "#94A3B8",
      fontSize: 12,
      marginTop: 3,
    },

    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#F5F3FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    /*
     * SECTION
     */

    sectionTitle: {
      marginHorizontal: 20,
      marginTop: 25,
      marginBottom: 13,
      color: "#0F172A",
      fontSize: 19,
      fontWeight: "800",
    },

    /*
     * CARD
     */

    card: {
      marginHorizontal: 20,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      elevation: 3,
    },

    /*
     * STAT ROW
     */

    statRow: {
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
    },

    statRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    statIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    statTitle: {
      flex: 1,
      color: "#334155",
      fontSize: 14,
      fontWeight: "700",
    },

    statValue: {
      fontSize: 22,
      fontWeight: "800",
    },

    /*
     * SUMMARY
     */

    summaryGrid: {
      marginHorizontal: 20,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent:
        "space-between",
      gap: 12,
    },

    summaryCard: {
      width: "48%",
      minHeight: 130,
      padding: 16,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      elevation: 3,
    },

    summaryIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
    },

    summaryValue: {
      marginTop: 12,
      color: "#0F172A",
      fontSize: 23,
      fontWeight: "800",
    },

    summaryTitle: {
      color: "#64748B",
      fontSize: 12,
      marginTop: 3,
    },

    bottomSpacing: {
      height: 30,
    },
  });
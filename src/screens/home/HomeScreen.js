import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import HomeHeader from "../../components/home/HomeHeader";
import SummaryCard from "../../components/home/SummaryCard";
import StatCard from "../../components/home/StatCard";
import TodayEventCard from "../../components/home/TodayEventCard";
import EventCard from "../../components/home/EventCard";
import AnnouncementCard from "../../components/home/AnnouncementCard";
import PopularEventCard from "../../components/home/PopularEventCard";
import LeaderboardCard from "../../components/home/LeaderboardCard";
import { Ionicons } from "@expo/vector-icons";
import { getHomeData } from "../../services/homeService";

import Colors from "../../theme/colors";

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState(null);

  const [eventCount, setEventCount] = useState(0);
  const [clubCount, setClubCount] = useState(0);
  const [notificationCount, setNotificationCount] =
    useState(0);

  const [todayEvents, setTodayEvents] =
    useState([]);

  const [upcomingEvents, setUpcomingEvents] =
    useState([]);

  const [announcements, setAnnouncements] =
    useState([]);

  const [popularEvents, setPopularEvents] =
    useState([]);

  const [leaderboard, setLeaderboard] =
    useState([]);

  const loadHome = async () => {
    try {
      const data = await getHomeData();

      setProfile(data.profile);

      setEventCount(data.eventCount);

      setClubCount(data.clubCount);

      setNotificationCount(
        data.notificationCount
      );

      setTodayEvents(
        data.todayEvents || []
      );

      setUpcomingEvents(
        data.upcomingEvents || []
      );

      setAnnouncements(
        data.announcements || []
      );

      setPopularEvents(
        data.popularEvents || []
      );

      setLeaderboard(
        data.leaderboard || []
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHome();
  };

  /*
   * Etkinlik detayına git
   *
   * Home -> Events Tab -> EventDetail
   */
  const handleEventPress = (event) => {
    if (!event?.id) {
      return;
    }

    navigation.navigate("Events", {
      screen: "EventDetail",
      params: {
        event: event,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
       <HomeHeader
  user={profile}
  onProfilePress={() =>
    navigation.navigate("Profile")
  }
/>

        <SummaryCard
          eventCount={eventCount}
          announcementCount={
            announcements.length
          }
          notificationCount={
            notificationCount
          }
        />

        {/* Bugünkü Etkinlikler */}
        <Text style={styles.sectionTitle}>
          Bugünkü Etkinlikler
        </Text>

        {todayEvents.length > 0 ? (
          <TodayEventCard
            title={todayEvents[0].title}
            date={todayEvents[0].event_date}
            time={todayEvents[0].event_time}
            location={todayEvents[0].location}
            participantCount={
              todayEvents[0]
                .participant_count || 0
            }
            onPress={() =>
              handleEventPress(
                todayEvents[0]
              )
            }
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Bugün planlanmış etkinlik
              bulunmuyor.
            </Text>
          </View>
        )}

        {/* Yaklaşan Etkinlikler */}
        <Text style={styles.sectionTitle}>
          Yaklaşan Etkinlikler
        </Text>

        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
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
                event.participant_count || 0
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
            <Text style={styles.emptyText}>
              Yaklaşan etkinlik
              bulunmuyor.
            </Text>
          </View>
        )}

        {/* Son Duyurular */}
        <Text style={styles.sectionTitle}>
          Son Duyurular
        </Text>

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
    navigation.navigate(
      "Notifications",
      {
        screen: "Announcements",
      }
    )
  }
/>
            )
          )
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Henüz duyuru bulunmuyor.
            </Text>
          </View>
        )}

        {/* Popüler Etkinlikler */}
        <Text style={styles.sectionTitle}>
          Popüler Etkinlikler
        </Text>

        <View style={styles.popularEventsContainer}>
  {popularEvents.length > 0 ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
    >
      {popularEvents.map((event) => (
        <PopularEventCard
          key={event.id}
          title={event.title}
          image={event.image}
          participantCount={
            event.participant_count || 0
          }
          date={event.event_date}
          onPress={() => {}}
        />
      ))}
    </ScrollView>
  ) : (
    <View style={styles.emptyPopularCard}>
      <View style={styles.emptyPopularIcon}>
        <Ionicons
          name="calendar-outline"
          size={24}
          color="#94A3B8"
        />
      </View>

      <Text style={styles.emptyPopularTitle}>
        Henüz popüler etkinlik yok
      </Text>

      <Text style={styles.emptyPopularText}>
        Popüler etkinlikler burada görüntülenecek.
      </Text>
    </View>
  )}
</View>

        {/* Liderlik Tablosu */}
        <Text style={styles.sectionTitle}>
          Liderlik Tablosu
        </Text>

        {leaderboard.length > 0 ? (
          leaderboard.map(
            (user, index) => (
              <LeaderboardCard
                key={user.id}
                rank={index + 1}
                name={`${user.first_name} ${user.last_name}`}
                department={
                  user.department
                }
                point={user.point}
                profileImage={
                  user.profile_image
                }
              />
            )
          )
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Henüz liderlik verisi
              bulunmuyor.
            </Text>
          </View>
        )}

        {/* İstatistikler */}
        <Text style={styles.sectionTitle}>
          İstatistikler
        </Text>

        <View style={styles.statsRow}>
          <StatCard
            icon="calendar"
            number={eventCount}
            title="Etkinlik"
            color="#2563EB"
          />

          <StatCard
            icon="people"
            number={clubCount}
            title="Kulüp"
            color="#7C3AED"
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon="notifications"
            number={notificationCount}
            title="Bildirim"
            color="#F59E0B"
          />

          <StatCard
            icon="school"
            number={
              profile?.class_year || "-"
            }
            title="Sınıf"
            color="#22C55E"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    paddingBottom: 40,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 18,
  },

  horizontalList: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
  },

  emptyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 35,
    paddingHorizontal: 20,
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

  popularEventsContainer: {
  marginHorizontal: 20,
  marginBottom: 8,
},

emptyPopularCard: {
  minHeight: 120,
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 20,
  paddingVertical: 24,

  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 6,
  },

  elevation: 4,
},

emptyPopularIcon: {
  width: 46,
  height: 46,
  borderRadius: 14,
  backgroundColor: "#F1F5F9",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 10,
},

emptyPopularTitle: {
  color: "#475569",
  fontSize: 14,
  fontWeight: "700",
  textAlign: "center",
},

emptyPopularText: {
  color: "#94A3B8",
  fontSize: 12,
  marginTop: 4,
  textAlign: "center",
},

  emptyText: {
    color: "#94A3B8",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
  },
});
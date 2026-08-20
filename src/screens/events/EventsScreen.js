import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';

import EventSearch from '../../components/events/EventSearch';
import CategoryFilter from '../../components/events/CategoryFilter';
import FeaturedEvent from '../../components/events/FeaturedEvent';
import EventCard from '../../components/events/EventCard';

import {
  getEvents,
  getEventCategories,
  joinEvent,
  leaveEvent,
} from '../../services/eventsService';

const EventsScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([
    {
      id: 'all',
      name: 'Tümü',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningEventId, setJoiningEventId] = useState(null);
  const [error, setError] = useState(null);

  /*
   * Etkinlikleri ve kategorileri getirir.
   */
  const loadData = async () => {
    try {
      setError(null);

      const [
        eventsResult,
        categoriesResult,
      ] = await Promise.all([
        getEvents(),
        getEventCategories(),
      ]);

      if (!eventsResult.success) {
        setError(eventsResult.error);
        return;
      }

      setEvents(eventsResult.data);

      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
    } catch (loadError) {
      console.error(
        'EventsScreen loadData error:',
        loadError
      );

      setError(
        'Etkinlikler yüklenirken bir hata oluştu.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
   * Arama + kategori filtreleme
   */
  const filteredEvents = useMemo(() => {
    const normalizedSearch =
      searchText.trim().toLocaleLowerCase('tr-TR');

    return events.filter((event) => {
      const title =
        event.title?.toLocaleLowerCase('tr-TR') || '';

      const description =
        event.description?.toLocaleLowerCase('tr-TR') || '';

      const location =
        event.location?.toLocaleLowerCase('tr-TR') || '';

      const matchesSearch =
        normalizedSearch.length === 0 ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        location.includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === 'all' ||
        event.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchText, selectedCategory]);

  /*
   * Öne çıkan etkinlik
   */
  const featuredEvent = useMemo(() => {
    if (filteredEvents.length === 0) {
      return null;
    }

    return filteredEvents[0];
  }, [filteredEvents]);

  /*
   * Bugünkü etkinlikler
   */
  const todayEvents = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      today.getDate()
    ).padStart(2, '0');

    const todayString =
      `${year}-${month}-${day}`;

    return filteredEvents.filter(
      (event) => event.date === todayString
    );
  }, [filteredEvents]);

  /*
   * Yaklaşan etkinlikler
   */
  const upcomingEvents = useMemo(() => {
    return filteredEvents.filter(
      (event) => event.id !== featuredEvent?.id
    );
  }, [filteredEvents, featuredEvent]);

  /*
   * Popüler etkinlikler
   */
  const popularEvents = useMemo(() => {
    return [...filteredEvents]
      .sort(
        (a, b) =>
          b.participantCount -
          a.participantCount
      )
      .slice(0, 3);
  }, [filteredEvents]);

  /*
   * Pull-to-refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  /*
   * Etkinlik detayına gitme
   */
  const handleEventPress = (event) => {
  navigation.navigate('EventDetail', {
    event,
  });
};

  /*
   * Etkinliğe katıl / ayrıl
   */
  const handleJoinEvent = async (event) => {
    if (!event?.id) {
      return;
    }

    if (joiningEventId) {
      return;
    }

    try {
      setJoiningEventId(event.id);

      /*
       * Kullanıcı zaten katılmışsa ayrıl.
       */
      if (event.isJoined) {
        const result = await leaveEvent(event.id);

        if (!result.success) {
          Alert.alert(
            'İşlem başarısız',
            result.error
          );

          return;
        }

        /*
         * Ekrandaki veriyi anında güncelle.
         */
        setEvents((currentEvents) =>
          currentEvents.map((currentEvent) =>
            currentEvent.id === event.id
              ? {
                  ...currentEvent,
                  isJoined: false,
                  participantCount:
                    Math.max(
                      0,
                      currentEvent.participantCount - 1
                    ),
                }
              : currentEvent
          )
        );

        return;
      }

      /*
       * Kullanıcı etkinliğe katılıyor.
       */
      const result = await joinEvent(event.id);

      if (!result.success) {
        Alert.alert(
          'Katılım başarısız',
          result.error
        );

        return;
      }

      /*
       * Ekrandaki veriyi anında güncelle.
       */
      setEvents((currentEvents) =>
        currentEvents.map((currentEvent) =>
          currentEvent.id === event.id
            ? {
                ...currentEvent,
                isJoined: true,
                participantCount:
                  currentEvent.participantCount + 1,
              }
            : currentEvent
        )
      );
    } catch (joinError) {
      console.error(
        'handleJoinEvent error:',
        joinError
      );

      Alert.alert(
        'Hata',
        'İşlem sırasında beklenmeyen bir hata oluştu.'
      );
    } finally {
      setJoiningEventId(null);
    }
  };

  /*
   * Yükleniyor
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8FAFC"
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#4F46E5"
          />

          <Text style={styles.loadingText}>
            Etkinlikler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.eyebrow}>
              KULÜP YÖNETİM SİSTEMİ
            </Text>

            <Text style={styles.headerTitle}>
              Etkinlikler
            </Text>

            <Text style={styles.headerSubtitle}>
              Kampüsteki etkinlikleri keşfet
            </Text>
          </View>

          <View style={styles.eventCountBadge}>
            <Text style={styles.eventCountNumber}>
              {filteredEvents.length}
            </Text>

            <Text style={styles.eventCountLabel}>
              Etkinlik
            </Text>
          </View>
        </View>

        {/* Hata */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              Etkinlikler yüklenemedi
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* Arama */}
        <EventSearch
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Kategoriler */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Öne çıkan */}
        {featuredEvent && (
          <View>
            <SectionHeader
              title="Öne Çıkan"
              subtitle="Dikkat çeken etkinlik"
            />

            <FeaturedEvent
              event={featuredEvent}
              onPress={handleEventPress}
            />
          </View>
        )}

        {/* Bugünkü etkinlikler */}
        {todayEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Bugünkü Etkinlikler"
              subtitle="Bugün gerçekleşecek etkinlikler"
            />

            {todayEvents.map((event) => (
              <EventCard
                key={`today-${event.id}`}
                event={event}
                onPress={handleEventPress}
                onJoin={handleJoinEvent}
                isJoining={
                  joiningEventId === event.id
                }
              />
            ))}
          </View>
        )}

        {/* Yaklaşan etkinlikler */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Yaklaşan Etkinlikler"
              subtitle="Katılabileceğin etkinlikler"
            />

            {upcomingEvents.map((event) => (
              <EventCard
                key={`upcoming-${event.id}`}
                event={event}
                onPress={handleEventPress}
                onJoin={handleJoinEvent}
                isJoining={
                  joiningEventId === event.id
                }
              />
            ))}
          </View>
        )}

        {/* Popüler etkinlikler */}
        {popularEvents.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Popüler Etkinlikler"
              subtitle="En çok ilgi gören etkinlikler"
            />

            {popularEvents.map((event) => (
              <EventCard
                key={`popular-${event.id}`}
                event={event}
                onPress={handleEventPress}
                onJoin={handleJoinEvent}
                isJoining={
                  joiningEventId === event.id
                }
              />
            ))}
          </View>
        )}

        {/* Sonuç yok */}
        {filteredEvents.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>
                🔍
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              Etkinlik bulunamadı
            </Text>

            <Text style={styles.emptyText}>
              Arama kriterlerini veya kategori
              seçimini değiştirmeyi deneyebilirsin.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const SectionHeader = ({
  title,
  subtitle,
}) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },

  eyebrow: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  headerTitle: {
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },

  headerSubtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 3,
  },

  eventCountBadge: {
    minWidth: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },

  eventCountNumber: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '800',
  },

  eventCountLabel: {
    color: '#6366F1',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },

  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },

  errorTitle: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  errorText: {
    color: '#991B1B',
    fontSize: 12,
    lineHeight: 18,
  },

  section: {
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },

  sectionTitleContainer: {
    flex: 1,
  },

  sectionTitle: {
    color: '#0F172A',
    fontSize: 19,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 60,
  },

  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyIcon: {
    fontSize: 28,
  },

  emptyTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 7,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  bottomSpacing: {
    height: 30,
  },
});

export default EventsScreen;
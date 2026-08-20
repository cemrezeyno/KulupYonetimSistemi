import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ClubSearch from '../../components/clubs/ClubSearch';
import ClubCard from '../../components/clubs/ClubCard';
import { getClubs } from '../../services/clubService';

const ClubsScreen = ({
  navigation,
  route,
}) => {
  const fromPresident =
    route?.params?.fromPresident === true;
  const [clubs, setClubs] = useState([]);
  const [searchText, setSearchText] =
    useState('');
  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const loadClubs = async () => {
    try {
      const result = await getClubs();

      if (!result.success) {
        console.error(
          'Clubs loading error:',
          result.error
        );

        setClubs([]);
        return;
      }

      setClubs(result.data);
    } catch (error) {
      console.error(
        'ClubsScreen load error:',
        error
      );

      setClubs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    const search =
      searchText.trim().toLowerCase();

    if (!search) {
      return clubs;
    }

    return clubs.filter((club) => {
      const name =
        club.name?.toLowerCase() || '';

      const description =
        club.description?.toLowerCase() ||
        '';

      return (
        name.includes(search) ||
        description.includes(search)
      );
    });
  }, [clubs, searchText]);

  const handleClubPress = (club) => {
    navigation.navigate(
      'ClubDetail',
      {
        club,
      }
    );
  };

  const renderClub = ({
    item,
  }) => {
    return (
      <ClubCard
        club={item}
        onPress={handleClubPress}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="people-outline"
            size={38}
            color="#4F46E5"
          />
        </View>

        <Text style={styles.emptyTitle}>
          Kulüp bulunamadı
        </Text>

        <Text style={styles.emptyText}>
          Arama kriterlerine uygun bir kulüp
          bulunamadı.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>
        {/* Header */}
       <View style={styles.header}>
  <View style={styles.headerLeft}>
    {fromPresident && (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color="#0F172A"
        />
      </TouchableOpacity>
    )}

    <View>
      <Text style={styles.eyebrow}>
        KEŞFET
      </Text>

      <Text style={styles.title}>
        Kulüpler
      </Text>

      <Text style={styles.subtitle}>
        Üniversitedeki kulüpleri keşfet
      </Text>
    </View>
  </View>

  <View style={styles.headerIcon}>
    <Ionicons
      name="people"
      size={23}
      color="#4F46E5"
    />
  </View>
</View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <ClubSearch
            value={searchText}
            onChangeText={setSearchText}
            onClear={() =>
              setSearchText('')
            }
          />
        </View>

        {/* Club count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredClubs.length} kulüp
          </Text>
        </View>

        {/* List */}
        <FlatList
          data={filteredClubs}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderClub}
          contentContainerStyle={[
            styles.listContent,
            filteredClubs.length === 0 &&
              styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4F46E5"
            />
          }
          ListEmptyComponent={
            renderEmpty
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
headerLeft: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
},

backButton: {
  width: 42,
  height: 42,
  borderRadius: 14,
  backgroundColor: '#F8FAFC',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
  eyebrow: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 4,
  },

  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchContainer: {
    paddingHorizontal: 20,
  },

  countContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },

  countText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
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
});

export default ClubsScreen;
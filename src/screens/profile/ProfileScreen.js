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
  Image,
  RefreshControl,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import {
  getProfile,
} from "../../services/profileService";

import Colors from "../../theme/colors";

export default function ProfileScreen({
  navigation,
}) {
  const [profileData, setProfileData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadProfile = async () => {
    try {
      const data =
        await getProfile();

      setProfileData(data);
    } catch (error) {
      console.error(
        "ProfileScreen error:",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * Profil ekranına her geri dönüldüğünde
   * güncel bilgileri tekrar çek.
   */
  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        "focus",
        () => {
          loadProfile();
        }
      );

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
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

  if (!profileData?.profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.errorContainer}
        >
          <Ionicons
            name="person-circle-outline"
            size={70}
            color="#CBD5E1"
          />

          <Text style={styles.errorTitle}>
            Profil bilgileri alınamadı
          </Text>

          <Text style={styles.errorText}>
            Profil bilgilerinize şu anda
            ulaşılamıyor.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    profile,
    email,
    club,
  } = profileData;

  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim();

  const initials =
    `${profile.first_name?.charAt(0) || ""}${profile.last_name?.charAt(0) || ""}`.toUpperCase();

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
          <Text style={styles.headerTitle}>
            Profil
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.settingsButton}
            onPress={() =>
              navigation.navigate(
                "Settings"
              )
            }
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>
        </View>

        {/* Profil Kartı */}
        <View style={styles.profileCard}>
          {profile.profile_image ? (
            <Image
              source={{
                uri: profile.profile_image,
              }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initials || "U"}
              </Text>
            </View>
          )}

          <Text style={styles.name}>
            {fullName || "Kullanıcı"}
          </Text>

          <Text style={styles.email}>
            {email}
          </Text>
        </View>

        {/* Hesap Bilgileri */}
        <Text style={styles.sectionTitle}>
          Hesap Bilgileri
        </Text>

        <View style={styles.infoCard}>
          <ProfileInfoRow
            icon="person-outline"
            title="Kullanıcı ID"
            value={profile.id}
          />

          <ProfileInfoRow
            icon="school-outline"
            title="Fakülte"
            value={
              profile.faculty ||
              "Belirtilmemiş"
            }
          />

          <ProfileInfoRow
            icon="book-outline"
            title="Bölüm"
            value={
              profile.department ||
              "Belirtilmemiş"
            }
          />

          <ProfileInfoRow
            icon="calendar-outline"
            title="Sınıf"
            value={
              profile.class_year
                ? `${profile.class_year}. Sınıf`
                : "Belirtilmemiş"
            }
            last
          />
        </View>

        {/* Kulüp */}
        <Text style={styles.sectionTitle}>
          Kulübüm
        </Text>

        <View style={styles.clubCard}>
          <View style={styles.clubIcon}>
            <Ionicons
              name="people"
              size={25}
              color="#7C3AED"
            />
          </View>

          <View style={styles.clubContent}>
            <Text style={styles.clubLabel}>
              Bağlı Olduğun Kulüp
            </Text>

            <Text style={styles.clubName}>
              {club?.club_name ||
                "Herhangi bir kulübe kayıtlı değilsin"}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CBD5E1"
          />
        </View>

        {/* Hesap İşlemleri */}
        <Text style={styles.sectionTitle}>
          Hesap
        </Text>

        <View style={styles.actionsCard}>
          <ProfileAction
            icon="person-outline"
            title="Profil Bilgilerim"
            onPress={() =>
              navigation.navigate(
                "EditProfile"
              )
            }
          />

          <ProfileAction
  icon="calendar-outline"
  title="Katıldığım Etkinlikler"
  onPress={() =>
    navigation.navigate(
      "JoinedEvents"
    )
  }
/>

          <ProfileAction
            icon="settings-outline"
            title="Ayarlar"
            onPress={() =>
              navigation.navigate(
                "Settings"
              )
            }
            last
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileInfoRow({
  icon,
  title,
  value,
  last = false,
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && styles.infoRowBorder,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text
          style={styles.infoValue}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProfileAction({
  icon,
  title,
  onPress,
  last = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.actionRow,
        !last && styles.actionBorder,
      ]}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#475569"
        />
      </View>

      <Text style={styles.actionTitle}>
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#CBD5E1"
      />
    </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "center",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 15,
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
  },

  errorText: {
    marginTop: 7,
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },

  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  profileCard: {
    marginHorizontal: 20,
    marginTop: 5,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  avatar: {
    width: 92,
    height: 92,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  avatarText: {
    color: "#4F46E5",
    fontSize: 32,
    fontWeight: "800",
  },

  profileImage: {
    width: 92,
    height: 92,
    borderRadius: 32,
    marginBottom: 15,
  },

  name: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
  },

  email: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 13,
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
  },

  infoCard: {
    marginHorizontal: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  infoRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
  },

  infoValue: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },

  clubCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  clubIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  clubContent: {
    flex: 1,
  },

  clubLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },

  clubName: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  actionsCard: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  actionRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
  },

  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  actionTitle: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },

  bottomSpacing: {
    height: 30,
  },
});
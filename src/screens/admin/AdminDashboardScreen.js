import React, {
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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

export default function AdminDashboardScreen({
  navigation,
}) {
const [loggingOut, setLoggingOut] = useState(false);

const handleLogout = async () => {
  if (loggingOut) {
    return;
  }

  try {
    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut({
        scope: "local",
      });

    if (error) {
      throw error;
    }

    console.log(
      "Admin çıkış başarılı."
    );

    // Burada navigation.navigate("Login")
    // YAPMIYORUZ.
    //
    // RootNavigator auth state değişimini
    // algılayıp Login ekranına dönecek.

  } catch (error) {
    console.error(
      "Admin logout error:",
      error
    );

    Alert.alert(
      "Hata",
      error.message ||
        "Çıkış yapılamadı."
    );
  } finally {
    setLoggingOut(false);
  }
};

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>

          <View>
            <Text
              style={styles.smallTitle}
            >
              Yönetim Paneli
            </Text>

            <Text
              style={styles.title}
            >
              Admin Dashboard
            </Text>
          </View>

          <View
            style={styles.adminIcon}
          >
            <Ionicons
              name="shield-checkmark"
              size={25}
              color="#FFFFFF"
            />
          </View>

        </View>


        {/* ================================================= */}
        {/* HOŞ GELDİN */}
        {/* ================================================= */}

        <View
          style={styles.welcomeCard}
        >

          <View
            style={styles.welcomeIcon}
          >
            <Ionicons
              name="settings-outline"
              size={28}
              color="#4F46E5"
            />
          </View>

          <View
            style={styles.welcomeContent}
          >
            <Text
              style={styles.welcomeTitle}
            >
              Yönetici Paneline Hoş Geldiniz
            </Text>

            <Text
              style={styles.welcomeText}
            >
              Kulüpleri, kullanıcıları,
              etkinlikleri ve uygulamadaki
              diğer yönetim işlemlerini
              buradan kontrol edebilirsiniz.
            </Text>
          </View>

        </View>


        {/* ================================================= */}
        {/* YÖNETİM */}
        {/* ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          Yönetim
        </Text>


        <View style={styles.grid}>

          {/* ============================================= */}
          {/* KULLANICILAR */}
          {/* ============================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.managementCard
            }
            onPress={() =>
              navigation.navigate(
                "AdminUsers"
              )
            }
          >

            <View
              style={[
                styles.cardIcon,
                styles.blueIcon,
              ]}
            >
              <Ionicons
                name="people-outline"
                size={25}
                color="#2563EB"
              />
            </View>

            <Text
              style={styles.cardTitle}
            >
              Kullanıcı Yönetimi
            </Text>

            <Text
              style={
                styles.cardDescription
              }
            >
              Kullanıcıları görüntüle ve
              yönet
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#CBD5E1"
              style={styles.cardArrow}
            />

          </TouchableOpacity>


          {/* ============================================= */}
          {/* KULÜPLER */}
          {/* ============================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.managementCard
            }
            onPress={() =>
              navigation.navigate(
                "AdminClubs"
              )
            }
          >

            <View
              style={[
                styles.cardIcon,
                styles.purpleIcon,
              ]}
            >
              <Ionicons
                name="people-circle-outline"
                size={25}
                color="#7C3AED"
              />
            </View>

            <Text
              style={styles.cardTitle}
            >
              Kulüp Yönetimi
            </Text>

            <Text
              style={
                styles.cardDescription
              }
            >
              Kulüpleri oluştur ve düzenle
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#CBD5E1"
              style={styles.cardArrow}
            />

          </TouchableOpacity>


          {/* ============================================= */}
          {/* ETKİNLİKLER */}
          {/* ============================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.managementCard
            }
            onPress={() =>
              navigation.navigate(
                "AdminEvents"
              )
            }
          >

            <View
              style={[
                styles.cardIcon,
                styles.orangeIcon,
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={25}
                color="#F59E0B"
              />
            </View>

            <Text
              style={styles.cardTitle}
            >
              Etkinlik Yönetimi
            </Text>

            <Text
              style={
                styles.cardDescription
              }
            >
              Etkinlikleri ve
              katılımcıları yönet
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#CBD5E1"
              style={styles.cardArrow}
            />

          </TouchableOpacity>


          {/* ============================================= */}
          {/* DUYURULAR */}
          {/* ============================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.managementCard
            }
            onPress={() =>
              navigation.navigate(
                "AdminAnnouncements"
              )
            }
          >

            <View
              style={[
                styles.cardIcon,
                styles.greenIcon,
              ]}
            >
              <Ionicons
                name="megaphone-outline"
                size={25}
                color="#16A34A"
              />
            </View>

            <Text
              style={styles.cardTitle}
            >
              Duyuru Yönetimi
            </Text>

            <Text
              style={
                styles.cardDescription
              }
            >
              Duyuruları oluştur ve yönet
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#CBD5E1"
              style={styles.cardArrow}
            />

          </TouchableOpacity>


          {/* ============================================= */}
          {/* BİLDİRİMLER */}
          {/* ============================================= */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={
              styles.managementCard
            }
            onPress={() =>
              navigation.navigate(
                "AdminNotifications"
              )
            }
          >

            <View
              style={[
                styles.cardIcon,
                styles.redIcon,
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={25}
                color="#DC2626"
              />
            </View>

            <Text
              style={styles.cardTitle}
            >
              Bildirim Yönetimi
            </Text>

            <Text
              style={
                styles.cardDescription
              }
            >
              Bildirimleri oluştur ve yönet
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#CBD5E1"
              style={styles.cardArrow}
            />

          </TouchableOpacity>

        </View>


        {/* ================================================= */}
        {/* SİSTEM */}
        {/* ================================================= */}

        <Text
          style={styles.sectionTitle}
        >
          Sistem
        </Text>


        <View
          style={styles.systemCard}
        >

          {/* İSTATİSTİKLER */}

          <SystemRow
            icon="stats-chart-outline"
            title="İstatistikler"
            description="Sistem istatistiklerini görüntüle"
            onPress={() =>
              navigation.navigate(
                "AdminStatistics"
              )
            }
          />


          {/* ALT SINIR */}

          <View
            style={styles.systemRowBorder}
          />


          {/* ÇIKIŞ */}

          <TouchableOpacity
            activeOpacity={0.75}
            disabled={loggingOut}
            onPress={handleLogout}
            style={styles.logoutRow}
          >

            <View
              style={styles.logoutIcon}
            >
              {loggingOut ? (
                <ActivityIndicator
                  size="small"
                  color="#DC2626"
                />
              ) : (
                <Ionicons
                  name="log-out-outline"
                  size={21}
                  color="#DC2626"
                />
              )}
            </View>

            <View
              style={styles.systemContent}
            >

              <Text
                style={styles.logoutTitle}
              >
                Çıkış Yap
              </Text>

              <Text
                style={
                  styles.systemDescription
                }
              >
                Admin hesabından çıkış yap
              </Text>

            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color="#CBD5E1"
            />

          </TouchableOpacity>

        </View>


        <View
          style={styles.bottomSpacing}
        />

      </ScrollView>
    </SafeAreaView>
  );
}


// =======================================================
// SYSTEM ROW
// =======================================================

function SystemRow({
  icon,
  title,
  description,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.systemRow}
    >

      <View
        style={styles.systemIcon}
      >
        <Ionicons
          name={icon}
          size={21}
          color="#475569"
        />
      </View>

      <View
        style={styles.systemContent}
      >

        <Text
          style={styles.systemTitle}
        >
          {title}
        </Text>

        <Text
          style={
            styles.systemDescription
          }
        >
          {description}
        </Text>

      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color="#CBD5E1"
      />

    </TouchableOpacity>
  );
}


// =======================================================
// STYLES
// =======================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },

    content: {
      paddingBottom: 30,
    },


    // HEADER

    header: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    smallTitle: {
      color: "#64748B",
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 4,
    },

    title: {
      color: "#0F172A",
      fontSize: 28,
      fontWeight: "800",
    },

    adminIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor: "#4F46E5",
      alignItems: "center",
      justifyContent: "center",
    },


    // WELCOME

    welcomeCard: {
      marginHorizontal: 20,
      padding: 18,
      borderRadius: 22,
      backgroundColor: "#EEF2FF",
      flexDirection: "row",
      alignItems: "center",
    },

    welcomeIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },

    welcomeContent: {
      flex: 1,
    },

    welcomeTitle: {
      color: "#312E81",
      fontSize: 15,
      fontWeight: "800",
      marginBottom: 5,
    },

    welcomeText: {
      color: "#6366F1",
      fontSize: 12,
      lineHeight: 18,
    },


    // SECTION

    sectionTitle: {
      marginHorizontal: 20,
      marginTop: 30,
      marginBottom: 15,
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
    },


    // GRID

    grid: {
      paddingHorizontal: 20,
      gap: 14,
    },


    // MANAGEMENT CARD

    managementCard: {
      minHeight: 125,
      padding: 16,
      borderRadius: 20,
      backgroundColor: "#FFFFFF",

      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    cardIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },

    blueIcon: {
      backgroundColor: "#EFF6FF",
    },

    purpleIcon: {
      backgroundColor: "#F5F3FF",
    },

    orangeIcon: {
      backgroundColor: "#FFF7ED",
    },

    greenIcon: {
      backgroundColor: "#F0FDF4",
    },

    redIcon: {
      backgroundColor: "#FEF2F2",
    },

    cardTitle: {
      color: "#0F172A",
      fontSize: 15,
      fontWeight: "800",
      marginBottom: 4,
    },

    cardDescription: {
      color: "#64748B",
      fontSize: 12,
      lineHeight: 18,
      paddingRight: 30,
    },

    cardArrow: {
      position: "absolute",
      right: 16,
      bottom: 18,
    },


    // SYSTEM

    systemCard: {
      marginHorizontal: 20,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: "#FFFFFF",

      shadowColor: "#000",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },

    systemRow: {
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
    },

    systemRowBorder: {
      height: 1,
      backgroundColor: "#F1F5F9",
    },

    systemIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "#F8FAFC",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    systemContent: {
      flex: 1,
    },

    systemTitle: {
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "800",
    },

    systemDescription: {
      color: "#94A3B8",
      fontSize: 11,
      marginTop: 4,
    },


    // LOGOUT

    logoutRow: {
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
    },

    logoutIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "#FEF2F2",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    logoutTitle: {
      color: "#DC2626",
      fontSize: 14,
      fontWeight: "800",
    },


    // BOTTOM

    bottomSpacing: {
      height: 30,
    },

  });
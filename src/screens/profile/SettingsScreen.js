import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../config/supabase";

export default function SettingsScreen({
  navigation,
}) {
  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const [loggingOut, setLoggingOut] =
    useState(false);

  /*
   * Bildirim ayarı
   */
  const handleNotificationToggle = (
    value
  ) => {
    setNotificationsEnabled(value);
  };

  /*
   * Dil
   */
  const handleLanguagePress = () => {
    if (Platform.OS === "web") {
      window.alert(
        "Dil seçimi şu anda Türkçe olarak ayarlanmıştır."
      );

      return;
    }

    Alert.alert(
      "Dil",
      "Dil seçimi şu anda Türkçe olarak ayarlanmıştır."
    );
  };

  /*
   * Hakkında
   */
  const handleAboutPress = () => {
    const message =
      "Üniversite Kulüp Yönetim Sistemi\n\nVersiyon 1.0.0";

    if (Platform.OS === "web") {
      window.alert(message);

      return;
    }

    Alert.alert(
      "Kulüp Yönetim Sistemi",
      message
    );
  };

  /*
   * Gerçek çıkış işlemi
   */
  const performLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);

      console.log(
        "Çıkış işlemi başlatıldı..."
      );

      const {
        error,
      } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) {
        console.error(
          "Supabase logout error:",
          error
        );

        if (Platform.OS === "web") {
          window.alert(
            "Çıkış yapılamadı: " +
              error.message
          );
        } else {
          Alert.alert(
            "Çıkış yapılamadı",
            error.message ||
              "Çıkış yapılırken bir hata oluştu."
          );
        }

        return;
      }

      console.log(
        "Supabase çıkış başarılı."
      );

      /*
       * Çıkış sonrası session kontrolü
       */
      const {
        data: sessionData,
      } =
        await supabase.auth.getSession();

      console.log(
        "Çıkış sonrası session:",
        sessionData.session
      );

      /*
       * Burada manuel olarak Login'e
       * navigation yapmıyoruz.
       *
       * RootNavigator:
       *
       * SIGNED_OUT
       *      ↓
       * session = null
       *      ↓
       * AuthNavigator
       *      ↓
       * Login
       */
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      if (Platform.OS === "web") {
        window.alert(
          "Çıkış yapılırken bir hata oluştu."
        );
      } else {
        Alert.alert(
          "Hata",
          "Çıkış yapılırken bir hata oluştu."
        );
      }
    } finally {
      setLoggingOut(false);
    }
  };

  /*
   * Çıkış butonuna basıldığında
   */
  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    /*
     * WEB
     */
    if (Platform.OS === "web") {
      const confirmed =
        window.confirm(
          "Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
        );

      if (confirmed) {
        performLogout();
      }

      return;
    }

    /*
     * ANDROID / IOS
     */
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: performLogout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* HEADER */}

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
            Ayarlar
          </Text>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* BİLDİRİMLER */}

        <Text style={styles.sectionTitle}>
          Bildirimler
        </Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View
              style={styles.settingContent}
            >
              <Text style={styles.settingTitle}>
                Bildirimler
              </Text>

              <Text
                style={
                  styles.settingDescription
                }
              >
                Uygulama bildirimlerini al
              </Text>
            </View>

            <Switch
              value={
                notificationsEnabled
              }
              onValueChange={
                handleNotificationToggle
              }
              trackColor={{
                false: "#CBD5E1",
                true: "#93C5FD",
              }}
              thumbColor={
                notificationsEnabled
                  ? "#2563EB"
                  : "#F8FAFC"
              }
            />
          </View>
        </View>

        {/* UYGULAMA */}

        <Text style={styles.sectionTitle}>
          Uygulama
        </Text>

        <View style={styles.settingsCard}>
          <SettingRow
            icon="language-outline"
            title="Dil"
            description="Türkçe"
            onPress={
              handleLanguagePress
            }
          />

          <SettingRow
            icon="information-circle-outline"
            title="Hakkında"
            description="Uygulama bilgileri"
            onPress={
              handleAboutPress
            }
            last
          />
        </View>

        {/* HESAP */}

        <Text style={styles.sectionTitle}>
          Hesap
        </Text>

        <View style={styles.settingsCard}>
          {/* Profil Bilgilerim */}

          <SettingRow
            icon="person-outline"
            title="Profil Bilgilerim"
            description="Kişisel bilgilerini düzenle"
            onPress={() =>
              navigation.navigate(
                "EditProfile"
              )
            }
          />

          {/* Çıkış */}

          <TouchableOpacity
            activeOpacity={0.75}
            disabled={loggingOut}
            onPress={handleLogout}
            style={styles.logoutRow}
          >
            <View style={styles.logoutIcon}>
              <Ionicons
                name="log-out-outline"
                size={21}
                color="#DC2626"
              />
            </View>

            <View
              style={styles.settingContent}
            >
              <Text
                style={styles.logoutTitle}
              >
                Çıkış Yap
              </Text>

              <Text
                style={
                  styles.settingDescription
                }
              >
                Hesabından çıkış yap
              </Text>
            </View>

            {loggingOut ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={19}
                color="#CBD5E1"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* VERSİYON */}

        <Text style={styles.versionText}>
          Kulüp Yönetim Sistemi • v1.0.0
        </Text>

        <View
          style={styles.bottomSpacing}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * Ayar satırı
 */

function SettingRow({
  icon,
  title,
  description,
  onPress,
  last = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.settingRow,
        !last &&
          styles.settingRowBorder,
      ]}
    >
      <View style={styles.settingIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#475569"
        />
      </View>

      <View
        style={styles.settingContent}
      >
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text
          style={styles.settingDescription}
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

/*
 * STYLES
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingBottom: 30,
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

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 13,
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
  },

  settingsCard: {
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

  settingRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  logoutRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  logoutTitle: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "800",
  },

  settingDescription: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  versionText: {
    marginTop: 28,
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },

  bottomSpacing: {
    height: 30,
  },
});
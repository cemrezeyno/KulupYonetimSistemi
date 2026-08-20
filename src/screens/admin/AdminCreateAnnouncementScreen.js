import React, {
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

export default function AdminCreateAnnouncementScreen({
  navigation,
  route,
}) {
  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
   * =====================================================
   * BAŞARI MESAJINDAN SONRA DÖNÜLECEK EKRAN
   * =====================================================
   */

  const returnScreen =
    route?.params?.returnScreen ||
    "AdminAnnouncements";

  /*
   * =====================================================
   * BAŞARI MESAJI
   * =====================================================
   */

  const showSuccessMessage = () => {
    setSuccessMessage(
      "Duyuru başarıyla oluşturuldu."
    );

    setTimeout(() => {
      setSuccessMessage("");

      navigation.replace(
        returnScreen
      );
    }, 5000);
  };

  /*
   * =====================================================
   * DUYURU OLUŞTUR
   * =====================================================
   */

  const handleCreate = async () => {
    if (saving) {
      return;
    }

    /*
     * BAŞLIK KONTROLÜ
     */

    if (!title.trim()) {
      Alert.alert(
        "Eksik Bilgi",
        "Duyuru başlığı zorunludur."
      );

      return;
    }

    /*
     * İÇERİK KONTROLÜ
     */

    if (!content.trim()) {
      Alert.alert(
        "Eksik Bilgi",
        "Duyuru içeriği zorunludur."
      );

      return;
    }

    try {
      setSaving(true);

      /*
       * =================================================
       * AUTH KULLANICISINI BUL
       * =================================================
       */

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      const authUser =
        authData?.user;

      if (!authUser?.id) {
        throw new Error(
          "Aktif kullanıcı bulunamadı."
        );
      }

      /*
       * =================================================
       * USERS TABLOSUNDAN KULLANICIYI BUL
       * =================================================
       */

      const {
        data: currentUser,
        error: userError,
      } =
        await supabase
          .from("users")
          .select(
            "id, role_id"
          )
          .eq(
            "auth_user_id",
            authUser.id
          )
          .single();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        throw new Error(
          "Kullanıcı profili bulunamadı."
        );
      }

      /*
       * =================================================
       * YETKİ KONTROLÜ
       *
       * role_id = 1 → Admin
       * role_id = 3 → Kulüp Başkanı
       * =================================================
       */

      const isAdmin =
        currentUser.role_id === 1;

      const isClubPresident =
        currentUser.role_id === 3;

      if (
        !isAdmin &&
        !isClubPresident
      ) {
        throw new Error(
          "Bu işlemi gerçekleştirme yetkiniz yok."
        );
      }

      /*
       * =================================================
       * DUYURU OLUŞTUR
       *
       * Mevcut veritabanı yapısını değiştirmiyoruz.
       * =================================================
       */

      const {
        data,
        error: announcementError,
      } =
        await supabase
          .from("announcements")
          .insert({
            title:
              title.trim(),

            content:
              content.trim(),

            created_by:
              currentUser.id,

            is_active:
              true,
          })
          .select()
          .single();

      if (announcementError) {
        throw announcementError;
      }

      console.log(
        "Oluşturulan duyuru:",
        data
      );

      /*
       * =================================================
       * BAŞARILI
       * =================================================
       */

      showSuccessMessage();
    } catch (error) {
      console.error(
        "Create announcement error:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Duyuru oluşturulamadı."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * =====================================================
   * EKRAN
   * =====================================================
   */

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* ================================================= */}
      {/* BAŞARI MESAJI */}
      {/* ================================================= */}

      {successMessage ? (
        <View
          style={
            styles.successToast
          }
        >
          <View
            style={
              styles.successIcon
            }
          >
            <Ionicons
              name="checkmark"
              size={18}
              color="#16A34A"
            />
          </View>

          <Text
            style={
              styles.successText
            }
          >
            {successMessage}
          </Text>
        </View>
      ) : null}

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.goBack()
          }
          style={
            styles.backButton
          }
          disabled={saving}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </TouchableOpacity>

        <Text
          style={
            styles.headerTitle
          }
        >
          Yeni Duyuru
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      {/* ================================================= */}
      {/* İÇERİK */}
      {/* ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >

        <View
          style={
            styles.formCard
          }
        >

          <View
            style={
              styles.formIcon
            }
          >
            <Ionicons
              name="megaphone-outline"
              size={28}
              color="#16A34A"
            />
          </View>

          <Text
            style={
              styles.formTitle
            }
          >
            Duyuru Bilgileri
          </Text>

          {/* BAŞLIK */}

          <Text
            style={styles.label}
          >
            Başlık *
          </Text>

          <TextInput
            value={title}
            onChangeText={
              setTitle
            }
            placeholder="Örn. Bahar Şenliği Duyurusu"
            placeholderTextColor="#94A3B8"
            style={
              styles.input
            }
            editable={!saving}
            maxLength={150}
          />

          {/* İÇERİK */}

          <Text
            style={styles.label}
          >
            İçerik *
          </Text>

          <TextInput
            value={content}
            onChangeText={
              setContent
            }
            placeholder="Duyuru içeriğini yazın..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
            ]}
            editable={!saving}
            maxLength={2000}
          />

        </View>

        {/* BİLGİ */}

        <View
          style={
            styles.infoCard
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#2563EB"
          />

          <Text
            style={
              styles.infoText
            }
          >
            Bu duyuru sistemde
            kayıt altına
            alınacaktır.
          </Text>
        </View>

        {/* KAYDET */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving}
          onPress={
            handleCreate
          }
          style={[
            styles.createButton,
            saving &&
              styles.disabledButton,
          ]}
        >
          {saving ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.buttonText
                }
              >
                Yayınlanıyor...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="megaphone-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.buttonText
                }
              >
                Duyuruyu Yayınla
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View
          style={
            styles.bottomSpacing
          }
        />

      </ScrollView>

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingTop: 18,
      paddingBottom: 30,
    },

    successToast: {
      position: "absolute",
      top: 74,
      left: 20,
      right: 20,
      zIndex: 999,
      minHeight: 58,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 6,
      borderWidth: 1,
      borderColor: "#DCFCE7",
    },

    successIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor:
        "#DCFCE7",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    successText: {
      flex: 1,
      color: "#166534",
      fontSize: 13,
      fontWeight: "700",
    },

    header: {
      height: 64,
      paddingHorizontal: 20,
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
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
    },

    headerTitle: {
      color: "#0F172A",
      fontSize: 17,
      fontWeight: "800",
    },

    headerSpacer: {
      width: 42,
    },

    formCard: {
      marginHorizontal: 20,
      padding: 20,
      borderRadius: 22,
      backgroundColor:
        "#FFFFFF",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },

    formIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor:
        "#F0FDF4",
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "center",
      marginBottom: 15,
    },

    formTitle: {
      color: "#0F172A",
      fontSize: 19,
      fontWeight: "800",
      marginBottom: 12,
    },

    label: {
      color: "#334155",
      fontSize: 12,
      fontWeight: "700",
      marginTop: 16,
      marginBottom: 7,
    },

    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      borderRadius: 14,
      paddingHorizontal: 14,
      color: "#0F172A",
      backgroundColor:
        "#F8FAFC",
      fontSize: 14,
    },

    textArea: {
      minHeight: 180,
      paddingTop: 14,
    },

    infoCard: {
      marginHorizontal: 20,
      marginTop: 18,
      padding: 15,
      borderRadius: 16,
      backgroundColor:
        "#EFF6FF",
      flexDirection: "row",
      alignItems: "center",
    },

    infoText: {
      flex: 1,
      marginLeft: 10,
      color: "#475569",
      fontSize: 12,
      lineHeight: 18,
    },

    createButton: {
      height: 55,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 17,
      backgroundColor:
        "#16A34A",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    disabledButton: {
      opacity: 0.65,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
      marginLeft: 8,
    },

    bottomSpacing: {
      height: 30,
    },
  });
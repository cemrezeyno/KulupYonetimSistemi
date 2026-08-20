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

export default function AdminCreateNotificationScreen({
  navigation,
  route,
}) {
  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    notificationType,
    setNotificationType,
  ] = useState("Genel");

  const [loading, setLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
   * =====================================================
   * BAŞARI MESAJINDAN SONRA DÖNÜLECEK EKRAN
   *
   * Admin:
   * AdminNotifications
   *
   * Kulüp Başkanı:
   * ClubPresidentNotifications
   *
   * Eğer parametre gönderilmezse admin ekranı kullanılır.
   * =====================================================
   */

  const returnScreen =
    route?.params?.returnScreen ||
    "AdminNotifications";

  /*
   * =====================================================
   * BAŞARI MESAJI
   * =====================================================
   */

  const showSuccessMessage = () => {
    setSuccessMessage(
      "Bildirim başarıyla oluşturuldu."
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
   * BİLDİRİM OLUŞTUR
   * =====================================================
   */

  const handleCreate = async () => {
    if (loading) {
      return;
    }

    /*
     * BAŞLIK
     */

    if (!title.trim()) {
      Alert.alert(
        "Eksik Bilgi",
        "Bildirim başlığı zorunludur."
      );

      return;
    }

    /*
     * MESAJ
     */

    if (!message.trim()) {
      Alert.alert(
        "Eksik Bilgi",
        "Bildirim mesajı zorunludur."
      );

      return;
    }

    try {
      setLoading(true);

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
          "Oturum bulunamadı."
        );
      }

      /*
       * =================================================
       * USERS KAYDI
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
       * BİLDİRİM OLUŞTUR
       *
       * Mevcut veritabanı yapısını değiştirmiyoruz.
       * =================================================
       */

      const {
        data,
        error,
      } =
        await supabase
          .from("notifications")
          .insert({
  title: title.trim(),

  message: message.trim(),

  notification_type:
    notificationType.trim() || "Genel",

  is_read: false,

  /*
   * Bildirimin gönderildiği kullanıcı
   */
  user_id: currentUser.id,

  /*
   * Bildirimi oluşturan kullanıcı
   */
  created_by: currentUser.id,
})
          .select()
          .single();

      if (error) {
        throw error;
      }

      console.log(
        "Oluşturulan bildirim:",
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
        "CREATE NOTIFICATION ERROR:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Bildirim oluşturulamadı."
      );
    } finally {
      setLoading(false);
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
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
          disabled={loading}
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
          Yeni Bildirim
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
              styles.iconContainer
            }
          >
            <Ionicons
              name="notifications-outline"
              size={28}
              color="#2563EB"
            />
          </View>

          <Text
            style={
              styles.formTitle
            }
          >
            Bildirim Oluştur
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
            placeholder="Bildirim başlığı"
            placeholderTextColor="#94A3B8"
            style={
              styles.input
            }
            editable={!loading}
            maxLength={150}
          />

          {/* MESAJ */}

          <Text
            style={styles.label}
          >
            Mesaj *
          </Text>

          <TextInput
            value={message}
            onChangeText={
              setMessage
            }
            placeholder="Bildirim mesajını yazın..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
            ]}
            editable={!loading}
            maxLength={1000}
          />

          {/* BİLDİRİM TÜRÜ */}

          <Text
            style={styles.label}
          >
            Bildirim Türü
          </Text>

          <TextInput
            value={
              notificationType
            }
            onChangeText={
              setNotificationType
            }
            placeholder="Genel"
            placeholderTextColor="#94A3B8"
            style={
              styles.input
            }
            editable={!loading}
            maxLength={50}
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
            Bildirim oluşturulduğunda
            sistemde kayıt altına
            alınacaktır.
          </Text>
        </View>

        {/* OLUŞTUR */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading}
          onPress={
            handleCreate
          }
          style={[
            styles.createButton,
            loading &&
              styles.disabledButton,
          ]}
        >
          {loading ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                Oluşturuluyor...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="send-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.createButtonText
                }
              >
                Bildirimi Oluştur
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

    iconContainer: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor:
        "#EFF6FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 15,
    },

    formTitle: {
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 20,
    },

    label: {
      color: "#334155",
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 7,
      marginTop: 14,
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
      minHeight: 150,
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
        "#2563EB",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    disabledButton: {
      opacity: 0.6,
    },

    createButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
      marginLeft: 8,
    },

    bottomSpacing: {
      height: 30,
    },
  });
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

export default function AdminCreateClubScreen({
  navigation,
}) {
  const [
    clubName,
    setClubName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    address,
    setAddress,
  ] = useState("");

  const [
    logoUrl,
    setLogoUrl,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * =====================================================
   * KULÜP OLUŞTUR
   * =====================================================
   */

  const handleCreateClub =
    async () => {
      if (loading) {
        return;
      }

      /*
       * KULÜP ADI
       */

      if (!clubName.trim()) {
        Alert.alert(
          "Eksik Bilgi",
          "Kulüp adı zorunludur."
        );

        return;
      }

      try {
        setLoading(true);

        /*
         * =================================================
         * SESSION
         * =================================================
         */

        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const session =
          sessionData?.session;

        if (!session) {
          throw new Error(
            "Aktif kullanıcı oturumu bulunamadı."
          );
        }

        /*
         * =================================================
         * KULÜP OLUŞTUR
         * =================================================
         */

        const {
          data,
          error,
        } = await supabase
          .from("club")
          .insert({
            club_name:
              clubName.trim(),

            description:
              description.trim() ||
              null,

            logo_url:
              logoUrl.trim() ||
              null,

            email:
              email.trim() ||
              null,

            phone:
              phone.trim() ||
              null,

            address:
              address.trim() ||
              null,
          })
          .select()
          .single();

        if (error) {
          console.error(
            "CREATE CLUB ERROR:",
            error
          );

          throw error;
        }

        console.log(
          "Oluşturulan kulüp:",
          data
        );

        /*
         * =================================================
         * BAŞARILI
         * =================================================
         */

        Alert.alert(
          "Başarılı",
          "Kulüp başarıyla oluşturuldu.",
          [
            {
              text: "Tamam",
              onPress: () => {
                navigation.replace(
                  "AdminClubs"
                );
              },
            },
          ]
        );
      } catch (error) {
        console.error(
          "Admin create club error:",
          error
        );

        Alert.alert(
          "Hata",
          error?.message ||
            "Kulüp oluşturulamadı."
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
      {/* =================================================
          SABİT HEADER
      ================================================= */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Yeni Kulüp
        </Text>

        <View
          style={styles.headerSpacer}
        />
      </View>

      {/* =================================================
          KAYAN İÇERİK
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================
            FORM
        ================================================= */}

        <View
          style={styles.formCard}
        >
          <View
            style={styles.topIcon}
          >
            <Ionicons
              name="people-circle-outline"
              size={30}
              color="#7C3AED"
            />
          </View>

          <Text
            style={styles.formTitle}
          >
            Kulüp Bilgileri
          </Text>

          {/* KULÜP ADI */}

          <Text
            style={styles.label}
          >
            Kulüp Adı *
          </Text>

          <TextInput
            value={clubName}
            onChangeText={
              setClubName
            }
            placeholder="Örn. Yazılım Kulübü"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            editable={!loading}
            maxLength={150}
          />

          {/* AÇIKLAMA */}

          <Text
            style={styles.label}
          >
            Açıklama
          </Text>

          <TextInput
            value={description}
            onChangeText={
              setDescription
            }
            placeholder="Kulüp hakkında kısa açıklama"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
            ]}
            editable={!loading}
            maxLength={1000}
          />

          {/* EMAIL */}

          <Text
            style={styles.label}
          >
            E-posta
          </Text>

          <TextInput
            value={email}
            onChangeText={
              setEmail
            }
            placeholder="kulup@universite.edu.tr"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            editable={!loading}
            maxLength={150}
          />

          {/* TELEFON */}

          <Text
            style={styles.label}
          >
            Telefon
          </Text>

          <TextInput
            value={phone}
            onChangeText={
              setPhone
            }
            placeholder="05XX XXX XX XX"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            style={styles.input}
            editable={!loading}
            maxLength={20}
          />

          {/* ADRES */}

          <Text
            style={styles.label}
          >
            Adres
          </Text>

          <TextInput
            value={address}
            onChangeText={
              setAddress
            }
            placeholder="Kulüp adresi"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.smallTextArea,
            ]}
            editable={!loading}
            maxLength={500}
          />

          {/* LOGO URL */}

          <Text
            style={styles.label}
          >
            Logo URL
          </Text>

          <TextInput
            value={logoUrl}
            onChangeText={
              setLogoUrl
            }
            placeholder="https://..."
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={styles.input}
            editable={!loading}
            maxLength={500}
          />
        </View>

        {/* =================================================
            OLUŞTUR
        ================================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading}
          onPress={
            handleCreateClub
          }
          style={[
            styles.createButton,
            loading &&
              styles.disabledButton,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="add-circle-outline"
              size={22}
              color="#FFFFFF"
            />
          )}

          <Text
            style={
              styles.createButtonText
            }
          >
            {loading
              ? "Oluşturuluyor..."
              : "Kulübü Oluştur"}
          </Text>
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

/*
 * =====================================================
 * STYLES
 * =====================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingTop: 18,
    paddingBottom: 30,
  },

  /*
   * HEADER
   */

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

  /*
   * FORM
   */

  formCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 22,
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

  topIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    fontSize: 14,
  },

  textArea: {
    minHeight: 105,
    paddingTop: 14,
  },

  smallTextArea: {
    minHeight: 80,
    paddingTop: 14,
  },

  /*
   * BUTTON
   */

  createButton: {
    minHeight: 56,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 17,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 30,
  },
});
import React, { useState } from "react";

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

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../config/supabase";

export default function AdminEditAnnouncementScreen({
  route,
  navigation,
}) {
  const announcement = route?.params?.announcement;

  const [title, setTitle] = useState(
    announcement?.title || ""
  );

  const [content, setContent] = useState(
    announcement?.content || ""
  );

  const [saving, setSaving] = useState(false);

  /*
   * =====================================================
   * DUYURU GÜNCELLE
   * =====================================================
   */

  const handleUpdate = async () => {
    if (saving) {
      return;
    }

    if (!announcement?.id) {
      Alert.alert(
        "Hata",
        "Duyuru bilgisi bulunamadı."
      );
      return;
    }

    if (!title.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Duyuru başlığı zorunludur."
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Duyuru içeriği zorunludur."
      );
      return;
    }

    try {
      setSaving(true);

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!authData?.user?.id) {
        throw new Error(
          "Aktif kullanıcı bulunamadı."
        );
      }

      /*
       * Aktif kullanıcının users kaydını bul.
       */
      const {
        data: currentUser,
        error: userError,
      } = await supabase
        .from("users")
        .select("id, role_id")
        .eq(
          "auth_user_id",
          authData.user.id
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
       * Sadece Ana Admin düzenleyebilir.
       */
      if (currentUser.role_id !== 1) {
        throw new Error(
          "Bu işlemi yalnızca adminler yapabilir."
        );
      }

      /*
       * Güncelle.
       */
      const {
        error: updateError,
      } = await supabase
        .from("announcements")
        .update({
          title: title.trim(),
          content: content.trim(),
        })
        .eq(
          "id",
          announcement.id
        );

      if (updateError) {
        throw updateError;
      }

      Alert.alert(
        "Başarılı",
        "Duyuru başarıyla güncellendi.",
        [
          {
            text: "Tamam",
            onPress: () => {
              navigation.replace(
                "AdminAnnouncements"
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "UPDATE ANNOUNCEMENT ERROR:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Duyuru güncellenemedi."
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
            Duyuru Düzenle
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* FORM */}

        <View style={styles.formCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="megaphone-outline"
              size={28}
              color="#16A34A"
            />
          </View>

          <Text style={styles.formTitle}>
            Duyuru Bilgileri
          </Text>

          {/* BAŞLIK */}

          <Text style={styles.label}>
            Başlık *
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Duyuru başlığı"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            editable={!saving}
          />

          {/* İÇERİK */}

          <Text style={styles.label}>
            İçerik *
          </Text>

          <TextInput
            value={content}
            onChangeText={setContent}
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
          />
        </View>

        {/* BİLGİ */}

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            Değişiklikler kaydedildiğinde
            duyurunun mevcut içeriği
            güncellenecektir.
          </Text>
        </View>

        {/* KAYDET */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving}
          onPress={handleUpdate}
          style={[
            styles.button,
            saving && styles.disabledButton,
          ]}
        >
          {saving ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                Kaydediliyor...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.buttonText}>
                Değişiklikleri Kaydet
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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

  formCard: {
    margin: 20,
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

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
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
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    fontSize: 14,
  },

  textArea: {
    minHeight: 180,
    paddingTop: 14,
  },

  infoCard: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
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

  button: {
    height: 55,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 17,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
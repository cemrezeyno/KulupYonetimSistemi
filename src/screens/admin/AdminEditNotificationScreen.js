import React, {
  useEffect,
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

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../config/supabase";

export default function AdminEditNotificationScreen({
  route,
  navigation,
}) {
  const { notification } =
    route.params;

  const [title, setTitle] =
    useState(
      notification?.title || ""
    );

  const [message, setMessage] =
    useState(
      notification?.message || ""
    );

  const [saving, setSaving] =
    useState(false);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Başlık zorunludur."
      );
      return;
    }

    if (!message.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Mesaj zorunludur."
      );
      return;
    }

    try {
      setSaving(true);

      const { error } =
        await supabase
          .from("notifications")
          .update({
            title: title.trim(),
            message: message.trim(),
          })
          .eq(
            "id",
            notification.id
          );

      if (error) {
        throw error;
      }

      Alert.alert(
        "Başarılı",
        "Bildirim güncellendi.",
        [
          {
            text: "Tamam",
            onPress: () =>
              navigation.navigate(
                "AdminNotifications"
              ),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Update notification:",
        error
      );

      Alert.alert(
        "Hata",
        error.message ||
          "Bildirim güncellenemedi."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButton
            }
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
            Bildirim Düzenle
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <View
          style={styles.formCard}
        >
          <View
            style={styles.icon}
          >
            <Ionicons
              name="notifications-outline"
              size={28}
              color="#2563EB"
            />
          </View>

          <Text
            style={styles.formTitle}
          >
            Bildirim Bilgileri
          </Text>

          <Text style={styles.label}>
            Başlık
          </Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            editable={!saving}
          />

          <Text style={styles.label}>
            Mesaj
          </Text>

          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
            ]}
            editable={!saving}
          />
        </View>

        <TouchableOpacity
          disabled={saving}
          onPress={handleUpdate}
          style={styles.button}
        >
          {saving ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.buttonText
                }
              >
                Değişiklikleri Kaydet
              </Text>
            </>
          )}
        </TouchableOpacity>
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
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerSpacer: {
    width: 42,
  },

  formCard: {
    margin: 20,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  icon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 15,
  },

  formTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginTop: 16,
    marginBottom: 7,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    color: "#0F172A",
  },

  textArea: {
    minHeight: 160,
    paddingTop: 14,
  },

  button: {
    height: 55,
    marginHorizontal: 20,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    marginLeft: 8,
  },
});
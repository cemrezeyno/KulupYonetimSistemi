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
  ActivityIndicator,
  Alert,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import {
  getProfile,
  updateProfile,
} from "../../services/profileService";

import Colors from "../../theme/colors";

export default function EditProfileScreen({
  navigation,
}) {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [faculty, setFaculty] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [classYear, setClassYear] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data =
        await getProfile();

      const profile =
        data.profile;

      setFirstName(
        profile.first_name || ""
      );

      setLastName(
        profile.last_name || ""
      );

      setFaculty(
        profile.faculty || ""
      );

      setDepartment(
        profile.department || ""
      );

      setClassYear(
        profile.class_year
          ? String(profile.class_year)
          : ""
      );
    } catch (error) {
      console.error(
        "EditProfileScreen load error:",
        error
      );

      Alert.alert(
        "Hata",
        "Profil bilgileri alınamadı."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) {
      return;
    }

    if (!firstName.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Ad alanını doldurmalısın."
      );
      return;
    }

    if (!lastName.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Soyad alanını doldurmalısın."
      );
      return;
    }

    if (!faculty.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Fakülte alanını doldurmalısın."
      );
      return;
    }

    if (!department.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Bölüm alanını doldurmalısın."
      );
      return;
    }

    if (!classYear.trim()) {
      Alert.alert(
        "Eksik bilgi",
        "Sınıf alanını doldurmalısın."
      );
      return;
    }

    const parsedClassYear =
      Number(classYear);

    if (
      !Number.isInteger(
        parsedClassYear
      ) ||
      parsedClassYear < 1 ||
      parsedClassYear > 6
    ) {
      Alert.alert(
        "Geçersiz sınıf",
        "Sınıf bilgisi 1 ile 6 arasında olmalıdır."
      );
      return;
    }

    try {
      setSaving(true);

      await updateProfile({
        first_name:
          firstName.trim(),

        last_name:
          lastName.trim(),

        faculty:
          faculty.trim(),

        department:
          department.trim(),

        class_year:
          parsedClassYear,
      });

      Alert.alert(
        "Başarılı",
        "Profil bilgileriniz güncellendi.",
        [
          {
            text: "Tamam",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        "EditProfileScreen save error:",
        error
      );

      Alert.alert(
        "Hata",
        error.message ||
          "Profil güncellenirken bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleCancel}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Profil Bilgilerim
          </Text>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* Bilgi */}
        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color="#2563EB"
          />

          <Text style={styles.infoText}>
            Profil bilgilerinizde yapmak
            istediğiniz değişiklikleri
            aşağıdaki alanlardan
            güncelleyebilirsiniz.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          <ProfileInput
            label="Ad"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Adınızı girin"
            icon="person-outline"
          />

          <ProfileInput
            label="Soyad"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Soyadınızı girin"
            icon="person-outline"
          />

          <ProfileInput
            label="Fakülte"
            value={faculty}
            onChangeText={setFaculty}
            placeholder="Fakültenizi girin"
            icon="school-outline"
          />

          <ProfileInput
            label="Bölüm"
            value={department}
            onChangeText={setDepartment}
            placeholder="Bölümünüzü girin"
            icon="book-outline"
          />

          <ProfileInput
            label="Sınıf"
            value={classYear}
            onChangeText={setClassYear}
            placeholder="Örn. 3"
            icon="calendar-outline"
            keyboardType="numeric"
            maxLength={1}
            last
          />
        </View>

        {/* Kaydet */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving}
          onPress={handleSave}
          style={[
            styles.saveButton,
            saving &&
              styles.saveButtonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={styles.saveButtonText}
              >
                Değişiklikleri Kaydet
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Vazgeç */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={saving}
          onPress={handleCancel}
          style={styles.cancelButton}
        >
          <Ionicons
            name="close-circle-outline"
            size={20}
            color="#64748B"
          />

          <Text style={styles.cancelButtonText}>
            Değişiklik Yapmadan Çık
          </Text>
        </TouchableOpacity>

        <View
          style={styles.bottomSpacing}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType,
  maxLength,
  last = false,
}) {
  return (
    <View
      style={[
        styles.inputGroup,
        !last &&
          styles.inputGroupSpacing,
      ]}
    >
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name={icon}
          size={20}
          color="#64748B"
        />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          keyboardType={
            keyboardType || "default"
          }
          maxLength={maxLength}
          autoCapitalize="words"
        />
      </View>
    </View>
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
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
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

  infoBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 17,
    backgroundColor: "#EEF2FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
  },

  formCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 22,
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

  inputGroup: {
    width: "100%",
  },

  inputGroupSpacing: {
    marginBottom: 18,
  },

  inputLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },

  saveButton: {
    height: 54,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  cancelButton: {
    height: 52,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  bottomSpacing: {
    height: 30,
  },
});
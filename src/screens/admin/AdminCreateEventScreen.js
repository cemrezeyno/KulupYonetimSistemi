import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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

export default function AdminCreateEventScreen({
  navigation,
  route,
}) {
  const editEvent =
    route?.params?.editEvent || null;

  const isEditMode =
    !!editEvent;

  const [eventName, setEventName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [eventDate, setEventDate] =
    useState("");

  const [eventTime, setEventTime] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [
    maxParticipants,
    setMaxParticipants,
  ] = useState("");

  const [clubs, setClubs] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [
    selectedClubId,
    setSelectedClubId,
  ] = useState(null);

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const formatDateForInput = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const text =
      String(value).split("T")[0];

    const match =
      text.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      );

    if (!match) {
      return text;
    }

    const year = match[1];
    const month = match[2];
    const day = match[3];

    return `${day}-${month}-${year}`;
  };

  const formatDateForDatabase = (
    value
  ) => {
    const text =
      value.trim();

    if (!text) {
      return null;
    }

    const dashFormat =
      /^(\d{2})-(\d{2})-(\d{4})$/;

    const dashMatch =
      text.match(dashFormat);

    if (dashMatch) {
      const day =
        dashMatch[1];

      const month =
        dashMatch[2];

      const year =
        dashMatch[3];

      return `${year}-${month}-${day}`;
    }

    const dotFormat =
      /^(\d{2})\.(\d{2})\.(\d{4})$/;

    const dotMatch =
      text.match(dotFormat);

    if (dotMatch) {
      const day =
        dotMatch[1];

      const month =
        dotMatch[2];

      const year =
        dotMatch[3];

      return `${year}-${month}-${day}`;
    }

    const isoFormat =
      /^\d{4}-\d{2}-\d{2}$/;

    if (
      isoFormat.test(text)
    ) {
      return text;
    }

    return null;
  };

  const formatTimeForInput = (
    value
  ) => {
    if (!value) {
      return "";
    }

    return String(value)
      .slice(0, 5);
  };

  const showSuccessMessage = (
    message,
    shouldGoBack = true
  ) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");

      if (shouldGoBack) {
        navigation.goBack();
      }
    }, 5000);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const authUser =
        sessionData?.session?.user;

      if (!authUser?.id) {
        throw new Error(
          "Kullanıcı oturumu bulunamadı."
        );
      }

      /*
       * =====================================================
       * AKTİF KULLANICI
       * =====================================================
       */

      const {
        data: currentUser,
        error: userError,
      } = await supabase
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

      /*
       * =====================================================
       * KULÜPLER
       *
       * Admin (role_id = 1):
       * Bütün kulüpleri görür.
       *
       * Kulüp Başkanı (role_id = 3):
       * Sadece başkanı olduğu kulübü görür.
       * =====================================================
       */

      let clubsQuery;

      if (
        currentUser?.role_id === 3
      ) {
        clubsQuery = supabase
          .from("club")
          .select(
            "id, club_name"
          )
          .eq(
            "president_id",
            currentUser.id
          )
          .order(
            "club_name",
            {
              ascending: true,
            }
          );
      } else {
        clubsQuery = supabase
          .from("club")
          .select(
            "id, club_name"
          )
          .order(
            "club_name",
            {
              ascending: true,
            }
          );
      }

      const [
        clubsResult,
        categoriesResult,
      ] = await Promise.all([
        clubsQuery,

        supabase
          .from(
            "event_categories"
          )
          .select(
            "id, category_name"
          )
          .order(
            "category_name",
            {
              ascending: true,
            }
          ),
      ]);

      if (clubsResult.error) {
        throw clubsResult.error;
      }

      if (categoriesResult.error) {
        throw categoriesResult.error;
      }

      const clubData =
        clubsResult.data || [];

      const categoryData =
        categoriesResult.data || [];

      setClubs(
        clubData
      );

      setCategories(
        categoryData
      );

      /*
       * =====================================================
       * KULÜP BAŞKANI İÇİN KULÜBÜ OTOMATİK SEÇ
       * =====================================================
       */

      if (
        currentUser?.role_id === 3 &&
        !editEvent
      ) {
        if (
          clubData.length === 1
        ) {
          setSelectedClubId(
            clubData[0].id
          );
        }
      }

      /*
       * =====================================================
       * DÜZENLEME MODU
       * =====================================================
       */

      if (editEvent) {
        setEventName(
          editEvent.event_name ||
            editEvent.title ||
            ""
        );

        setDescription(
          editEvent.description ||
            ""
        );

        setEventDate(
          formatDateForInput(
            editEvent.event_date
          )
        );

        setEventTime(
          formatTimeForInput(
            editEvent.event_time
          )
        );

        setLocation(
          editEvent.location ||
            ""
        );

        setMaxParticipants(
          editEvent.max_participants
            ? String(
                editEvent.max_participants
              )
            : ""
        );

        setSelectedClubId(
          editEvent.club_id ||
            null
        );

        setSelectedCategoryId(
          editEvent.category_id ||
            null
        );
      }
    } catch (error) {
      console.error(
        "Create/Edit event data error:",
        error
      );

      Alert.alert(
        "Hata",
        error.message ||
          "Kulüp ve kategori bilgileri yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveEvent =
    async () => {
      if (saving) {
        return;
      }

      if (!eventName.trim()) {
        Alert.alert(
          "Eksik Bilgi",
          "Lütfen etkinlik adı girin."
        );

        return;
      }

      if (!selectedClubId) {
        Alert.alert(
          "Eksik Bilgi",
          "Lütfen bir kulüp seçin."
        );

        return;
      }

      if (!selectedCategoryId) {
        Alert.alert(
          "Eksik Bilgi",
          "Lütfen bir kategori seçin."
        );

        return;
      }

      let finalDate =
        null;

      if (
        eventDate.trim()
      ) {
        finalDate =
          formatDateForDatabase(
            eventDate
          );

        if (!finalDate) {
          Alert.alert(
            "Hatalı Tarih",
            "Tarihi 28-08-2026 veya 2026-08-28 şeklinde girin."
          );

          return;
        }
      }

      let finalTime =
        null;

      if (
        eventTime.trim()
      ) {
        const timeText =
          eventTime.trim();

        const timeRegex =
          /^([01]\d|2[0-3]):([0-5]\d)$/;

        if (
          !timeRegex.test(
            timeText
          )
        ) {
          Alert.alert(
            "Hatalı Saat",
            "Saati 14:30 şeklinde girin."
          );

          return;
        }

        finalTime =
          `${timeText}:00`;
      }

      let parsedMaxParticipants =
        null;

      if (
        maxParticipants.trim()
      ) {
        parsedMaxParticipants =
          Number(
            maxParticipants
          );

        if (
          Number.isNaN(
            parsedMaxParticipants
          ) ||
          parsedMaxParticipants <= 0
        ) {
          Alert.alert(
            "Hatalı Bilgi",
            "Maksimum katılımcı sayısını doğru girin."
          );

          return;
        }
      }

      try {
        setSaving(true);

        /*
         * =====================================================
         * ETKİNLİK DÜZENLE
         * =====================================================
         */

        if (
          isEditMode &&
          editEvent?.id
        ) {
          const {
            data: updatedEvent,
            error: updateError,
          } = await supabase
            .from("events")
            .update({
              title:
                eventName.trim(),

              event_name:
                eventName.trim(),

              description:
                description.trim() ||
                null,

              event_date:
                finalDate,

              event_time:
                finalTime,

              location:
                location.trim() ||
                null,

              club_id:
                selectedClubId,

              max_participants:
                parsedMaxParticipants,

              category_id:
                selectedCategoryId,
            })
            .eq(
              "id",
              editEvent.id
            )
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          console.log(
            "Güncellenen etkinlik:",
            updatedEvent
          );

          showSuccessMessage(
            "Etkinlik başarıyla güncellendi."
          );

          return;
        }

        /*
         * =====================================================
         * AUTH KULLANICISI
         * =====================================================
         */

        const {
          data: sessionData,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const authUser =
          sessionData
            ?.session
            ?.user;

        if (!authUser?.id) {
          throw new Error(
            "Kullanıcı oturumu bulunamadı."
          );
        }

        /*
         * =====================================================
         * USERS KAYDI
         * =====================================================
         */

        const {
          data: currentUser,
          error: userError,
        } = await supabase
          .from("users")
          .select("id")
          .eq(
            "auth_user_id",
            authUser.id
          )
          .single();

        if (userError) {
          throw userError;
        }

        if (!currentUser?.id) {
          throw new Error(
            "Kullanıcı profili bulunamadı."
          );
        }

        /*
         * =====================================================
         * ETKİNLİK OLUŞTUR
         * =====================================================
         */

        const {
          data: createdEvent,
          error: createError,
        } = await supabase
          .from("events")
          .insert({
            title:
              eventName.trim(),

            event_name:
              eventName.trim(),

            description:
              description.trim() ||
              null,

            event_date:
              finalDate,

            event_time:
              finalTime,

            location:
              location.trim() ||
              null,

            club_id:
              selectedClubId,

            max_participants:
              parsedMaxParticipants,

            is_active:
              true,

            category_id:
              selectedCategoryId,

            created_by:
              currentUser.id,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        console.log(
          "Oluşturulan etkinlik:",
          createdEvent
        );

        showSuccessMessage(
          "Etkinlik başarıyla oluşturuldu."
        );
      } catch (error) {
        console.error(
          "Save event error:",
          error
        );

        Alert.alert(
          "Hata",
          error.message ||
            "Etkinlik kaydedilemedi."
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Bilgiler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >

      {/* BAŞARI MESAJI */}

      {successMessage ? (
        <View
          style={styles.successToast}
        >
          <View
            style={styles.successIcon}
          >
            <Ionicons
              name="checkmark"
              size={18}
              color="#16A34A"
            />
          </View>

          <Text
            style={styles.successText}
          >
            {successMessage}
          </Text>
        </View>
      ) : null}

      {/* HEADER */}

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
          {isEditMode
            ? "Etkinliği Düzenle"
            : "Yeni Etkinlik"}
        </Text>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      {/* İÇERİK */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >

        <Text
          style={styles.sectionTitle}
        >
          Etkinlik Bilgileri
        </Text>

        <View
          style={styles.card}
        >

          <Text
            style={styles.label}
          >
            Etkinlik Adı *
          </Text>

          <TextInput
            value={eventName}
            onChangeText={
              setEventName
            }
            placeholder="Etkinlik adını girin"
            placeholderTextColor="#94A3B8"
            style={
              styles.input
            }
          />

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
            placeholder="Etkinlik açıklaması"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.input,
              styles.textArea,
            ]}
          />

          <Text
            style={styles.label}
          >
            Konum
          </Text>

          <TextInput
            value={location}
            onChangeText={
              setLocation
            }
            placeholder="Etkinlik konumu"
            placeholderTextColor="#94A3B8"
            style={
              styles.input
            }
          />

          <Text
            style={styles.label}
          >
            Tarih
          </Text>

          <TextInput
            value={eventDate}
            onChangeText={
              setEventDate
            }
            placeholder="Örn: 28-08-2026"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
            style={
              styles.input
            }
          />

          <Text
            style={styles.label}
          >
            Saat
          </Text>

          <TextInput
            value={eventTime}
            onChangeText={
              setEventTime
            }
            placeholder="Örn: 14:30"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
            style={
              styles.input
            }
          />

          <Text
            style={styles.label}
          >
            Maksimum Katılımcı
          </Text>

          <TextInput
            value={
              maxParticipants
            }
            onChangeText={
              setMaxParticipants
            }
            placeholder="Örn: 100"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            style={
              styles.input
            }
          />

        </View>

        <Text
          style={styles.sectionTitle}
        >
          Kulüp Seç
        </Text>

        <View
          style={styles.optionList}
        >
          {clubs.map(
            (club) => {
              const selected =
                selectedClubId ===
                club.id;

              return (
                <TouchableOpacity
                  key={
                    club.id
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    setSelectedClubId(
                      club.id
                    )
                  }
                  style={[
                    styles.optionCard,
                    selected &&
                      styles.selectedOption,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      selected &&
                        styles.selectedOptionIcon,
                    ]}
                  >
                    <Ionicons
                      name="people"
                      size={20}
                      color={
                        selected
                          ? "#FFFFFF"
                          : "#7C3AED"
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.optionText
                    }
                  >
                    {
                      club.club_name
                    }
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#16A34A"
                    />
                  )}
                </TouchableOpacity>
              );
            }
          )}
        </View>

        <Text
          style={styles.sectionTitle}
        >
          Kategori Seç
        </Text>

        <View
          style={styles.optionList}
        >
          {categories.map(
            (category) => {
              const selected =
                selectedCategoryId ===
                category.id;

              return (
                <TouchableOpacity
                  key={
                    category.id
                  }
                  activeOpacity={0.8}
                  onPress={() =>
                    setSelectedCategoryId(
                      category.id
                    )
                  }
                  style={[
                    styles.optionCard,
                    selected &&
                      styles.selectedOption,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      selected &&
                        styles.selectedCategoryIcon,
                    ]}
                  >
                    <Ionicons
                      name="pricetag"
                      size={20}
                      color={
                        selected
                          ? "#FFFFFF"
                          : "#F59E0B"
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.optionText
                    }
                  >
                    {
                      category.category_name
                    }
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={23}
                      color="#16A34A"
                    />
                  )}
                </TouchableOpacity>
              );
            }
          )}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving}
          onPress={
            handleSaveEvent
          }
          style={[
            styles.createButton,
            saving &&
              styles.disabledButton,
          ]}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name={
                isEditMode
                  ? "save-outline"
                  : "checkmark-circle-outline"
              }
              size={22}
              color="#FFFFFF"
            />
          )}

          <Text
            style={
              styles.createButtonText
            }
          >
            {saving
              ? "Kaydediliyor..."
              : isEditMode
              ? "Değişiklikleri Kaydet"
              : "Etkinlik Oluştur"}
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

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    content: {
      paddingBottom: 30,
    },

    loadingContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      color: "#64748B",
      fontSize: 13,
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
      backgroundColor: "#DCFCE7",
      alignItems: "center",
      justifyContent: "center",
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
      flexDirection:
        "row",
      alignItems:
        "center",
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
      alignItems:
        "center",
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

    sectionTitle: {
      marginHorizontal: 20,
      marginTop: 25,
      marginBottom: 13,
      color: "#0F172A",
      fontSize: 19,
      fontWeight: "800",
    },

    card: {
      marginHorizontal: 20,
      padding: 18,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
    },

    label: {
      color: "#334155",
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 7,
      marginTop: 12,
    },

    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      borderRadius: 13,
      paddingHorizontal: 14,
      color: "#0F172A",
      fontSize: 13,
      backgroundColor:
        "#F8FAFC",
    },

    textArea: {
      minHeight: 100,
      paddingTop: 14,
    },

    optionList: {
      marginHorizontal: 20,
    },

    optionCard: {
      minHeight: 64,
      marginBottom: 10,
      padding: 10,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    selectedOption: {
      borderColor:
        "#C7D2FE",
      backgroundColor:
        "#F8FAFF",
    },

    optionIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#F5F3FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    selectedOptionIcon: {
      backgroundColor:
        "#7C3AED",
    },

    selectedCategoryIcon: {
      backgroundColor:
        "#F59E0B",
    },

    optionText: {
      flex: 1,
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "700",
    },

    createButton: {
      marginHorizontal: 20,
      marginTop: 25,
      minHeight: 55,
      borderRadius: 17,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 9,
    },

    disabledButton: {
      opacity: 0.6,
    },

    createButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    bottomSpacing: {
      height: 30,
    },
  });
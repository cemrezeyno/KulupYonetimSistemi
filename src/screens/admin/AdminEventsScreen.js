import React, {
  useCallback,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  supabase,
} from "../../config/supabase";


export default function AdminEventsScreen({
  navigation,
}) {

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  /*
   * =====================================================
   * ETKİNLİKLERİ YÜKLE
   * =====================================================
   */

  const loadEvents = async (
    showLoading = false
  ) => {

    try {

      if (showLoading) {
        setLoading(true);
      }


      /*
       * =================================================
       * 1. OTURUM AÇMIŞ KULLANICI
       * =================================================
       */

      const {
        data: {
          user: authUser,
        },
        error: authError,
      } =
        await supabase.auth.getUser();


      if (authError) {
        throw authError;
      }


      if (!authUser) {
        throw new Error(
          "Oturum açmış kullanıcı bulunamadı."
        );
      }


      /*
       * =================================================
       * 2. USERS TABLOSUNDAN KULLANICI PROFİLİ
       * =================================================
       *
       * auth_user_id üzerinden kullanıcıyı buluyoruz.
       *
       * role_id:
       *
       * 1 = Admin
       * 3 = ClubPresident
       *
       */

      const {
        data: currentUser,
        error: userError,
      } =
        await supabase
          .from("users")
          .select(`
            id,
            auth_user_id,
            role_id
          `)
          .eq(
            "auth_user_id",
            authUser.id
          )
          .maybeSingle();


      if (userError) {
        throw userError;
      }


      if (!currentUser) {
        throw new Error(
          "Kullanıcı profili bulunamadı."
        );
      }


      console.log(
        "AdminEventsScreen user:",
        currentUser
      );


      /*
       * =================================================
       * 3. KULLANICININ ROLÜNE GÖRE KULÜP FİLTRESİ
       * =================================================
       */

      let allowedClubIds =
        null;


      /*
       * =================================================
       * ADMIN
       *
       * role_id = 1
       *
       * Admin bütün kulüplerin etkinliklerini görebilir.
       * =================================================
       */

      if (
        currentUser.role_id === 1
      ) {

        console.log(
          "AdminEventsScreen: ADMIN - tüm etkinlikler gösterilecek."
        );

        allowedClubIds =
          null;
      }


      /*
       * =================================================
       * KULÜP BAŞKANI
       *
       * role_id = 3
       *
       * Sadece başkanı olduğu kulübün etkinliklerini
       * görebilir.
       * =================================================
       */

      else if (
        currentUser.role_id === 3
      ) {

        console.log(
          "AdminEventsScreen: CLUB PRESIDENT - kulüp filtreleniyor."
        );


        /*
         * Başkanın başkanı olduğu kulüpleri bul.
         *
         * club.president_id =
         * users.id
         */

        const {
          data: managedClubs,
          error: clubError,
        } =
          await supabase
            .from("club")
            .select(`
              id,
              club_name,
              president_id
            `)
            .eq(
              "president_id",
              currentUser.id
            );


        if (clubError) {
          throw clubError;
        }


        /*
         * Başkanın yönettiği kulüpler.
         */

        allowedClubIds =
          (managedClubs || [])
            .map(
              (club) =>
                club.id
            )
            .filter(Boolean);


        console.log(
          "Club President managed club IDs:",
          allowedClubIds
        );


        /*
         * Hiçbir kulübün başkanı değilse
         * etkinlik gösterme.
         */

        if (
          allowedClubIds.length === 0
        ) {

          setEvents([]);

          return;
        }
      }


      /*
       * =================================================
       * DİĞER ROLLER
       * =================================================
       */

      else {

        console.log(
          "AdminEventsScreen: yetkisiz rol."
        );

        setEvents([]);

        return;
      }


      /*
       * =================================================
       * 4. ETKİNLİKLER
       * =================================================
       *
       * Admin:
       *   bütün etkinlikler
       *
       * Başkan:
       *   sadece allowedClubIds içindeki etkinlikler
       *
       */

      let eventQuery =
        supabase
          .from("events")
          .select(`
            id,
            club_id,
            title,
            event_name,
            description,
            event_date,
            event_time,
            location,
            max_participants,
            is_active,
            category_id,
            created_by,
            created_at
          `)
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


      /*
       * =================================================
       * KULÜP BAŞKANI FİLTRESİ
       * =================================================
       */

      if (
        currentUser.role_id === 3 &&
        Array.isArray(
          allowedClubIds
        )
      ) {

        eventQuery =
          eventQuery.in(
            "club_id",
            allowedClubIds
          );
      }


      const {
        data: eventData,
        error: eventError,
      } =
        await eventQuery;


      if (eventError) {
        throw eventError;
      }


      const eventsData =
        eventData || [];


      /*
       * =================================================
       * 5. ETKİNLİKLERİN KULÜPLERİ
       * =================================================
       */

      const clubIds =
        eventsData
          .map(
            (event) =>
              event.club_id
          )
          .filter(Boolean);


      let clubs = [];


      if (
        clubIds.length > 0
      ) {

        const {
          data: clubData,
          error: clubError,
        } =
          await supabase
            .from("club")
            .select(
              "id, club_name"
            )
            .in(
              "id",
              clubIds
            );


        if (clubError) {
          throw clubError;
        }


        clubs =
          clubData || [];
      }


      /*
       * =================================================
       * 6. KATEGORİLER
       * =================================================
       */

      const categoryIds =
        eventsData
          .map(
            (event) =>
              event.category_id
          )
          .filter(Boolean);


      let categories = [];


      if (
        categoryIds.length > 0
      ) {

        const {
          data: categoryData,
          error: categoryError,
        } =
          await supabase
            .from(
              "event_categories"
            )
            .select(
              "id, category_name"
            )
            .in(
              "id",
              categoryIds
            );


        if (categoryError) {
          throw categoryError;
        }


        categories =
          categoryData || [];
      }


      /*
       * =================================================
       * 7. KATILIMCILAR
       * =================================================
       */

      const eventIds =
        eventsData.map(
          (event) =>
            event.id
        );


      let participants = [];


      if (
        eventIds.length > 0
      ) {

        const {
          data: participantData,
          error: participantError,
        } =
          await supabase
            .from(
              "event_participants"
            )
            .select(
              "event_id, user_id"
            )
            .in(
              "event_id",
              eventIds
            );


        if (
          participantError
        ) {
          throw participantError;
        }


        participants =
          participantData || [];
      }


      /*
       * =================================================
       * 8. CLUB MAP
       * =================================================
       */

      const clubMap = {};


      clubs.forEach(
        (club) => {

          clubMap[
            club.id
          ] = club;

        }
      );


      /*
       * =================================================
       * 9. CATEGORY MAP
       * =================================================
       */

      const categoryMap = {};


      categories.forEach(
        (category) => {

          categoryMap[
            category.id
          ] = category;

        }
      );


      /*
       * =================================================
       * 10. KATILIMCI SAYILARI
       * =================================================
       */

      const participantCount = {};


      participants.forEach(
        (participant) => {

          participantCount[
            participant.event_id
          ] =
            (
              participantCount[
                participant.event_id
              ] || 0
            ) + 1;

        }
      );


      /*
       * =================================================
       * 11. SON ETKİNLİK VERİSİ
       * =================================================
       */

      const mappedEvents =
        eventsData.map(
          (event) => ({

            ...event,

            display_name:
              event.event_name ||
              event.title ||
              "İsimsiz Etkinlik",

            club:
              clubMap[
                event.club_id
              ] || null,

            category:
              categoryMap[
                event.category_id
              ] || null,

            participant_count:
              participantCount[
                event.id
              ] || 0,

          })
        );


      setEvents(
        mappedEvents
      );


    } catch (error) {

      console.error(
        "Admin events error:",
        error
      );


      Alert.alert(
        "Hata",
        error.message ||
          "Etkinlikler yüklenemedi."
      );


    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  /*
   * =====================================================
   * EKRAN ODAKLANDIĞINDA YENİLE
   * =====================================================
   */

  useFocusEffect(
    useCallback(() => {

      loadEvents();

    }, [])
  );


  /*
   * =====================================================
   * YENİLE
   * =====================================================
   */

  const handleRefresh = () => {

    setRefreshing(true);

    loadEvents();

  };


  /*
   * =====================================================
   * TARİH FORMATLA
   * =====================================================
   */

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "Tarih yok";
    }


    try {

      return new Date(
        date
      ).toLocaleDateString(
        "tr-TR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

    } catch {

      return "Tarih yok";

    }
  };


  /*
   * =====================================================
   * SAAT FORMATLA
   * =====================================================
   */

  const formatTime = (
    time
  ) => {

    if (!time) {
      return "";
    }


    return String(
      time
    ).slice(
      0,
      5
    );

  };


  /*
   * =====================================================
   * DETAY EKRANINI BELİRLE
   * =====================================================
   */

  const getEventDetailScreen =
    () => {

      const state =
        navigation.getState();


      const routeNames =
        state?.routeNames || [];


      /*
       * Kulüp Başkanı
       */

      if (
        routeNames.includes(
          "ClubPresidentEventDetail"
        )
      ) {

        return "ClubPresidentEventDetail";

      }


      /*
       * Admin
       */

      if (
        routeNames.includes(
          "AdminEventDetail"
        )
      ) {

        return "AdminEventDetail";

      }


      return null;
    };


  /*
   * =====================================================
   * ETKİNLİK EKLEME EKRANINI BELİRLE
   * =====================================================
   */

  const getCreateEventScreen =
    () => {

      const state =
        navigation.getState();


      const routeNames =
        state?.routeNames || [];


      /*
       * Kulüp Başkanı
       */

      if (
        routeNames.includes(
          "ClubPresidentCreateEvent"
        )
      ) {

        return "ClubPresidentCreateEvent";

      }


      /*
       * Admin
       */

      if (
        routeNames.includes(
          "AdminCreateEvent"
        )
      ) {

        return "AdminCreateEvent";

      }


      return null;
    };


  /*
   * =====================================================
   * ETKİNLİK DETAYINA GİT
   * =====================================================
   */

  const handleEventPress = (
    event
  ) => {

    const detailScreen =
      getEventDetailScreen();


    console.log(
      "Event detail navigation:",
      detailScreen
    );


    if (!detailScreen) {

      Alert.alert(
        "Hata",
        "Etkinlik detay ekranı bulunamadı."
      );

      return;
    }


    navigation.navigate(
      detailScreen,
      {
        event,
      }
    );
  };


  /*
   * =====================================================
   * YENİ ETKİNLİK OLUŞTUR
   * =====================================================
   */

  const handleCreateEvent = () => {

    const createScreen =
      getCreateEventScreen();


    console.log(
      "Create event navigation:",
      createScreen
    );


    if (!createScreen) {

      Alert.alert(
        "Hata",
        "Etkinlik oluşturma ekranı bulunamadı."
      );

      return;
    }


    navigation.navigate(
      createScreen
    );
  };


  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {

    return (
      <SafeAreaView
        style={
          styles.container
        }
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
            Etkinlikler yükleniyor...
          </Text>

        </View>

      </SafeAreaView>
    );
  }


  /*
   * =====================================================
   * EKRAN
   * =====================================================
   */

  return (

    <SafeAreaView
      style={
        styles.container
      }
    >

      {/* ================================================= */}
      {/* SABİT HEADER */}
      {/* ================================================= */}

      <View
        style={
          styles.header
        }
      >

        {/* GERİ */}

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


        {/* BAŞLIK */}

        <View
          style={
            styles.headerContent
          }
        >

          <Text
            style={
              styles.title
            }
          >
            Etkinlik Yönetimi
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {events.length} etkinlik
          </Text>

        </View>


        {/* HEADER BUTONLARI */}

        <View
          style={
            styles.headerActions
          }
        >

          {/* ETKİNLİK EKLE */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              handleCreateEvent
            }
            style={
              styles.addButton
            }
          >

            <Ionicons
              name="add"
              size={21}
              color="#FFFFFF"
            />

          </TouchableOpacity>


          {/* YENİLE */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              handleRefresh
            }
            style={
              styles.refreshButton
            }
          >

            <Ionicons
              name="refresh"
              size={21}
              color="#2563EB"
            />

          </TouchableOpacity>

        </View>

      </View>


      {/* ================================================= */}
      {/* KAYAN İÇERİK */}
      {/* ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            colors={[
              "#2563EB",
            ]}
          />
        }
      >

        <Text
          style={
            styles.sectionTitle
          }
        >
          Etkinlikler
        </Text>


        {events.length > 0 ? (

          <View
            style={
              styles.eventList
            }
          >

            {events.map(
              (event) => (

                <TouchableOpacity
                  key={
                    event.id
                  }
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.eventCard
                  }
                  onPress={() =>
                    handleEventPress(
                      event
                    )
                  }
                >

                  {/* ETKİNLİK İKONU */}

                  <View
                    style={
                      styles.eventIcon
                    }
                  >

                    <Ionicons
                      name="calendar"
                      size={26}
                      color="#2563EB"
                    />

                  </View>


                  {/* ETKİNLİK İÇERİĞİ */}

                  <View
                    style={
                      styles.eventContent
                    }
                  >

                    <Text
                      style={
                        styles.eventName
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        event.display_name
                      }
                    </Text>


                    {/* KULÜP */}

                    <View
                      style={
                        styles.metaRow
                      }
                    >

                      <Ionicons
                        name="people-outline"
                        size={13}
                        color="#7C3AED"
                      />

                      <Text
                        style={
                          styles.metaText
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          event
                            .club
                            ?.club_name ||
                          "Kulüp belirtilmemiş"
                        }
                      </Text>

                    </View>


                    {/* KATEGORİ */}

                    <View
                      style={
                        styles.metaRow
                      }
                    >

                      <Ionicons
                        name="pricetag-outline"
                        size={13}
                        color="#F59E0B"
                      />

                      <Text
                        style={
                          styles.metaText
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          event
                            .category
                            ?.category_name ||
                          "Kategori belirtilmemiş"
                        }
                      </Text>

                    </View>


                    {/* TARİH */}

                    {event.event_date && (

                      <View
                        style={
                          styles.metaRow
                        }
                      >

                        <Ionicons
                          name="calendar-outline"
                          size={13}
                          color="#16A34A"
                        />

                        <Text
                          style={
                            styles.metaText
                          }
                        >

                          {formatDate(
                            event.event_date
                          )}

                          {event.event_time
                            ? ` • ${formatTime(
                                event.event_time
                              )}`
                            : ""}

                        </Text>

                      </View>

                    )}


                    {/* ALT SATIR */}

                    <View
                      style={
                        styles.bottomRow
                      }
                    >

                      {/* KATILIMCI */}

                      <View
                        style={
                          styles.participantInfo
                        }
                      >

                        <Ionicons
                          name="person-outline"
                          size={13}
                          color="#64748B"
                        />

                        <Text
                          style={
                            styles.participantText
                          }
                        >

                          {
                            event.participant_count
                          }

                          {event.max_participants
                            ? ` / ${event.max_participants}`
                            : ""}{" "}

                          katılımcı

                        </Text>

                      </View>


                      {/* DURUM */}

                      <View
                        style={[
                          styles.statusBadge,
                          event.is_active
                            ? styles.activeBadge
                            : styles.passiveBadge,
                        ]}
                      >

                        <View
                          style={[
                            styles.statusDot,
                            {
                              backgroundColor:
                                event.is_active
                                  ? "#16A34A"
                                  : "#94A3B8",
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                event.is_active
                                  ? "#16A34A"
                                  : "#64748B",
                            },
                          ]}
                        >

                          {event.is_active
                            ? "Aktif"
                            : "Pasif"}

                        </Text>

                      </View>

                    </View>


                    {/* OLUŞTURULMA TARİHİ */}

                    <Text
                      style={
                        styles.dateText
                      }
                    >

                      Oluşturulma:{" "}

                      {formatDate(
                        event.created_at
                      )}

                    </Text>

                  </View>


                  {/* SAĞ OK */}

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color="#CBD5E1"
                  />

                </TouchableOpacity>

              )
            )}

          </View>

        ) : (

          /* ================================================= */
          /* BOŞ DURUM */
          /* ================================================= */

          <View
            style={
              styles.emptyCard
            }
          >

            <View
              style={
                styles.emptyIcon
              }
            >

              <Ionicons
                name="calendar-outline"
                size={40}
                color="#94A3B8"
              />

            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Henüz etkinlik yok
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Kulüp yöneticileri
              tarafından
              oluşturulan
              etkinlikler burada
              görüntülenir.
            </Text>

          </View>

        )}


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
      justifyContent:
        "center",
      alignItems:
        "center",
    },


    loadingText: {
      marginTop: 12,
      color: "#64748B",
      fontSize: 13,
    },


    /*
     * HEADER
     */

    header: {
      minHeight: 78,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
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
      marginRight: 12,
    },


    headerContent: {
      flex: 1,
    },


    title: {
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
    },


    subtitle: {
      color: "#94A3B8",
      fontSize: 12,
      marginTop: 3,
    },


    headerActions: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 8,
    },


    addButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    refreshButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    /*
     * SECTION
     */

    sectionTitle: {
      marginHorizontal: 20,
      marginTop: 28,
      marginBottom: 14,
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
    },


    /*
     * EVENT LIST
     */

    eventList: {
      marginHorizontal: 20,
    },


    eventCard: {
      marginBottom: 14,
      padding: 15,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "flex-start",

      shadowColor:
        "#000",

      shadowOpacity:
        0.05,

      shadowRadius:
        10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 3,
    },


    eventIcon: {
      width: 55,
      height: 55,
      borderRadius: 17,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 13,
    },


    eventContent: {
      flex: 1,
      marginRight: 8,
    },


    eventName: {
      color: "#0F172A",
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 20,
      marginBottom: 7,
    },


    metaRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 4,
    },


    metaText: {
      flex: 1,
      color: "#64748B",
      fontSize: 11,
      marginLeft: 5,
    },


    bottomRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      marginTop: 5,
    },


    participantInfo: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },


    participantText: {
      color: "#64748B",
      fontSize: 10,
      marginLeft: 4,
    },


    statusBadge: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal: 7,
      paddingVertical: 4,
      borderRadius: 8,
    },


    activeBadge: {
      backgroundColor:
        "#F0FDF4",
    },


    passiveBadge: {
      backgroundColor:
        "#F8FAFC",
    },


    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 5,
    },


    statusText: {
      fontSize: 9,
      fontWeight: "800",
    },


    dateText: {
      color: "#94A3B8",
      fontSize: 9,
      marginTop: 6,
    },


    /*
     * EMPTY
     */

    emptyCard: {
      marginHorizontal: 20,
      paddingVertical: 45,
      paddingHorizontal: 25,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
    },


    emptyIcon: {
      width: 70,
      height: 70,
      borderRadius: 23,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },


    emptyTitle: {
      marginTop: 14,
      color: "#0F172A",
      fontSize: 17,
      fontWeight: "800",
    },


    emptyText: {
      marginTop: 7,
      color: "#94A3B8",
      fontSize: 13,
      lineHeight: 20,
      textAlign:
        "center",
    },


    bottomSpacing: {
      height: 30,
    },

  });
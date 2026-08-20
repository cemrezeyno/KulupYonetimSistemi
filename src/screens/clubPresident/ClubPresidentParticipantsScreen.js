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


export default function ClubPresidentParticipantsScreen({
  navigation,
  route,
}) {

  const eventId =
    route?.params?.eventId ||
    null;

  const clubId =
    route?.params?.clubId ||
    null;

  const clubName =
    route?.params?.clubName ||
    "Kulübüm";


  const [participants, setParticipants] =
    useState([]);

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  /*
   * =====================================================
   * KATILIMCILARI GETİR
   * =====================================================
   */

  const loadParticipants = async () => {

    try {

      setLoading(true);


      /*
       * =================================================
       * 1. BELİRLİ ETKİNLİK
       * =================================================
       */

      if (eventId) {

        const {
          data: eventData,
          error: eventError,
        } =
          await supabase
            .from("events")
            .select(`
              id,
              event_name,
              title,
              club_id
            `)
            .eq(
              "id",
              eventId
            )
            .single();


        if (eventError) {
          throw eventError;
        }


        if (!eventData) {
          throw new Error(
            "Etkinlik bulunamadı."
          );
        }


        const {
          data: participantData,
          error: participantError,
        } =
          await supabase
            .from(
              "event_participants"
            )
            .select(
              "id, event_id, user_id"
            )
            .eq(
              "event_id",
              eventId
            );


        if (participantError) {
          throw participantError;
        }


        const participantRows =
          participantData || [];


        const userIds =
          participantRows
            .map(
              (item) =>
                item.user_id
            )
            .filter(Boolean);


        let users = [];


        if (
          userIds.length > 0
        ) {

          const {
            data: userData,
            error: userError,
          } =
            await supabase
              .from("users")
              .select(`
                id,
                first_name,
                last_name,
                email,
                department
              `)
              .in(
                "id",
                userIds
              );


          if (userError) {
            throw userError;
          }


          users =
            userData || [];
        }


        const userMap = {};


        users.forEach(
          (user) => {
            userMap[user.id] =
              user;
          }
        );


        const mapped =
          participantRows.map(
            (participant) => ({
              ...participant,

              user:
                userMap[
                  participant.user_id
                ] || null,
            })
          );


        setEvents([
          eventData,
        ]);

        setParticipants(
          mapped
        );

        return;
      }


      /*
       * =================================================
       * 2. EVENT ID YOKSA
       *
       * BAŞKANIN KULÜBÜ
       * =================================================
       */

      let selectedClubId =
        clubId;


      /*
       * Dashboard'dan clubId gelmezse
       * aktif kullanıcının kulübünü bul.
       */

      if (!selectedClubId) {

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
            "Kullanıcı bulunamadı."
          );
        }


        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("users")
            .select(
              "id"
            )
            .eq(
              "auth_user_id",
              authUser.id
            )
            .single();


        if (profileError) {
          throw profileError;
        }


        const {
          data: clubData,
          error: clubError,
        } =
          await supabase
            .from("club")
            .select(
              "id, club_name"
            )
            .eq(
              "president_id",
              profile.id
            )
            .maybeSingle();


        if (clubError) {
          throw clubError;
        }


        selectedClubId =
          clubData?.id ||
          null;
      }


      if (!selectedClubId) {

        setEvents([]);
        setParticipants([]);

        return;
      }


      /*
       * =================================================
       * KULÜBÜN ETKİNLİKLERİ
       * =================================================
       */

      const {
        data: eventData,
        error: eventError,
      } =
        await supabase
          .from("events")
          .select(`
            id,
            event_name,
            title,
            event_date,
            event_time,
            location
          `)
          .eq(
            "club_id",
            selectedClubId
          )
          .order(
            "event_date",
            {
              ascending: false,
            }
          );


      if (eventError) {
        throw eventError;
      }


      const eventRows =
        eventData || [];


      setEvents(
        eventRows
      );


      /*
       * =================================================
       * ETKİNLİK YOKSA
       * =================================================
       */

      if (
        eventRows.length === 0
      ) {

        setParticipants([]);

        return;
      }


      /*
       * =================================================
       * ETKİNLİK ID'LERİ
       * =================================================
       */

      const eventIds =
        eventRows.map(
          (event) =>
            event.id
        );


      /*
       * =================================================
       * KATILIMCILAR
       * =================================================
       */

      const {
        data: participantData,
        error: participantError,
      } =
        await supabase
          .from(
            "event_participants"
          )
          .select(
            "id, event_id, user_id"
          )
          .in(
            "event_id",
            eventIds
          );


      if (participantError) {
        throw participantError;
      }


      const participantRows =
        participantData || [];


      /*
       * =================================================
       * KULLANICILAR
       * =================================================
       */

      const userIds =
        participantRows
          .map(
            (item) =>
              item.user_id
          )
          .filter(Boolean);


      let users = [];


      if (
        userIds.length > 0
      ) {

        const {
          data: userData,
          error: userError,
        } =
          await supabase
            .from("users")
            .select(`
              id,
              first_name,
              last_name,
              email,
              department
            `)
            .in(
              "id",
              userIds
            );


        if (userError) {
          throw userError;
        }


        users =
          userData || [];
      }


      /*
       * =================================================
       * MAP
       * =================================================
       */

      const userMap = {};


      users.forEach(
        (user) => {
          userMap[user.id] =
            user;
        }
      );


      const eventMap = {};


      eventRows.forEach(
        (event) => {
          eventMap[event.id] =
            event;
        }
      );


      const mapped =
        participantRows.map(
          (participant) => ({
            ...participant,

            user:
              userMap[
                participant.user_id
              ] || null,

            event:
              eventMap[
                participant.event_id
              ] || null,
          })
        );


      setParticipants(
        mapped
      );

    } catch (error) {

      console.error(
        "Participants error:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Katılımcılar yüklenemedi."
      );

      setParticipants([]);

    } finally {

      setLoading(false);

    }
  };


  /*
   * =====================================================
   * İLK AÇILIŞ
   * =====================================================
   */

  useEffect(() => {

    loadParticipants();

  }, [
    eventId,
    clubId,
  ]);


  /*
   * =====================================================
   * TARİH
   * =====================================================
   */

  const formatDate = (
    date
  ) => {

    if (!date) {
      return "";
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

      return "";

    }
  };


  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

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
            color="#D97706"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Katılımcılar yükleniyor...
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
      style={styles.container}
    >

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


        <View
          style={
            styles.headerContent
          }
        >

          <Text
            style={styles.title}
          >
            Katılımcılar
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {clubName}
          </Text>

        </View>


        <View
          style={
            styles.headerIcon
          }
        >

          <Ionicons
            name="people"
            size={23}
            color="#D97706"
          />

        </View>

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

        {/* SAYI */}

        <View
          style={
            styles.summaryCard
          }
        >

          <View
            style={
              styles.summaryIcon
            }
          >

            <Ionicons
              name="people-outline"
              size={25}
              color="#D97706"
            />

          </View>


          <View
            style={
              styles.summaryContent
            }
          >

            <Text
              style={
                styles.summaryLabel
              }
            >
              TOPLAM KATILIMCI
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                participants.length
              }
            </Text>

          </View>

        </View>


        {/* ETKİNLİK BİLGİSİ */}

        {eventId &&
          events.length > 0 && (

            <View
              style={
                styles.eventInfoCard
              }
            >

              <Ionicons
                name="calendar-outline"
                size={20}
                color="#2563EB"
              />

              <View
                style={
                  styles.eventInfoContent
                }
              >

                <Text
                  style={
                    styles.eventInfoTitle
                  }
                >
                  {events[0]
                    ?.event_name ||
                    events[0]
                      ?.title ||
                    "Etkinlik"}
                </Text>

                <Text
                  style={
                    styles.eventInfoText
                  }
                >
                  {formatDate(
                    events[0]
                      ?.event_date
                  )}
                </Text>

              </View>

            </View>

          )}


        {/* LİSTE */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Katılımcı Listesi
        </Text>


        {participants.length >
        0 ? (

          participants.map(
            (
              participant,
              index
            ) => {

              const participantUser =
                participant.user;


              return (

                <View
                  key={
                    participant.id ||
                    `${participant.user_id}-${index}`
                  }
                  style={
                    styles.participantCard
                  }
                >

                  {/* NUMARA */}

                  <View
                    style={
                      styles.numberCircle
                    }
                  >

                    <Text
                      style={
                        styles.numberText
                      }
                    >
                      {index + 1}
                    </Text>

                  </View>


                  {/* KULLANICI */}

                  <View
                    style={
                      styles.participantContent
                    }
                  >

                    <Text
                      style={
                        styles.participantName
                      }
                      numberOfLines={
                        1
                      }
                    >

                      {participantUser
                        ?.first_name ||
                        "İsimsiz"}

                      {" "}

                      {participantUser
                        ?.last_name ||
                        ""}

                    </Text>


                    {participantUser
                      ?.department && (

                      <Text
                        style={
                          styles.department
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          participantUser.department
                        }
                      </Text>

                    )}


                    {participantUser
                      ?.email && (

                      <Text
                        style={
                          styles.email
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          participantUser.email
                        }
                      </Text>

                    )}


                    {!eventId &&
                      participant.event && (

                      <Text
                        style={
                          styles.eventName
                        }
                        numberOfLines={
                          1
                        }
                      >
                        Etkinlik:{" "}
                        {participant
                          .event
                          ?.event_name ||
                          participant
                            .event
                            ?.title ||
                          "Etkinlik"}
                      </Text>

                    )}

                  </View>


                  <Ionicons
                    name="person-circle-outline"
                    size={25}
                    color="#CBD5E1"
                  />

                </View>

              );

            }
          )

        ) : (

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
                name="people-outline"
                size={40}
                color="#94A3B8"
              />

            </View>


            <Text
              style={
                styles.emptyTitle
              }
            >
              Henüz katılımcı yok
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              Bu kulübün etkinliklerine
              henüz katılım gerçekleşmemiş.
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
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
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

    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FFFBEB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 30,
    },

    summaryCard: {
      padding: 16,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      shadowColor:
        "#000",
      shadowOpacity:
        0.04,
      shadowRadius:
        8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 2,
    },

    summaryIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor:
        "#FEF3C7",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    summaryContent: {
      flex: 1,
    },

    summaryLabel: {
      color: "#94A3B8",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },

    summaryValue: {
      color: "#0F172A",
      fontSize: 25,
      fontWeight: "800",
      marginTop: 3,
    },

    eventInfoCard: {
      marginTop: 14,
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    eventInfoContent: {
      flex: 1,
      marginLeft: 10,
    },

    eventInfoTitle: {
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "800",
    },

    eventInfoText: {
      color: "#94A3B8",
      fontSize: 11,
      marginTop: 3,
    },

    sectionTitle: {
      marginTop: 25,
      marginBottom: 13,
      color: "#0F172A",
      fontSize: 19,
      fontWeight: "800",
    },

    participantCard: {
      marginBottom: 10,
      padding: 13,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      shadowColor:
        "#000",
      shadowOpacity:
        0.03,
      shadowRadius:
        7,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 1,
    },

    numberCircle: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor:
        "#FFFBEB",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    numberText: {
      color: "#D97706",
      fontSize: 12,
      fontWeight: "800",
    },

    participantContent: {
      flex: 1,
      minWidth: 0,
    },

    participantName: {
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "800",
    },

    department: {
      color: "#64748B",
      fontSize: 11,
      marginTop: 3,
    },

    email: {
      color: "#94A3B8",
      fontSize: 10,
      marginTop: 2,
    },

    eventName: {
      color: "#D97706",
      fontSize: 10,
      fontWeight: "700",
      marginTop: 4,
    },

    emptyCard: {
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
      color: "#0F172A",
      fontSize: 16,
      fontWeight: "800",
      marginTop: 13,
    },

    emptyText: {
      color: "#94A3B8",
      fontSize: 12,
      lineHeight: 19,
      textAlign:
        "center",
      marginTop: 6,
    },

    bottomSpacing: {
      height: 30,
    },

  });
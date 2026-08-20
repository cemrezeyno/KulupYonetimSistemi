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


export default function ClubPresidentDashboardScreen({
  navigation,
}) {
  const [user, setUser] =
    useState(null);

  const [club, setClub] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);


  /*
   * =====================================================
   * DASHBOARD VERİLERİ
   * =====================================================
   */

  const loadDashboard = async (
    showLoading = false
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

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

      /*
       * USERS
       */

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from("users")
          .select(`
            id,
            auth_user_id,
            first_name,
            last_name,
            email,
            department,
            role_id
          `)
          .eq(
            "auth_user_id",
            authUser.id
          )
          .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error(
          "Kullanıcı profili bulunamadı."
        );
      }

      setUser(profile);

      /*
       * BAŞKANIN KULÜBÜ
       */

      const {
        data: clubData,
        error: clubError,
      } =
        await supabase
          .from("club")
          .select(`
            id,
            club_name,
            description,
            president_id
          `)
          .eq(
            "president_id",
            profile.id
          )
          .maybeSingle();

      if (clubError) {
        throw clubError;
      }

      setClub(
        clubData || null
      );

    } catch (error) {
      console.error(
        "Club President Dashboard Error:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Panel bilgileri yüklenemedi."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  /*
   * =====================================================
   * SAYFA AÇILDIĞINDA YÜKLE
   * =====================================================
   */

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );


  /*
   * =====================================================
   * YENİLE
   * =====================================================
   */

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };


  /*
   * =====================================================
   * ETKİNLİK EKLE
   * =====================================================
   */

  const handleCreateEvent = () => {
    navigation.navigate(
      "ClubPresidentCreateEvent"
    );
  };


  /*
   * =====================================================
   * ETKİNLİKLER
   * =====================================================
   */

  const handleEvents = () => {
    navigation.navigate(
      "ClubPresidentEvents"
    );
  };


  /*
   * =====================================================
   * DUYURULAR
   * =====================================================
   */

  const handleAnnouncements = () => {
    navigation.navigate(
      "ClubPresidentAnnouncements"
    );
  };


  /*
   * =====================================================
   * BİLDİRİMLER
   * =====================================================
   */

  const handleNotifications = () => {
    navigation.navigate(
      "ClubPresidentNotifications"
    );
  };


  /*
   * =====================================================
   * KULÜP DETAY
   * =====================================================
   */

  const handleClubDetail = () => {
    if (!club) {
      Alert.alert(
        "Bilgi",
        "Yönetilen kulüp bulunamadı."
      );

      return;
    }

    navigation.navigate(
      "ClubPresidentClubDetail",
      {
        club,
      }
    );
  };


  /*
   * =====================================================
   * KATILIMCILAR
   *
   * Burada eventId göndermiyoruz.
   *
   * ParticipantsScreen artık:
   * - eventId varsa o etkinliği
   * - eventId yoksa başkanın kulübünü
   *   baz alarak katılımcıları getirecek.
   * =====================================================
   */

  const handleParticipants = () => {
    navigation.navigate(
      "ClubPresidentParticipants",
      {
        clubId: club?.id || null,
        clubName:
          club?.club_name ||
          "Kulübüm",
      }
    );
  };


  /*
   * =====================================================
   * ÜYE OLDUĞUM KULÜPLER
   * =====================================================
   */

  const handleMemberships = () => {
    navigation.navigate(
      "ClubPresidentMemberships"
    );
  };


  /*
   * =====================================================
   * ÇIKIŞ YAP
   * =====================================================
   */

  const handleLogout = async () => {
  try {
    console.log("ÇIKIŞ BUTONUNA BASILDI");

    const {
      error,
    } = await supabase.auth.signOut();

    if (error) {
      console.error(
        "Sign out error:",
        error
      );

      Alert.alert(
        "Hata",
        "Çıkış yapılırken bir hata oluştu."
      );

      return;
    }

    console.log(
      "Çıkış başarılı."
    );

  } catch (error) {
    console.error(
      "Logout error:",
      error
    );

    Alert.alert(
      "Hata",
      error?.message ||
        "Çıkış yapılamadı."
    );
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
            color="#4F46E5"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Yönetim paneli yükleniyor...
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

      <ScrollView
        showsVerticalScrollIndicator={
          false
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
              "#4F46E5",
            ]}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View
          style={styles.header}
        >

          <View
            style={
              styles.headerTextContainer
            }
          >

            <Text
              style={styles.eyebrow}
            >
              KULÜP YÖNETİCİSİ
            </Text>

            <Text
              style={styles.greeting}
            >
              Hoş geldin,
            </Text>

            <Text
              style={styles.name}
            >
              {user?.first_name || ""}
              {" "}
              {user?.last_name || ""}
            </Text>

            <Text
              style={styles.subtitle}
            >
              Kulübünü buradan yönetebilirsin.
            </Text>

          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="shield-checkmark"
              size={27}
              color="#4F46E5"
            />
          </View>

        </View>


        {/* ================================================= */}
        {/* KULÜP KARTI */}
        {/* ================================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.clubCard
          }
          onPress={
            handleClubDetail
          }
        >

          <View
            style={
              styles.clubIcon
            }
          >
            <Ionicons
              name="people"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.clubInfo
            }
          >

            <Text
              style={
                styles.clubLabel
              }
            >
              YÖNETİLEN KULÜP
            </Text>

            <Text
              style={
                styles.clubName
              }
              numberOfLines={1}
            >
              {club?.club_name ||
                "Kulüp bulunamadı"}
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
          />

        </TouchableOpacity>


        {/* ================================================= */}
        {/* ETKİNLİK EKLE */}
        {/* ================================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.createEventButton
          }
          onPress={
            handleCreateEvent
          }
        >

          <View
            style={
              styles.createEventIcon
            }
          >
            <Ionicons
              name="add"
              size={27}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.createEventContent
            }
          >

            <Text
              style={
                styles.createEventTitle
              }
            >
              Yeni Etkinlik Oluştur
            </Text>

            <Text
              style={
                styles.createEventText
              }
            >
              Kulübün için yeni bir etkinlik planla
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
          />

        </TouchableOpacity>


        {/* ================================================= */}
        {/* YÖNETİM */}
        {/* ================================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Yönetim
        </Text>


        {/* ETKİNLİKLER */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.menuCard
          }
          onPress={
            handleEvents
          }
        >

          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor:
                  "#EFF6FF",
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.menuContent
            }
          >

            <Text
              style={
                styles.menuTitle
              }
            >
              Etkinlik Yönetimi
            </Text>

            <Text
              style={
                styles.menuDescription
              }
            >
              Etkinlikleri görüntüle ve yönet
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CBD5E1"
          />

        </TouchableOpacity>


        {/* DUYURULAR */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.menuCard
          }
          onPress={
            handleAnnouncements
          }
        >

          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor:
                  "#F0FDF4",
              },
            ]}
          >
            <Ionicons
              name="megaphone-outline"
              size={24}
              color="#16A34A"
            />
          </View>

          <View
            style={
              styles.menuContent
            }
          >

            <Text
              style={
                styles.menuTitle
              }
            >
              Duyuru Yönetimi
            </Text>

            <Text
              style={
                styles.menuDescription
              }
            >
              Duyuruları görüntüle ve yönet
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CBD5E1"
          />

        </TouchableOpacity>


        {/* BİLDİRİMLER */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.menuCard
          }
          onPress={
            handleNotifications
          }
        >

          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor:
                  "#EFF6FF",
              },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color="#2563EB"
            />
          </View>

          <View
            style={
              styles.menuContent
            }
          >

            <Text
              style={
                styles.menuTitle
              }
            >
              Bildirim Yönetimi
            </Text>

            <Text
              style={
                styles.menuDescription
              }
            >
              Bildirimleri görüntüle ve yönet
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CBD5E1"
          />

        </TouchableOpacity>


        {/* KATILIMCILAR */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.menuCard
          }
          onPress={
            handleParticipants
          }
        >

          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor:
                  "#FEF3C7",
              },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color="#D97706"
            />
          </View>

          <View
            style={
              styles.menuContent
            }
          >

            <Text
              style={
                styles.menuTitle
              }
            >
              Katılımcılar
            </Text>

            <Text
              style={
                styles.menuDescription
              }
            >
              Kulübündeki etkinlik katılımcılarını görüntüle
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CBD5E1"
          />

        </TouchableOpacity>


        {/* ÜYE OLDUĞUM KULÜPLER */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.menuCard
          }
          onPress={
            handleMemberships
          }
        >

          <View
            style={[
              styles.menuIcon,
              {
                backgroundColor:
                  "#F5F3FF",
              },
            ]}
          >
            <Ionicons
              name="bookmark-outline"
              size={24}
              color="#7C3AED"
            />
          </View>

          <View
            style={
              styles.menuContent
            }
          >

            <Text
              style={
                styles.menuTitle
              }
            >
              Üye Olduğum Kulüpler
            </Text>

            <Text
              style={
                styles.menuDescription
              }
            >
              Üyesi olduğun kulüpleri görüntüle
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CBD5E1"
          />

        </TouchableOpacity>


        {/* ================================================= */}
        {/* ÇIKIŞ */}
        {/* ================================================= */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.logoutButton
          }
          onPress={
            handleLogout
          }
        >

          <View
            style={
              styles.logoutIcon
            }
          >
            <Ionicons
              name="log-out-outline"
              size={23}
              color="#DC2626"
            />
          </View>

          <View
            style={
              styles.logoutContent
            }
          >

            <Text
              style={
                styles.logoutTitle
              }
            >
              Çıkış Yap
            </Text>

            <Text
              style={
                styles.logoutDescription
              }
            >
              Hesabından güvenli şekilde çıkış yap
            </Text>

          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#CBD5E1"
          />

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

    scrollContent: {
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
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 20,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    headerTextContainer: {
      flex: 1,
      paddingRight: 15,
    },

    eyebrow: {
      color: "#4F46E5",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.4,
      marginBottom: 6,
    },

    greeting: {
      color: "#64748B",
      fontSize: 14,
    },

    name: {
      color: "#0F172A",
      fontSize: 27,
      fontWeight: "800",
      marginTop: 2,
    },

    subtitle: {
      color: "#64748B",
      fontSize: 12,
      marginTop: 6,
    },

    headerIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor:
        "#EEF2FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    /*
     * CLUB
     */

    clubCard: {
      marginHorizontal: 20,
      marginTop: 18,
      padding: 16,
      borderRadius: 22,
      backgroundColor:
        "#4F46E5",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    clubIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor:
        "rgba(255,255,255,0.18)",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    clubInfo: {
      flex: 1,
    },

    clubLabel: {
      color: "#C7D2FE",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },

    clubName: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
      marginTop: 4,
    },

    /*
     * CREATE EVENT
     */

    createEventButton: {
      marginHorizontal: 20,
      marginTop: 14,
      padding: 16,
      borderRadius: 20,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    createEventIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor:
        "rgba(255,255,255,0.18)",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    createEventContent: {
      flex: 1,
    },

    createEventTitle: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    createEventText: {
      color: "#DBEAFE",
      fontSize: 11,
      marginTop: 4,
    },

    /*
     * SECTION
     */

    sectionTitle: {
      marginHorizontal: 20,
      marginTop: 28,
      marginBottom: 13,
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
    },

    /*
     * MENU
     */

    menuCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 14,
      borderRadius: 19,
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

    menuIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    menuContent: {
      flex: 1,
      minWidth: 0,
    },

    menuTitle: {
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "800",
    },

    menuDescription: {
      color: "#94A3B8",
      fontSize: 11,
      marginTop: 4,
      lineHeight: 16,
    },

    /*
     * LOGOUT
     */

    logoutButton: {
      marginHorizontal: 20,
      marginTop: 8,
      padding: 14,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      borderWidth: 1,
      borderColor:
        "#FEE2E2",
    },

    logoutIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    logoutContent: {
      flex: 1,
    },

    logoutTitle: {
      color: "#DC2626",
      fontSize: 14,
      fontWeight: "800",
    },

    logoutDescription: {
      color: "#94A3B8",
      fontSize: 11,
      marginTop: 4,
    },

    bottomSpacing: {
      height: 25,
    },

  });
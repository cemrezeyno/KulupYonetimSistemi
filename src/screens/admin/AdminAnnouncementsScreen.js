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
  supabase,
} from "../../config/supabase";

export default function AdminAnnouncementsScreen({
  navigation,
}) {
  const [announcements, setAnnouncements] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [currentUser, setCurrentUser] =
    useState(null);

  /*
   * =====================================================
   * AKTİF KULLANICIYI GETİR
   * =====================================================
   */

  const getCurrentProfile = async () => {
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

    const {
      data: profile,
      error: profileError,
    } =
      await supabase
        .from("users")
        .select(
          "id, role_id, first_name, last_name"
        )
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

    return profile;
  };

  /*
   * =====================================================
   * DUYURULARI GETİR
   *
   * Admin:
   *     Bütün duyurular
   *
   * Kulüp Başkanı:
   *     Sadece kendi oluşturduğu duyurular
   * =====================================================
   */

  const loadAnnouncements = async (
    showLoading = false
  ) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const profile =
        await getCurrentProfile();

      setCurrentUser(profile);

      let query =
        supabase
          .from("announcements")
          .select(
            `
            id,
            title,
            content,
            created_at,
            created_by,
            is_active
            `
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      /*
       * ADMIN
       *
       * role_id = 1
       * bütün duyuruları görebilir.
       */

      if (profile.role_id === 1) {
        // Filtre yok.
      }

      /*
       * KULÜP BAŞKANI
       *
       * role_id = 3
       * sadece kendi oluşturduğu
       * duyuruları görebilir.
       */

      else if (
        profile.role_id === 3
      ) {
        query = query.eq(
          "created_by",
          profile.id
        );
      }

      /*
       * DİĞER ROLLER
       *
       * Duyuru yönetimi
       * yapamaz.
       */

      else {
        setAnnouncements([]);
        return;
      }

      const {
        data,
        error,
      } = await query;

      if (error) {
        throw error;
      }

      setAnnouncements(
        data || []
      );
    } catch (error) {
      console.error(
        "Announcements loading error:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Duyurular yüklenemedi."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * =====================================================
   * İLK AÇILIŞ
   * =====================================================
   */

  useEffect(() => {
    loadAnnouncements(
      true
    );
  }, []);

  /*
   * =====================================================
   * YENİLE
   * =====================================================
   */

  const onRefresh = () => {
    setRefreshing(true);

    loadAnnouncements();
  };

  /*
   * =====================================================
   * YENİ DUYURU
   * =====================================================
   */

  const handleCreateAnnouncement = () => {
    /*
     * Admin ise:
     * AdminAnnouncements'a dön
     *
     * Başkan ise:
     * ClubPresidentAnnouncements'a dön
     */

    const returnScreen =
      currentUser?.role_id === 3
        ? "ClubPresidentAnnouncements"
        : "AdminAnnouncements";

    navigation.navigate(
      "AdminCreateAnnouncement",
      {
        returnScreen,
      }
    );
  };

  /*
   * =====================================================
   * DUYURU SİL
   * =====================================================
   */

  const handleDeleteAnnouncement =
    async (
      announcement
    ) => {
      if (
        !announcement?.id ||
        deletingId
      ) {
        return;
      }

      try {
        setDeletingId(
          announcement.id
        );

        let deleteQuery =
          supabase
            .from("announcements")
            .delete()
            .eq(
              "id",
              announcement.id
            );

        /*
         * Kulüp Başkanı sadece
         * kendi oluşturduğu duyuruyu
         * silebilir.
         */

        if (
          currentUser?.role_id === 3
        ) {
          deleteQuery =
            deleteQuery.eq(
              "created_by",
              currentUser.id
            );
        }

        const {
          data,
          error,
        } =
          await deleteQuery
            .select("id");

        console.log(
          "DUYURU DELETE DATA:",
          data
        );

        console.log(
          "DUYURU DELETE ERROR:",
          error
        );

        if (error) {
          throw error;
        }

        if (
          !data ||
          data.length === 0
        ) {
          throw new Error(
            "Duyuru silinemedi. Kayıt bulunamadı veya silme yetkiniz yok."
          );
        }

        setAnnouncements(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                announcement.id
            )
        );
      } catch (error) {
        console.error(
          "DUYURU SİLME HATASI:",
          error
        );

        Alert.alert(
          "Hata",
          error?.message ||
            "Duyuru silinemedi."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };

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
        "tr-TR"
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
            color="#16A34A"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Duyurular yükleniyor...
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
            styles.headerText
          }
        >
          <Text
            style={styles.title}
          >
            Duyuru Yönetimi
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {announcements.length}{" "}
            duyuru
          </Text>
        </View>

        <View
          style={
            styles.headerIcon
          }
        >
          <Ionicons
            name="megaphone"
            size={23}
            color="#16A34A"
          />
        </View>
      </View>

      {/* İÇERİK */}

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
              onRefresh
            }
            colors={[
              "#16A34A",
            ]}
          />
        }
        contentContainerStyle={
          styles.content
        }
      >

        {/* YENİ DUYURU */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.createButton
          }
          onPress={
            handleCreateAnnouncement
          }
        >
          <View
            style={
              styles.createIcon
            }
          >
            <Ionicons
              name="add"
              size={25}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.createContent
            }
          >
            <Text
              style={
                styles.createTitle
              }
            >
              Yeni Duyuru Oluştur
            </Text>

            <Text
              style={
                styles.createDescription
              }
            >
              Yeni duyuru yayınla
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* BAŞLIK */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Duyurular
        </Text>

        {/* LİSTE */}

        {announcements.length >
        0 ? (
          announcements.map(
            (announcement) => {
              const isDeleting =
                deletingId ===
                announcement.id;

              return (
                <View
                  key={
                    announcement.id
                  }
                  style={
                    styles.card
                  }
                >

                  <View
                    style={
                      styles.cardIcon
                    }
                  >
                    <Ionicons
                      name="megaphone-outline"
                      size={24}
                      color="#16A34A"
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={
                      0.75
                    }
                    style={
                      styles.cardContent
                    }
                    onPress={() =>
                      navigation.navigate(
                        "AdminEditAnnouncement",
                        {
                          announcement,
                        }
                      )
                    }
                  >
                    <Text
                      style={
                        styles.cardTitle
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {
                        announcement.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.cardDescription
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        announcement.content
                      }
                    </Text>

                    <Text
                      style={
                        styles.date
                      }
                    >
                      Oluşturulma:{" "}
                      {formatDate(
                        announcement.created_at
                      )}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.6}
                    disabled={
                      isDeleting
                    }
                    onPress={() =>
                      handleDeleteAnnouncement(
                        announcement
                      )
                    }
                    style={[
                      styles.deleteButton,
                      isDeleting &&
                        styles.deleteButtonDisabled,
                    ]}
                  >
                    {isDeleting ? (
                      <ActivityIndicator
                        size="small"
                        color="#DC2626"
                      />
                    ) : (
                      <Ionicons
                        name="trash-outline"
                        size={21}
                        color="#DC2626"
                      />
                    )}
                  </TouchableOpacity>

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
            <Ionicons
              name="megaphone-outline"
              size={45}
              color="#94A3B8"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Henüz duyuru yok
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Oluşturduğunuz duyurular
              burada görünecektir.
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

    headerText: {
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
        "#F0FDF4",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    createButton: {
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 20,
      backgroundColor:
        "#16A34A",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    createIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor:
        "rgba(255,255,255,0.18)",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 13,
    },

    createContent: {
      flex: 1,
    },

    createTitle: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    createDescription: {
      color: "#DCFCE7",
      fontSize: 11,
      marginTop: 4,
    },

    sectionTitle: {
      marginHorizontal: 20,
      marginTop: 28,
      marginBottom: 14,
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
    },

    card: {
      marginHorizontal: 20,
      marginBottom: 14,
      minHeight: 105,
      padding: 14,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      flexDirection:
        "row",
      alignItems:
        "center",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
    },

    cardIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor:
        "#F0FDF4",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    cardContent: {
      flex: 1,
      minWidth: 0,
    },

    cardTitle: {
      color: "#0F172A",
      fontSize: 15,
      fontWeight: "800",
    },

    cardDescription: {
      color: "#64748B",
      fontSize: 11,
      lineHeight: 17,
      marginTop: 4,
    },

    date: {
      color: "#94A3B8",
      fontSize: 10,
      marginTop: 6,
    },

    deleteButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    deleteButtonDisabled: {
      opacity: 0.5,
    },

    emptyCard: {
      marginHorizontal: 20,
      paddingVertical: 50,
      paddingHorizontal: 20,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
    },

    emptyTitle: {
      color: "#64748B",
      fontSize: 16,
      fontWeight: "700",
      marginTop: 12,
    },

    emptyText: {
      color: "#94A3B8",
      fontSize: 12,
      marginTop: 6,
      textAlign: "center",
    },

    bottomSpacing: {
      height: 30,
    },
  });
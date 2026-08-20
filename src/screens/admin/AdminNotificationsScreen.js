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

export default function AdminNotificationsScreen({
  navigation,
}) {
  const [notifications, setNotifications] =
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
   * BİLDİRİMLERİ GETİR
   *
   * Admin:
   *     Bütün bildirimler
   *
   * Kulüp Başkanı:
   *     Sadece kendi oluşturduğu bildirimler
   * =====================================================
   */

  const loadNotifications =
    async (
      showLoading = false
    ) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const profile =
          await getCurrentProfile();

        setCurrentUser(
          profile
        );

        let query =
          supabase
            .from("notifications")
            .select(
              `
              id,
              title,
              message,
              notification_type,
              is_read,
              created_at,
              user_id,
              created_by
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
         * bütün bildirimleri görebilir.
         */

        if (
          profile.role_id === 1
        ) {
          // Filtre yok.
        }

        /*
         * KULÜP BAŞKANI
         *
         * role_id = 3
         * sadece kendi oluşturduğu
         * bildirimleri görebilir.
         */

        else if (
          profile.role_id === 3
        ) {
          query =
            query.eq(
              "created_by",
              profile.id
            );
        }

        /*
         * DİĞER ROLLER
         */

        else {
          setNotifications([]);
          return;
        }

        const {
          data,
          error,
        } =
          await query;

        if (error) {
          throw error;
        }

        setNotifications(
          data || []
        );
      } catch (error) {
        console.error(
          "Notifications loading error:",
          error
        );

        Alert.alert(
          "Hata",
          error?.message ||
            "Bildirimler yüklenemedi."
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
    loadNotifications(
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

    loadNotifications();
  };

  /*
   * =====================================================
   * YENİ BİLDİRİM
   * =====================================================
   */

  const handleCreateNotification = () => {
    const returnScreen =
      currentUser?.role_id === 3
        ? "ClubPresidentNotifications"
        : "AdminNotifications";

    navigation.navigate(
      "AdminCreateNotification",
      {
        returnScreen,
      }
    );
  };

  /*
   * =====================================================
   * BİLDİRİM SİL
   * =====================================================
   */

  const handleDeleteNotification =
    async (
      notification
    ) => {
      if (
        !notification?.id ||
        deletingId
      ) {
        return;
      }

      try {
        setDeletingId(
          notification.id
        );

        let deleteQuery =
          supabase
            .from("notifications")
            .delete()
            .eq(
              "id",
              notification.id
            );

        /*
         * Kulüp Başkanı yalnızca
         * kendi oluşturduğu bildirimi
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
          "BİLDİRİM DELETE DATA:",
          data
        );

        console.log(
          "BİLDİRİM DELETE ERROR:",
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
            "Bildirim silinemedi. Kayıt bulunamadı veya silme yetkiniz yok."
          );
        }

        setNotifications(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                notification.id
            )
        );
      } catch (error) {
        console.error(
          "BİLDİRİM SİLME HATASI:",
          error
        );

        Alert.alert(
          "Hata",
          error?.message ||
            "Bildirim silinemedi."
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
            color="#2563EB"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Bildirimler yükleniyor...
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
              onRefresh
            }
            colors={[
              "#2563EB",
            ]}
          />
        }
        contentContainerStyle={
          styles.content
        }
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
              Bildirim Yönetimi
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              {
                notifications.length
              }{" "}
              bildirim
            </Text>
          </View>

          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="notifications"
              size={23}
              color="#2563EB"
            />
          </View>
        </View>

        {/* YENİ BİLDİRİM */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={
            styles.createButton
          }
          onPress={
            handleCreateNotification
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
              Yeni Bildirim Oluştur
            </Text>

            <Text
              style={
                styles.createDescription
              }
            >
              Yeni bildirim yayınla
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
          Bildirimler
        </Text>

        {/* LİSTE */}

        {notifications.length >
        0 ? (
          notifications.map(
            (notification) => {
              const isDeleting =
                deletingId ===
                notification.id;

              return (
                <View
                  key={
                    notification.id
                  }
                  style={
                    styles.card
                  }
                >

                  {/* İKON */}

                  <View
                    style={
                      styles.cardIcon
                    }
                  >
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color="#2563EB"
                    />
                  </View>

                  {/* BİLGİ */}

                  <TouchableOpacity
                    activeOpacity={
                      0.75
                    }
                    style={
                      styles.cardContent
                    }
                    onPress={() =>
                      navigation.navigate(
                        "AdminEditNotification",
                        {
                          notification,
                        }
                      )
                    }
                  >
                    <Text
                      style={
                        styles.cardTitle
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        notification.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.cardMessage
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        notification.message
                      }
                    </Text>

                    <Text
                      style={
                        styles.date
                      }
                    >
                      Oluşturulma:{" "}
                      {formatDate(
                        notification.created_at
                      )}
                    </Text>
                  </TouchableOpacity>

                  {/* SİL */}

                  <TouchableOpacity
                    activeOpacity={0.6}
                    disabled={
                      isDeleting
                    }
                    onPress={() =>
                      handleDeleteNotification(
                        notification
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
              name="notifications-outline"
              size={45}
              color="#94A3B8"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              Henüz bildirim yok
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Oluşturduğunuz bildirimler
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
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    createButton: {
      marginHorizontal: 20,
      marginTop: 18,
      padding: 16,
      borderRadius: 20,
      backgroundColor:
        "#2563EB",
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
      color: "#DBEAFE",
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
        "#EFF6FF",
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

    cardMessage: {
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
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

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../config/supabase";

import {
  getCurrentUserRole,
  getManagedClubIds,
  isMainAdmin,
} from "../../services/adminService";

export default function AdminUsersScreen({
  navigation,
}) {
  const [users, setUsers] = useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * =====================================================
   * KULLANICILARI YÜKLE
   * =====================================================
   */

  const loadUsers = async () => {
    try {
      /*
       * SESSION
       */

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const session =
        sessionData?.session;

      if (!session) {
        setUsers([]);
        setCurrentUser(null);
        return;
      }

      /*
       * AKTİF KULLANICI
       */

      const user =
        await getCurrentUserRole(
          session
        );

      if (!user) {
        setUsers([]);
        setCurrentUser(null);
        return;
      }

      setCurrentUser(user);

      /*
       * =================================================
       * GÖRÜLEBİLECEK KULLANICULAR
       * =================================================
       */

      let visibleUserIds = null;
      let managedClubIds = [];

      /*
       * ANA ADMİN:
       * Herkesi görür.
       */

      if (!isMainAdmin(user)) {
        /*
         * BAŞKAN:
         * Yönettiği kulüpleri bul.
         */

        managedClubIds =
          await getManagedClubIds(
            user
          );

        if (
          !managedClubIds ||
          managedClubIds.length === 0
        ) {
          setUsers([]);
          return;
        }

        /*
         * Bu kulüplerdeki üyeler.
         */

        const {
          data: memberships,
          error: membershipError,
        } = await supabase
          .from("club_members")
          .select("user_id")
          .in(
            "club_id",
            managedClubIds
          );

        if (membershipError) {
          throw membershipError;
        }

        visibleUserIds = [
          ...new Set(
            (memberships || []).map(
              (item) =>
                item.user_id
            )
          ),
        ];

        /*
         * Başkan kendisini de görsün.
         */

        if (
          !visibleUserIds.includes(
            user.id
          )
        ) {
          visibleUserIds.push(
            user.id
          );
        }
      }

      /*
       * =================================================
       * USERS
       * =================================================
       */

      let usersQuery =
        supabase
          .from("users")
          .select(`
            id,
            first_name,
            last_name,
            email,
            faculty,
            department,
            class_year,
            profile_image,
            role_id,
            status_id,
            created_at,

            roles (
              role_name
            ),

            member_status (
              status_name
            )
          `)
          .order("created_at", {
            ascending: false,
          });

      if (
        visibleUserIds !== null
      ) {
        if (
          visibleUserIds.length === 0
        ) {
          setUsers([]);
          return;
        }

        usersQuery =
          usersQuery.in(
            "id",
            visibleUserIds
          );
      }

      const {
        data: usersData,
        error: usersError,
      } = await usersQuery;

      if (usersError) {
        throw usersError;
      }

      /*
       * =================================================
       * ÜYELİKLER
       * =================================================
       */

      let membershipsQuery =
        supabase
          .from("club_members")
          .select(
            "user_id, club_id"
          );

      if (
        !isMainAdmin(user)
      ) {
        if (
          managedClubIds.length > 0
        ) {
          membershipsQuery =
            membershipsQuery.in(
              "club_id",
              managedClubIds
            );
        }
      }

      const {
        data: membershipsData,
        error: membershipsError,
      } =
        await membershipsQuery;

      if (membershipsError) {
        throw membershipsError;
      }

      /*
       * =================================================
       * ÜYELİK SAYILARI
       * =================================================
       */

      const membershipCount = {};

      (
        membershipsData || []
      ).forEach(
        (membership) => {
          membershipCount[
            membership.user_id
          ] =
            (membershipCount[
              membership.user_id
            ] || 0) + 1;
        }
      );

      /*
       * =================================================
       * SON VERİ
       * =================================================
       */

      const mappedUsers =
        (usersData || []).map(
          (item) => ({
            ...item,

            club_count:
              membershipCount[
                item.id
              ] || 0,
          })
        );

      setUsers(mappedUsers);
    } catch (error) {
      console.error(
        "ADMIN USERS ERROR:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Kullanıcılar yüklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /*
   * =====================================================
   * YENİLE
   * =====================================================
   */

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  /*
   * =====================================================
   * INITIALS
   * =====================================================
   */

  const getInitials = (user) => {
    const first =
      user?.first_name?.charAt(
        0
      ) || "";

    const last =
      user?.last_name?.charAt(
        0
      ) || "";

    return (
      first + last
    ).toUpperCase();
  };

  /*
   * =====================================================
   * ROL RENGİ
   * =====================================================
   */

  const getRoleColor = (
    roleId
  ) => {
    if (roleId === 1) {
      return "#7C3AED";
    }

    if (roleId === 3) {
      return "#F59E0B";
    }

    return "#2563EB";
  };

  /*
   * =====================================================
   * ROL ADI
   * =====================================================
   */

  const getRoleName = (
    user
  ) => {
    return (
      user?.roles?.role_name ||
      (user?.role_id === 1
        ? "Ana Admin"
        : user?.role_id === 3
          ? "Kulüp Başkanı"
          : "Üye")
    );
  };

  /*
   * =====================================================
   * DURUM RENGİ
   * =====================================================
   */

  const getStatusColor = (
    statusId
  ) => {
    switch (statusId) {
      case 1:
        return "#16A34A";

      case 2:
        return "#DC2626";

      case 3:
        return "#F59E0B";

      default:
        return "#64748B";
    }
  };

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Kullanıcılar yükleniyor...
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
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

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Kullanıcı Yönetimi
            </Text>

            <Text style={styles.subtitle}>
              {users.length} kullanıcı
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="people"
              size={23}
              color="#2563EB"
            />
          </View>
        </View>

        {/* ANA ADMİN BİLGİSİ */}

        {currentUser &&
          isMainAdmin(
            currentUser
          ) && (
            <View
              style={
                styles.adminInfoCard
              }
            >
              <View
                style={
                  styles.adminInfoIcon
                }
              >
                <Ionicons
                  name="shield-checkmark"
                  size={21}
                  color="#7C3AED"
                />
              </View>

              <View style={styles.infoContent}>
                <Text
                  style={
                    styles.adminInfoTitle
                  }
                >
                  Ana Admin
                </Text>

                <Text
                  style={
                    styles.adminInfoText
                  }
                >
                  Sistemdeki tüm kullanıcıları
                  görüntülüyorsunuz.
                </Text>
              </View>
            </View>
          )}

        {/* BAŞKAN BİLGİSİ */}

        {currentUser &&
          currentUser.role_id ===
            3 && (
            <View
              style={
                styles.presidentInfoCard
              }
            >
              <View
                style={
                  styles.presidentInfoIcon
                }
              >
                <Ionicons
                  name="ribbon"
                  size={21}
                  color="#F59E0B"
                />
              </View>

              <View style={styles.infoContent}>
                <Text
                  style={
                    styles.presidentInfoTitle
                  }
                >
                  Kulüp Başkanı
                </Text>

                <Text
                  style={
                    styles.presidentInfoText
                  }
                >
                  Yönettiğiniz kulüplerdeki
                  kullanıcıları
                  görüntülüyorsunuz.
                </Text>
              </View>
            </View>
          )}

        {/* KULLANICILAR */}

        <Text style={styles.sectionTitle}>
          Kullanıcılar
        </Text>

        {users.length > 0 ? (
          users.map((user) => {
            const roleName =
              getRoleName(user);

            const statusName =
              user?.member_status
                ?.status_name ||
              "Bilinmiyor";

            const roleColor =
              getRoleColor(
                user.role_id
              );

            const statusColor =
              getStatusColor(
                user.status_id
              );

            return (
              <TouchableOpacity
                key={user.id}
                activeOpacity={0.85}
                style={styles.userCard}
                onPress={() =>
                  navigation.navigate(
                    "AdminUserDetail",
                    {
                      user,
                    }
                  )
                }
              >
                {/* AVATAR */}

                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        roleColor +
                        "15",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color:
                          roleColor,
                      },
                    ]}
                  >
                    {getInitials(user)}
                  </Text>
                </View>

                {/* BİLGİ */}

                <View style={styles.userInfo}>
                  <Text
                    style={styles.userName}
                    numberOfLines={1}
                  >
                    {user.first_name || ""}{" "}
                    {user.last_name || ""}
                  </Text>

                  <Text
                    style={styles.email}
                    numberOfLines={1}
                  >
                    {user.email ||
                      "E-posta yok"}
                  </Text>

                  {/* ROZETLER */}

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            roleColor +
                            "15",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              roleColor,
                          },
                        ]}
                      >
                        {roleName}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            statusColor +
                            "15",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              statusColor,
                          },
                        ]}
                      >
                        {statusName}
                      </Text>
                    </View>
                  </View>

                  {/* KULÜP SAYISI */}

                  <Text style={styles.clubText}>
                    {user.club_count || 0}{" "}
                    kulüp üyeliği
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#CBD5E1"
                />
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="people-outline"
                size={45}
                color="#94A3B8"
              />
            </View>

            <Text style={styles.emptyTitle}>
              {currentUser?.role_id ===
              3
                ? "Kulübünüzde kullanıcı yok"
                : "Kullanıcı bulunamadı"}
            </Text>

            <Text style={styles.emptyText}>
              {currentUser?.role_id ===
              3
                ? "Henüz yönettiğiniz kulübe kayıtlı kullanıcı bulunmuyor."
                : "Sistemde henüz kullanıcı bulunmuyor."}
            </Text>
          </View>
        )}

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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },

  header: {
    minHeight: 78,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
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
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  adminInfoCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    flexDirection: "row",
    alignItems: "center",
  },

  adminInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  presidentInfoCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
  },

  presidentInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  adminInfoTitle: {
    color: "#6D28D9",
    fontSize: 14,
    fontWeight: "800",
  },

  adminInfoText: {
    color: "#7C3AED",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 17,
  },

  presidentInfoTitle: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "800",
  },

  presidentInfoText: {
    color: "#B45309",
    fontSize: 11,
    marginTop: 3,
    lineHeight: 17,
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },

  userCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "800",
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  email: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 3,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 7,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  clubText: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 6,
  },

  emptyCard: {
    margin: 20,
    paddingVertical: 50,
    paddingHorizontal: 25,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
  },

  bottomSpacing: {
    height: 30,
  },
});
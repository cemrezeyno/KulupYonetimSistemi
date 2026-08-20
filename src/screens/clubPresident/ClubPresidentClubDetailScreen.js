import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../config/supabase";

/* ============================================================
   CURRENT USER PROFILE
============================================================ */

const getCurrentUserProfile = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error(
      "Oturum açmış kullanıcı bulunamadı."
    );
  }

  const {
    data: userById,
    error: idError,
  } = await supabase
    .from("users")
    .select(`
      id,
      auth_user_id,
      first_name,
      last_name,
      email,
      role_id
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (idError) {
    throw idError;
  }

  if (userById) {
    return userById;
  }

  const {
    data: userByAuthId,
    error: authIdError,
  } = await supabase
    .from("users")
    .select(`
      id,
      auth_user_id,
      first_name,
      last_name,
      email,
      role_id
    `)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (authIdError) {
    throw authIdError;
  }

  if (userByAuthId) {
    return userByAuthId;
  }

  if (user.email) {
    const {
      data: userByEmail,
      error: emailError,
    } = await supabase
      .from("users")
      .select(`
        id,
        auth_user_id,
        first_name,
        last_name,
        email,
        role_id
      `)
      .eq("email", user.email)
      .maybeSingle();

    if (emailError) {
      throw emailError;
    }

    if (userByEmail) {
      return userByEmail;
    }
  }

  throw new Error(
    "Kullanıcının users tablosunda profil kaydı bulunamadı."
  );
};

/* ============================================================
   COMPONENT
============================================================ */

const ClubPresidentClubDetailScreen = ({
  route,
  navigation,
}) => {
  const initialClub =
    route?.params?.club || null;

  const [club, setClub] =
    useState(initialClub);

  const [members, setMembers] =
    useState([]);

  const [events, setEvents] =
    useState([]);

  const [president, setPresident] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [processingUserId, setProcessingUserId] =
    useState(null);

  /* ==========================================================
     LOAD CLUB DATA
  ========================================================== */

  const loadClubData = useCallback(
    async () => {
      try {
        const currentUser =
          await getCurrentUserProfile();

        let clubId =
          initialClub?.id || null;

        let clubData = null;

        /* ------------------------------------------------------
           1. Route üzerinden kulüp geldiyse
        ------------------------------------------------------ */

        if (clubId) {
          const {
            data,
            error,
          } = await supabase
            .from("club")
            .select(`
              id,
              club_name,
              description,
              email,
              president_id
            `)
            .eq("id", clubId)
            .maybeSingle();

          if (error) {
            throw error;
          }

          clubData = data;
        }

        /* ------------------------------------------------------
           2. Route üzerinden kulüp gelmediyse
              başkanın kulübünü bul
        ------------------------------------------------------ */

        if (!clubData) {
          const {
            data,
            error,
          } = await supabase
            .from("club")
            .select(`
              id,
              club_name,
              description,
              email,
              president_id
            `)
            .eq(
              "president_id",
              currentUser.id
            )
            .maybeSingle();

          if (error) {
            throw error;
          }

          clubData = data;

          if (clubData) {
            clubId = clubData.id;
          }
        }

        if (!clubData || !clubId) {
          throw new Error(
            "Kulüp başkanına ait kulüp bulunamadı."
          );
        }

        /* ======================================================
           PRESIDENT
        ====================================================== */

        let presidentData = null;

        if (clubData.president_id) {
          const {
            data,
            error,
          } = await supabase
            .from("users")
            .select(`
              id,
              first_name,
              last_name,
              email,
              department
            `)
            .eq(
              "id",
              clubData.president_id
            )
            .maybeSingle();

          if (error) {
            console.error(
              "President loading error:",
              error
            );
          }

          presidentData = data;
        }

        /* ======================================================
           EVENTS
        ====================================================== */

        const {
          data: eventData,
          error: eventsError,
        } = await supabase
          .from("events")
          .select(`
            id,
            title,
            description,
            event_date,
            event_time,
            location,
            max_participants,
            is_active,
            category_id,
            created_at
          `)
          .eq(
            "club_id",
            clubId
          )
          .order(
            "event_date",
            {
              ascending: true,
            }
          );

        if (eventsError) {
          throw eventsError;
        }

        /* ======================================================
           MEMBERSHIPS
        ====================================================== */

        const {
          data: membershipData,
          error: membershipError,
        } = await supabase
          .from("club_members")
          .select(`
            id,
            club_id,
            user_id,
            status,
            joined_at
          `)
          .eq(
            "club_id",
            clubId
          )
          .order(
            "joined_at",
            {
              ascending: false,
            }
          );

        if (membershipError) {
          throw membershipError;
        }

        /* ======================================================
           USERS
        ====================================================== */

        const userIds =
          (membershipData || [])
            .map(
              (item) =>
                item.user_id
            )
            .filter(Boolean);

        let usersData = [];

        if (userIds.length > 0) {
          const {
            data,
            error,
          } = await supabase
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

          if (error) {
            throw error;
          }

          usersData =
            data || [];
        }

        /* ======================================================
           FORMAT MEMBERS
        ====================================================== */

        const formattedMembers =
          (membershipData || []).map(
            (membership) => {
              const user =
                usersData.find(
                  (item) =>
                    item.id ===
                    membership.user_id
                );

              return {
                id:
                  membership.id,

                club_id:
                  membership.club_id,

                user_id:
                  membership.user_id,

                status:
                  membership.status ||
                  "pending",

                joined_at:
                  membership.joined_at,

                first_name:
                  user?.first_name ||
                  "",

                last_name:
                  user?.last_name ||
                  "",

                email:
                  user?.email ||
                  "",

                department:
                  user?.department ||
                  "",
              };
            }
          );

        /* ======================================================
           STATES
        ====================================================== */

        setClub({
          ...clubData,
          name:
            clubData.club_name,
        });

        setPresident(
          presidentData
        );

        setMembers(
          formattedMembers
        );

        setEvents(
          eventData || []
        );

      } catch (error) {
        console.error(
          "ClubPresidentClubDetailScreen load error:",
          error
        );

        Alert.alert(
          "Hata",
          error?.message ||
            "Kulüp bilgileri alınırken bir hata oluştu."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [initialClub?.id]
  );

  /* ============================================================
     INITIAL LOAD
  ============================================================ */

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

  /* ============================================================
     REFRESH
  ============================================================ */

  const handleRefresh =
    useCallback(() => {
      setRefreshing(true);
      loadClubData();
    }, [loadClubData]);

  /* ============================================================
     UPDATE MEMBERSHIP
  ============================================================ */

  const updateMembershipStatus =
    async (
      membershipId,
      userId,
      status
    ) => {
      try {
        if (!membershipId) {
          Alert.alert(
            "Hata",
            "Üyelik kaydı bulunamadı."
          );
          return;
        }

        if (!club?.id) {
          Alert.alert(
            "Hata",
            "Kulüp bilgisi bulunamadı."
          );
          return;
        }

        setProcessingUserId(
          userId
        );

        const {
          data,
          error,
        } = await supabase
          .from("club_members")
          .update({
            status: status,
          })
          .eq(
            "id",
            membershipId
          )
          .eq(
            "club_id",
            club.id
          )
          .select(`
            id,
            club_id,
            user_id,
            status,
            joined_at
          `)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Üyelik durumu güncellenemedi. Supabase RLS policy kontrol edilmeli."
          );
        }

        setMembers(
          (currentMembers) =>
            currentMembers.map(
              (member) =>
                member.id ===
                membershipId
                  ? {
                      ...member,
                      status:
                        status,
                    }
                  : member
            )
        );

        if (
          status ===
          "approved"
        ) {
          Alert.alert(
            "Başarılı",
            "Kullanıcı kulübe üye olarak onaylandı."
          );
        }

        if (
          status ===
          "rejected"
        ) {
          Alert.alert(
            "Başarılı",
            "Üyelik başvurusu reddedildi."
          );
        }

        await loadClubData();

      } catch (error) {
        console.error(
          "UPDATE MEMBERSHIP ERROR:",
          error
        );

        Alert.alert(
          "İşlem Başarısız",
          error?.message ||
            "Üyelik durumu güncellenemedi."
        );
      } finally {
        setProcessingUserId(
          null
        );
      }
    };

  /* ============================================================
     APPROVE
  ============================================================ */

  const handleApprove =
    async (member) => {
      await updateMembershipStatus(
        member.id,
        member.user_id,
        "approved"
      );
    };

  /* ============================================================
     REJECT
  ============================================================ */

  const handleReject =
    async (member) => {
      await updateMembershipStatus(
        member.id,
        member.user_id,
        "rejected"
      );
    };

  /* ============================================================
     REMOVE APPROVED MEMBER
  ============================================================ */

  const removeApprovedMember =
    async (member) => {
      try {
        if (!member?.id) {
          Alert.alert(
            "Hata",
            "Üyelik kaydı bulunamadı."
          );
          return;
        }

        if (!club?.id) {
          Alert.alert(
            "Hata",
            "Kulüp bilgisi bulunamadı."
          );
          return;
        }

        const memberName =
          `${member.first_name || ""} ${member.last_name || ""}`
            .trim() ||
          "Bu kullanıcı";

        let confirmed = false;

        if (
          Platform.OS ===
          "web"
        ) {
          confirmed =
            window.confirm(
              `${memberName} adlı üyeyi kulüpten çıkarmak istediğinize emin misiniz?`
            );
        } else {
          confirmed =
            await new Promise(
              (resolve) => {
                Alert.alert(
                  "Üyeyi Çıkar",
                  `${memberName} adlı üyeyi kulüpten çıkarmak istediğinize emin misiniz?`,
                  [
                    {
                      text: "Vazgeç",
                      style: "cancel",
                      onPress:
                        () =>
                          resolve(
                            false
                          ),
                    },
                    {
                      text: "Üyeyi Çıkar",
                      style: "destructive",
                      onPress:
                        () =>
                          resolve(
                            true
                          ),
                    },
                  ]
                );
              }
            );
        }

        if (!confirmed) {
          return;
        }

        setProcessingUserId(
          member.user_id
        );

        const {
          data,
          error,
        } = await supabase
          .from("club_members")
          .delete()
          .eq(
            "id",
            member.id
          )
          .eq(
            "club_id",
            club.id
          )
          .eq(
            "user_id",
            member.user_id
          )
          .eq(
            "status",
            "approved"
          )
          .select("id")
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error(
            "Üye kulüpten çıkarılamadı. Supabase RLS policy kontrol edilmeli."
          );
        }

        setMembers(
          (currentMembers) =>
            currentMembers.filter(
              (item) =>
                item.id !==
                member.id
            )
        );

        Alert.alert(
          "Başarılı",
          `${memberName} kulüpten çıkarıldı.`
        );

        await loadClubData();

      } catch (error) {
        console.error(
          "REMOVE MEMBER ERROR:",
          error
        );

        Alert.alert(
          "İşlem Başarısız",
          error?.message ||
            "Üye kulüpten çıkarılırken bir hata oluştu."
        );
      } finally {
        setProcessingUserId(
          null
        );
      }
    };

  /* ============================================================
     FILTERS
  ============================================================ */

  const pendingMembers =
    members.filter(
      (member) =>
        member.status ===
        "pending"
    );

  const approvedMembers =
    members.filter(
      (member) =>
        member.status ===
        "approved"
    );

  const rejectedMembers =
    members.filter(
      (member) =>
        member.status ===
        "rejected"
    );

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F8FAFC"
        />

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
            Kulüp bilgileri yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     CLUB NOT FOUND
  ============================================================ */

  if (!club) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={
            styles.errorContainer
          }
        >
          <View
            style={
              styles.errorIconContainer
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color="#DC2626"
            />
          </View>

          <Text
            style={
              styles.errorTitle
            }
          >
            Kulüp bulunamadı
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            Kulüp bilgileri alınamadı.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate(
                "ClubPresidentDashboard"
              )
            }
            style={
              styles.backLargeButton
            }
          >
            <Text
              style={
                styles.backLargeButtonText
              }
            >
              Geri Dön
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     MAIN SCREEN
  ============================================================ */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ========================================================
          SABİT HEADER
      ======================================================== */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "ClubPresidentDashboard"
            )
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
            styles.headerCenter
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Kulüp Detayları
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
            numberOfLines={1}
          >
            {club.club_name ||
              club.name ||
              "Kulüp"}
          </Text>
        </View>

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
            color="#4F46E5"
          />
        </TouchableOpacity>
      </View>

      {/* ========================================================
          SCROLLABLE CONTENT
      ======================================================== */}

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
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
            tintColor="#4F46E5"
          />
        }
      >

        {/* ======================================================
            CLUB HERO
        ====================================================== */}

        <View
          style={styles.clubHero}
        >
          <View
            style={
              styles.clubIcon
            }
          >
            <Ionicons
              name="people"
              size={38}
              color="#4F46E5"
            />
          </View>

          <Text
            style={
              styles.clubName
            }
          >
            {club.club_name ||
              club.name ||
              "Kulüp"}
          </Text>

          <Text
            style={
              styles.clubDescription
            }
          >
            {club.description ||
              "Kulüp açıklaması bulunmuyor."}
          </Text>
        </View>

        {/* ======================================================
            CLUB INFORMATION
        ====================================================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Kulüp Bilgileri
          </Text>

          <View
            style={
              styles.infoCard
            }
          >
            <View
              style={
                styles.infoRow
              }
            >
              <View
                style={
                  styles.infoIcon
                }
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color="#4F46E5"
                />
              </View>

              <View
                style={
                  styles.infoContent
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Kulüp Adı
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {club.club_name ||
                    club.name ||
                    "Belirtilmemiş"}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.infoDivider
              }
            />

            <View
              style={
                styles.infoRow
              }
            >
              <View
                style={
                  styles.infoIcon
                }
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#4F46E5"
                />
              </View>

              <View
                style={
                  styles.infoContent
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  E-posta
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {club.email ||
                    "E-posta belirtilmemiş"}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.infoDivider
              }
            />

            <View
              style={
                styles.infoRow
              }
            >
              <View
                style={
                  styles.infoIcon
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#4F46E5"
                />
              </View>

              <View
                style={
                  styles.infoContent
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Açıklama
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {club.description ||
                    "Açıklama bulunmuyor."}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ======================================================
            PRESIDENT
        ====================================================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Kulüp Başkanı
          </Text>

          <View
            style={
              styles.presidentCard
            }
          >
            <View
              style={
                styles.presidentAvatar
              }
            >
              <Text
                style={
                  styles.presidentAvatarText
                }
              >
                {`${president?.first_name?.charAt(0) || ""}${president?.last_name?.charAt(0) || ""}`
                  .toUpperCase() ||
                  "?"}
              </Text>
            </View>

            <View
              style={
                styles.presidentInfo
              }
            >
              <Text
                style={
                  styles.presidentName
                }
              >
                {president
                  ? `${president.first_name || ""} ${president.last_name || ""}`.trim()
                  : "Başkan bilgisi bulunamadı"}
              </Text>

              {president?.email ? (
                <Text
                  style={
                    styles.presidentEmail
                  }
                >
                  {president.email}
                </Text>
              ) : null}

              {president?.department ? (
                <Text
                  style={
                    styles.presidentDepartment
                  }
                >
                  {president.department}
                </Text>
              ) : null}
            </View>

            <View
              style={
                styles.presidentBadge
              }
            >
              <Ionicons
                name="shield-checkmark"
                size={16}
                color="#4F46E5"
              />

              <Text
                style={
                  styles.presidentBadgeText
                }
              >
                Başkan
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================
            OVERVIEW
        ====================================================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Genel Bakış
          </Text>

          <View
            style={
              styles.statsRow
            }
          >
            <View
              style={
                styles.statCard
              }
            >
              <View
                style={[
                  styles.statIcon,
                  styles.blueIcon,
                ]}
              >
                <Ionicons
                  name="calendar"
                  size={23}
                  color="#2563EB"
                />
              </View>

              <Text
                style={
                  styles.statNumber
                }
              >
                {events.length}
              </Text>

              <Text
                style={
                  styles.statLabel
                }
              >
                Etkinlik
              </Text>
            </View>

            <View
              style={
                styles.statCard
              }
            >
              <View
                style={[
                  styles.statIcon,
                  styles.greenIcon,
                ]}
              >
                <Ionicons
                  name="people"
                  size={23}
                  color="#16A34A"
                />
              </View>

              <Text
                style={
                  styles.statNumber
                }
              >
                {
                  approvedMembers.length
                }
              </Text>

              <Text
                style={
                  styles.statLabel
                }
              >
                Üye
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================
            MEMBERSHIP STATUS
        ====================================================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Üyelik Durumu
          </Text>

          <View
            style={
              styles.statusRow
            }
          >
            <View
              style={[
                styles.statusCard,
                styles.pendingCard,
              ]}
            >
              <Ionicons
                name="time-outline"
                size={24}
                color="#D97706"
              />

              <Text
                style={[
                  styles.statusNumber,
                  styles.pendingNumber,
                ]}
              >
                {
                  pendingMembers.length
                }
              </Text>

              <Text
                style={
                  styles.statusLabel
                }
              >
                Bekleyen
              </Text>
            </View>

            <View
              style={[
                styles.statusCard,
                styles.approvedCard,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color="#16A34A"
              />

              <Text
                style={[
                  styles.statusNumber,
                  styles.approvedNumber,
                ]}
              >
                {
                  approvedMembers.length
                }
              </Text>

              <Text
                style={
                  styles.statusLabel
                }
              >
                Onaylı
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================
            PENDING APPLICATIONS
        ====================================================== */}

        <View
          style={styles.section}
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Bekleyen Üyelik Başvuruları
            </Text>

            <View
              style={
                styles.countBadge
              }
            >
              <Text
                style={
                  styles.countBadgeText
                }
              >
                {
                  pendingMembers.length
                }
              </Text>
            </View>
          </View>

          {pendingMembers.length ===
          0 ? (
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
                  name="checkmark-done-outline"
                  size={32}
                  color="#16A34A"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Bekleyen başvuru yok
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Şu anda onay bekleyen üyelik başvurusu bulunmuyor.
              </Text>
            </View>
          ) : (
            pendingMembers.map(
              (member) => {
                const isProcessing =
                  processingUserId ===
                  member.user_id;

                const initials =
                  `${member.first_name?.charAt(0) || ""}${member.last_name?.charAt(0) || ""}`
                    .toUpperCase();

                return (
                  <View
                    key={
                      member.id
                    }
                    style={
                      styles.memberCard
                    }
                  >
                    <View
                      style={
                        styles.avatar
                      }
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {initials ||
                          "?"}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.memberInfo
                      }
                    >
                      <Text
                        style={
                          styles.memberName
                        }
                      >
                        {member.first_name}{" "}
                        {member.last_name}
                      </Text>

                      <Text
                        style={
                          styles.memberEmail
                        }
                      >
                        {member.email ||
                          "E-posta yok"}
                      </Text>

                      {member.department ? (
                        <Text
                          style={
                            styles.memberDepartment
                          }
                        >
                          {
                            member.department
                          }
                        </Text>
                      ) : null}

                      <View
                        style={
                          styles.pendingBadge
                        }
                      >
                        <Text
                          style={
                            styles.pendingBadgeText
                          }
                        >
                          Onay bekliyor
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.memberActions
                      }
                    >
                      <TouchableOpacity
                        activeOpacity={
                          0.8
                        }
                        disabled={
                          isProcessing
                        }
                        onPress={() =>
                          handleApprove(
                            member
                          )
                        }
                        style={
                          styles.approveButton
                        }
                      >
                        {isProcessing ? (
                          <ActivityIndicator
                            size="small"
                            color="#FFFFFF"
                          />
                        ) : (
                          <Ionicons
                            name="checkmark"
                            size={24}
                            color="#FFFFFF"
                          />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={
                          0.8
                        }
                        disabled={
                          isProcessing
                        }
                        onPress={() =>
                          handleReject(
                            member
                          )
                        }
                        style={
                          styles.rejectButton
                        }
                      >
                        <Ionicons
                          name="close"
                          size={24}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
            )
          )}
        </View>

        {/* ======================================================
            APPROVED MEMBERS
        ====================================================== */}

        <View
          style={styles.section}
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Onaylı Üyeler
            </Text>

            <View
              style={
                styles.greenCountBadge
              }
            >
              <Text
                style={
                  styles.greenCountBadgeText
                }
              >
                {
                  approvedMembers.length
                }
              </Text>
            </View>
          </View>

          {approvedMembers.length ===
          0 ? (
            <View
              style={
                styles.emptySmallCard
              }
            >
              <Ionicons
                name="people-outline"
                size={26}
                color="#94A3B8"
              />

              <Text
                style={
                  styles.emptySmallText
                }
              >
                Henüz onaylı üye bulunmuyor.
              </Text>
            </View>
          ) : (
            approvedMembers.map(
              (member) => {
                const initials =
                  `${member.first_name?.charAt(0) || ""}${member.last_name?.charAt(0) || ""}`
                    .toUpperCase();

                const isRemoving =
                  processingUserId ===
                  member.user_id;

                return (
                  <View
                    key={
                      member.id
                    }
                    style={
                      styles.approvedMemberCard
                    }
                  >
                    <View
                      style={
                        styles.approvedAvatar
                      }
                    >
                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {initials ||
                          "?"}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.approvedMemberInfo
                      }
                    >
                      <Text
                        style={
                          styles.approvedMemberName
                        }
                      >
                        {member.first_name}{" "}
                        {member.last_name}
                      </Text>

                      <Text
                        style={
                          styles.approvedMemberEmail
                        }
                      >
                        {member.email}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.approvedMemberActions
                      }
                    >
                      <View
                        style={
                          styles.approvedBadge
                        }
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color="#16A34A"
                        />

                        <Text
                          style={
                            styles.approvedBadgeText
                          }
                        >
                          Onaylı
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={
                          0.8
                        }
                        disabled={
                          isRemoving
                        }
                        onPress={() =>
                          removeApprovedMember(
                            member
                          )
                        }
                        style={
                          styles.removeMemberButton
                        }
                      >
                        {isRemoving ? (
                          <ActivityIndicator
                            size="small"
                            color="#DC2626"
                          />
                        ) : (
                          <Ionicons
                            name="person-remove-outline"
                            size={18}
                            color="#DC2626"
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }
            )
          )}
        </View>

        {/* ======================================================
            EVENTS
        ====================================================== */}

        <View
          style={styles.section}
        >
          <View
            style={
              styles.sectionHeader
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Etkinlikler
            </Text>

            <View
              style={
                styles.countBadge
              }
            >
              <Text
                style={
                  styles.countBadgeText
                }
              >
                {events.length}
              </Text>
            </View>
          </View>

          {events.length ===
          0 ? (
            <View
              style={
                styles.emptySmallCard
              }
            >
              <Ionicons
                name="calendar-outline"
                size={28}
                color="#94A3B8"
              />

              <Text
                style={
                  styles.emptySmallText
                }
              >
                Bu kulübe ait etkinlik bulunmuyor.
              </Text>
            </View>
          ) : (
            events.map(
              (event) => (
                <View
                  key={
                    event.id
                  }
                  style={
                    styles.eventCard
                  }
                >
                  <View
                    style={
                      styles.eventIcon
                    }
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={22}
                      color="#4F46E5"
                    />
                  </View>

                  <View
                    style={
                      styles.eventInfo
                    }
                  >
                    <Text
                      style={
                        styles.eventTitle
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        event.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.eventDate
                      }
                    >
                      {event.event_date ||
                        "Tarih yok"}

                      {event.event_time
                        ? ` • ${event.event_time.substring(
                            0,
                            5
                          )}`
                        : ""}
                    </Text>

                    {event.location ? (
                      <Text
                        style={
                          styles.eventLocation
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          event.location
                        }
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={
                      event.is_active
                        ? styles.activeBadge
                        : styles.inactiveBadge
                    }
                  >
                    <Text
                      style={
                        event.is_active
                          ? styles.activeBadgeText
                          : styles.inactiveBadgeText
                      }
                    >
                      {event.is_active
                        ? "Aktif"
                        : "Pasif"}
                    </Text>
                  </View>
                </View>
              )
            )
          )}
        </View>

        {/* ======================================================
            REJECTED MEMBERS
        ====================================================== */}

        {rejectedMembers.length >
          0 && (
          <View
            style={
              styles.section
            }
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Reddedilen Başvurular
              </Text>

              <View
                style={
                  styles.rejectedCountBadge
                }
              >
                <Text
                  style={
                    styles.rejectedCountBadgeText
                  }
                >
                  {
                    rejectedMembers.length
                  }
                </Text>
              </View>
            </View>

            {rejectedMembers.map(
              (member) => (
                <View
                  key={
                    member.id
                  }
                  style={
                    styles.rejectedCard
                  }
                >
                  <View
                    style={
                      styles.rejectedAvatar
                    }
                  >
                    <Text
                      style={
                        styles.avatarText
                      }
                    >
                      {`${member.first_name?.charAt(0) || ""}${member.last_name?.charAt(0) || ""}`
                        .toUpperCase() ||
                        "?"}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.rejectedInfo
                    }
                  >
                    <Text
                      style={
                        styles.rejectedName
                      }
                    >
                      {
                        member.first_name
                      }{" "}
                      {
                        member.last_name
                      }
                    </Text>

                    <Text
                      style={
                        styles.rejectedEmail
                      }
                    >
                      {
                        member.email
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.rejectedBadge
                    }
                  >
                    <Text
                      style={
                        styles.rejectedBadgeText
                      }
                    >
                      Reddedildi
                    </Text>
                  </View>
                </View>
              )
            )}
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
};

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    contentContainer: {
      paddingBottom: 40,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      height: 68,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#F8FAFC",
      alignItems: "center",
      justifyContent:
        "center",
    },

    headerCenter: {
      flex: 1,
      alignItems: "center",
      marginHorizontal: 12,
    },

    headerTitle: {
      color: "#0F172A",
      fontSize: 16,
      fontWeight: "800",
    },

    headerSubtitle: {
      color: "#64748B",
      fontSize: 11,
      fontWeight: "600",
      marginTop: 2,
      maxWidth: 180,
    },

    refreshButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
    },

    /* ========================================================
       CLUB HERO
    ======================================================== */

    clubHero: {
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 28,
      paddingBottom: 28,
      backgroundColor:
        "#FFFFFF",
    },

    clubIcon: {
      width: 82,
      height: 82,
      borderRadius: 26,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 14,
    },

    clubName: {
      color: "#0F172A",
      fontSize: 25,
      fontWeight: "800",
      textAlign: "center",
    },

    clubDescription: {
      color: "#64748B",
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 6,
    },

    /* ========================================================
       SECTIONS
    ======================================================== */

    section: {
      paddingHorizontal: 20,
      marginTop: 26,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 12,
    },

    sectionTitle: {
      color: "#0F172A",
      fontSize: 19,
      fontWeight: "800",
      flex: 1,
    },

    /* ========================================================
       CLUB INFO
    ======================================================== */

    infoCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 16,
    },

    infoRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    infoIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    infoContent: {
      flex: 1,
    },

    infoLabel: {
      color: "#94A3B8",
      fontSize: 10,
      fontWeight: "700",
      marginBottom: 3,
    },

    infoValue: {
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "700",
      lineHeight: 19,
    },

    infoDivider: {
      height: 1,
      backgroundColor:
        "#E2E8F0",
      marginVertical: 14,
    },

    /* ========================================================
       PRESIDENT
    ======================================================== */

    presidentCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
    },

    presidentAvatar: {
      width: 52,
      height: 52,
      borderRadius: 17,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    presidentAvatarText: {
      color: "#4F46E5",
      fontSize: 16,
      fontWeight: "800",
    },

    presidentInfo: {
      flex: 1,
      minWidth: 0,
    },

    presidentName: {
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "800",
    },

    presidentEmail: {
      color: "#64748B",
      fontSize: 11,
      marginTop: 3,
    },

    presidentDepartment: {
      color: "#94A3B8",
      fontSize: 10,
      marginTop: 3,
    },

    presidentBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#EEF2FF",
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginLeft: 8,
    },

    presidentBadgeText: {
      color: "#4F46E5",
      fontSize: 9,
      fontWeight: "800",
      marginLeft: 3,
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsRow: {
      flexDirection: "row",
      gap: 12,
    },

    statCard: {
      flex: 1,
      minHeight: 138,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      padding: 16,
      justifyContent:
        "center",
      shadowColor:
        "#000000",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    statIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 8,
    },

    blueIcon: {
      backgroundColor:
        "#EFF6FF",
    },

    greenIcon: {
      backgroundColor:
        "#F0FDF4",
    },

    statNumber: {
      color: "#0F172A",
      fontSize: 26,
      fontWeight: "800",
    },

    statLabel: {
      color: "#64748B",
      fontSize: 11,
      fontWeight: "600",
      marginTop: 2,
    },

    /* ========================================================
       STATUS
    ======================================================== */

    statusRow: {
      flexDirection: "row",
      gap: 12,
    },

    statusCard: {
      flex: 1,
      minHeight: 126,
      borderRadius: 20,
      padding: 16,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
    },

    pendingCard: {
      backgroundColor:
        "#FFFBEB",
      borderColor:
        "#FCD34D",
    },

    approvedCard: {
      backgroundColor:
        "#F0FDF4",
      borderColor:
        "#86EFAC",
    },

    statusNumber: {
      fontSize: 26,
      fontWeight: "800",
    },

    pendingNumber: {
      color: "#D97706",
    },

    approvedNumber: {
      color: "#16A34A",
    },

    statusLabel: {
      color: "#64748B",
      fontSize: 11,
      fontWeight: "600",
      marginTop: 2,
    },

    /* ========================================================
       BADGES
    ======================================================== */

    countBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    countBadgeText: {
      color: "#4F46E5",
      fontSize: 12,
      fontWeight: "800",
    },

    greenCountBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        "#F0FDF4",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    greenCountBadgeText: {
      color: "#16A34A",
      fontSize: 12,
      fontWeight: "800",
    },

    rejectedCountBadge: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor:
        "#FEF2F2",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    rejectedCountBadgeText: {
      color: "#DC2626",
      fontSize: 12,
      fontWeight: "800",
    },

    /* ========================================================
       MEMBERS
    ======================================================== */

    memberCard: {
      minHeight: 112,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor:
        "#000000",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    avatarText: {
      color: "#4F46E5",
      fontSize: 15,
      fontWeight: "800",
    },

    memberInfo: {
      flex: 1,
      minWidth: 0,
    },

    memberName: {
      color: "#0F172A",
      fontSize: 14,
      fontWeight: "800",
      marginBottom: 3,
    },

    memberEmail: {
      color: "#64748B",
      fontSize: 11,
      marginBottom: 2,
    },

    memberDepartment: {
      color: "#94A3B8",
      fontSize: 10,
      marginBottom: 5,
    },

    pendingBadge: {
      alignSelf:
        "flex-start",
      backgroundColor:
        "#FFF7ED",
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 4,
    },

    pendingBadgeText: {
      color: "#D97706",
      fontSize: 9,
      fontWeight: "800",
    },

    memberActions: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
      gap: 7,
    },

    approveButton: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#16A34A",
      alignItems: "center",
      justifyContent:
        "center",
    },

    rejectButton: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
      alignItems: "center",
      justifyContent:
        "center",
    },

    /* ========================================================
       APPROVED MEMBERS
    ======================================================== */

    approvedMemberCard: {
      minHeight: 72,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      padding: 12,
      marginBottom: 9,
      flexDirection: "row",
      alignItems: "center",
      shadowColor:
        "#000000",
      shadowOpacity: 0.03,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 1,
    },

    approvedAvatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#F0FDF4",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    approvedMemberInfo: {
      flex: 1,
      minWidth: 0,
    },

    approvedMemberName: {
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "800",
    },

    approvedMemberEmail: {
      color: "#64748B",
      fontSize: 10,
      marginTop: 3,
    },

    approvedMemberActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginLeft: 8,
    },

    approvedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#F0FDF4",
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },

    approvedBadgeText: {
      color: "#16A34A",
      fontSize: 9,
      fontWeight: "800",
      marginLeft: 3,
    },

    removeMemberButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
      alignItems: "center",
      justifyContent:
        "center",
    },

    /* ========================================================
       EVENTS
    ======================================================== */

    eventCard: {
      minHeight: 78,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      padding: 12,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor:
        "#000000",
      shadowOpacity: 0.03,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 1,
    },

    eventIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    eventInfo: {
      flex: 1,
      minWidth: 0,
    },

    eventTitle: {
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 4,
    },

    eventDate: {
      color: "#64748B",
      fontSize: 10,
      fontWeight: "600",
    },

    eventLocation: {
      color: "#94A3B8",
      fontSize: 10,
      marginTop: 3,
    },

    activeBadge: {
      backgroundColor:
        "#F0FDF4",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 9,
      marginLeft: 6,
    },

    activeBadgeText: {
      color: "#16A34A",
      fontSize: 9,
      fontWeight: "800",
    },

    inactiveBadge: {
      backgroundColor:
        "#F1F5F9",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 9,
      marginLeft: 6,
    },

    inactiveBadgeText: {
      color: "#64748B",
      fontSize: 9,
      fontWeight: "800",
    },

    /* ========================================================
       REJECTED
    ======================================================== */

    rejectedCard: {
      minHeight: 70,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      padding: 12,
      marginBottom: 9,
      flexDirection: "row",
      alignItems: "center",
    },

    rejectedAvatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "#FEF2F2",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    rejectedInfo: {
      flex: 1,
      minWidth: 0,
    },

    rejectedName: {
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "800",
    },

    rejectedEmail: {
      color: "#64748B",
      fontSize: 10,
      marginTop: 3,
    },

    rejectedBadge: {
      backgroundColor:
        "#FEF2F2",
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 10,
      marginLeft: 6,
    },

    rejectedBadgeText: {
      color: "#DC2626",
      fontSize: 9,
      fontWeight: "800",
    },

    /* ========================================================
       EMPTY
    ======================================================== */

    emptyCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      paddingVertical: 30,
      paddingHorizontal: 25,
      alignItems: "center",
    },

    emptyIcon: {
      width: 66,
      height: 66,
      borderRadius: 22,
      backgroundColor:
        "#F0FDF4",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 12,
    },

    emptyTitle: {
      color: "#0F172A",
      fontSize: 15,
      fontWeight: "800",
      marginBottom: 5,
    },

    emptyText: {
      color: "#64748B",
      fontSize: 12,
      lineHeight: 18,
      textAlign: "center",
    },

    emptySmallCard: {
      minHeight: 80,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      alignItems: "center",
      justifyContent:
        "center",
      padding: 18,
    },

    emptySmallText: {
      color: "#94A3B8",
      fontSize: 12,
      textAlign: "center",
      marginTop: 7,
    },

    /* ========================================================
       LOADING
    ======================================================== */

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
    },

    loadingText: {
      color: "#64748B",
      fontSize: 14,
      fontWeight: "600",
      marginTop: 12,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    errorIconContainer: {
      width: 78,
      height: 78,
      borderRadius: 26,
      backgroundColor:
        "#FEF2F2",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 18,
    },

    errorTitle: {
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 8,
    },

    errorText: {
      color: "#64748B",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 20,
    },

    backLargeButton: {
      height: 48,
      paddingHorizontal: 24,
      borderRadius: 14,
      backgroundColor:
        "#4F46E5",
      alignItems: "center",
      justifyContent:
        "center",
    },

    backLargeButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },

    bottomSpacing: {
      height: 30,
    },
  });

export default ClubPresidentClubDetailScreen;
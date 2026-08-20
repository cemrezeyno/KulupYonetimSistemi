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

import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../config/supabase";

export default function AdminUserDetailScreen({
  route,
  navigation,
}) {
  const user = route?.params?.user;

  const [clubs, setClubs] = useState([]);

  const [memberClubIds, setMemberClubIds] =
    useState([]);

  const [presidentClub, setPresidentClub] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [savingClubId, setSavingClubId] =
    useState(null);

  const [savingPresident, setSavingPresident] =
    useState(false);

  /*
   * =====================================================
   * VERİLERİ YÜKLE
   * =====================================================
   */

  const loadData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      /*
       * TÜM KULÜPLER
       */

      const {
        data: clubsData,
        error: clubsError,
      } = await supabase
        .from("club")
        .select(
          "id, club_name, president_id"
        )
        .order("club_name", {
          ascending: true,
        });

      if (clubsError) {
        throw clubsError;
      }

      /*
       * KULLANICININ ÜYELİKLERİ
       */

      const {
        data: membershipsData,
        error: membershipsError,
      } = await supabase
        .from("club_members")
        .select("club_id")
        .eq(
          "user_id",
          user.id
        );

      if (membershipsError) {
        throw membershipsError;
      }

      const loadedClubs =
        clubsData || [];

      const loadedMemberIds =
        (membershipsData || []).map(
          (item) => item.club_id
        );

      setClubs(loadedClubs);

      setMemberClubIds(
        loadedMemberIds
      );

      /*
       * KULLANICININ BAŞKANI OLDUĞU
       * KULÜP
       */

      const currentPresidentClub =
        loadedClubs.find(
          (club) =>
            club.president_id ===
            user.id
        );

      setPresidentClub(
        currentPresidentClub || null
      );
    } catch (error) {
      console.error(
        "LOAD USER DETAIL ERROR:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Kullanıcı bilgileri yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  /*
   * =====================================================
   * KULÜP ÜYELİĞİ AÇ / KAPAT
   * =====================================================
   */

  const handleToggleClub = async (
    clubId
  ) => {
    if (
      !user?.id ||
      savingClubId
    ) {
      return;
    }

    const isMember =
      memberClubIds.includes(
        clubId
      );

    try {
      setSavingClubId(clubId);

      /*
       * ÜYELİKTEN ÇIKAR
       */

      if (isMember) {
        if (
          presidentClub &&
          presidentClub.id ===
            clubId
        ) {
          Alert.alert(
            "İşlem yapılamadı",
            "Kulüp başkanı önce başkanlıktan ayrılmalıdır."
          );

          return;
        }

        const {
          error,
        } = await supabase
          .from("club_members")
          .delete()
          .eq(
            "club_id",
            clubId
          )
          .eq(
            "user_id",
            user.id
          );

        if (error) {
          throw error;
        }

        setMemberClubIds(
          (current) =>
            current.filter(
              (id) =>
                id !== clubId
            )
        );

        return;
      }

      /*
       * KULÜBE EKLE
       */

      const {
        error,
      } = await supabase
        .from("club_members")
        .upsert(
          {
            club_id: clubId,
            user_id: user.id,
          },
          {
            onConflict:
              "club_id,user_id",
          }
        );

      if (error) {
        throw error;
      }

      setMemberClubIds(
        (current) => [
          ...current,
          clubId,
        ]
      );
    } catch (error) {
      console.error(
        "TOGGLE CLUB MEMBERSHIP ERROR:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Kulüp üyeliği güncellenemedi."
      );
    } finally {
      setSavingClubId(null);
    }
  };

  /*
   * =====================================================
   * BAŞKAN YAP
   * =====================================================
   */

  const handleMakePresident = async (
    club
  ) => {
    if (
      !user?.id ||
      !club?.id ||
      savingPresident
    ) {
      return;
    }

    /*
     * ANA ADMİN BAŞKAN OLAMAZ
     */

    if (user.role_id === 1) {
      Alert.alert(
        "İşlem yapılamadı",
        "Ana Admin kulüp başkanı olarak atanamaz."
      );

      return;
    }

    /*
     * KULLANICI ZATEN BAŞKAN
     */

    if (
      presidentClub &&
      presidentClub.id !==
        club.id
    ) {
      Alert.alert(
        "İşlem yapılamadı",
        `Bu kullanıcı zaten "${presidentClub.club_name}" kulübünün başkanı.`
      );

      return;
    }

    /*
     * KULÜBÜN BAŞKANI VAR MI?
     */

    if (
      club.president_id &&
      club.president_id !==
        user.id
    ) {
      Alert.alert(
        "İşlem yapılamadı",
        "Bu kulübün zaten bir başkanı bulunuyor."
      );

      return;
    }

    try {
      setSavingPresident(true);

      /*
       * ÖNCE KULÜBE ÜYE YAP
       */

      const {
        error: membershipError,
      } = await supabase
        .from("club_members")
        .upsert(
          {
            club_id: club.id,
            user_id: user.id,
          },
          {
            onConflict:
              "club_id,user_id",
          }
        );

      if (membershipError) {
        throw membershipError;
      }

      /*
       * ROLE = 3
       */

      const {
        error: userError,
      } = await supabase
        .from("users")
        .update({
          role_id: 3,
        })
        .eq(
          "id",
          user.id
        );

      if (userError) {
        throw userError;
      }

      /*
       * KULÜP BAŞKANI
       */

      const {
        error: clubError,
      } = await supabase
        .from("club")
        .update({
          president_id:
            user.id,
        })
        .eq(
          "id",
          club.id
        );

      if (clubError) {
        throw clubError;
      }

      Alert.alert(
        "Başarılı",
        `${user.first_name || ""} ${
          user.last_name || ""
        } artık ${club.club_name} kulübünün başkanı.`
      );

      await loadData();
    } catch (error) {
      console.error(
        "MAKE PRESIDENT ERROR:",
        error
      );

      Alert.alert(
        "Hata",
        error?.message ||
          "Kulüp başkanı atanamadı."
      );
    } finally {
      setSavingPresident(false);
    }
  };

  /*
   * =====================================================
   * BAŞKANLIĞI KALDIR
   * =====================================================
   */

 const handleRemovePresident = async () => {
  console.log(
    "REMOVE PRESIDENT BUTTON PRESSED"
  );

  console.log(
    "President club:",
    presidentClub
  );

  console.log(
    "User:",
    user
  );

  if (
    !user?.id ||
    !presidentClub?.id ||
    savingPresident
  ) {
    console.log(
      "REMOVE PRESIDENT BLOCKED"
    );

    return;
  }

  try {
    setSavingPresident(true);

    /*
     * =================================================
     * 1. KULÜP BAŞKANLIĞINI KALDIR
     * =================================================
     */

    console.log(
      "Removing president from club:",
      presidentClub.id
    );

    const {
      data: clubData,
      error: clubError,
    } = await supabase
      .from("club")
      .update({
        president_id: null,
      })
      .eq(
        "id",
        presidentClub.id
      )
      .eq(
        "president_id",
        user.id
      )
      .select();

    console.log(
      "Club update result:",
      clubData,
      clubError
    );

    if (clubError) {
      throw clubError;
    }

    /*
     * =================================================
     * 2. KULLANICIYI TEKRAR ÜYE YAP
     * =================================================
     */

    console.log(
      "Changing user role to Member:",
      user.id
    );

    const {
      data: userData,
      error: userError,
    } = await supabase
      .from("users")
      .update({
        role_id: 2,
      })
      .eq(
        "id",
        user.id
      )
      .select();

    console.log(
      "User role update result:",
      userData,
      userError
    );

    if (userError) {
      throw userError;
    }

    /*
     * =================================================
     * 3. EKRAN STATE'İNİ GÜNCELLE
     * =================================================
     */

    setPresidentClub(null);

    /*
     * Kullanıcı hâlâ kulüp üyesi.
     * Sadece başkanlığı kaldırıldı.
     */

    Alert.alert(
      "Başarılı",
      "Kulüp başkanlığı kaldırıldı."
    );

    /*
     * Güncel verileri tekrar yükle
     */

    await loadData();

  } catch (error) {
    console.error(
      "REMOVE PRESIDENT ERROR:",
      error
    );

    Alert.alert(
      "Hata",
      error?.message ||
        "Kulüp başkanlığı kaldırılamadı."
    );
  } finally {
    setSavingPresident(false);
  }
};

  const confirmRemovePresident =
    async () => {
      try {
        setSavingPresident(true);

        /*
         * BAŞKANLIĞI KALDIR
         */

        const {
          error: clubError,
        } = await supabase
          .from("club")
          .update({
            president_id: null,
          })
          .eq(
            "id",
            presidentClub.id
          )
          .eq(
            "president_id",
            user.id
          );

        if (clubError) {
          throw clubError;
        }

        /*
         * ROLE = 2
         */

        const {
          error: userError,
        } = await supabase
          .from("users")
          .update({
            role_id: 2,
          })
          .eq(
            "id",
            user.id
          );

        if (userError) {
          throw userError;
        }

        Alert.alert(
          "Başarılı",
          "Kulüp başkanlığı kaldırıldı."
        );

        await loadData();
      } catch (error) {
        console.error(
          "REMOVE PRESIDENT ERROR:",
          error
        );

        Alert.alert(
          "Hata",
          error?.message ||
            "Başkanlık kaldırılamadı."
        );
      } finally {
        setSavingPresident(false);
      }
    };

  /*
   * =====================================================
   * ROL ADI
   * =====================================================
   */

  const getRoleName = () => {
    if (user?.role_id === 1) {
      return "Ana Admin";
    }

    if (user?.role_id === 3) {
      return "Kulüp Başkanı";
    }

    return "Üye";
  };

  /*
   * =====================================================
   * ROL RENGİ
   * =====================================================
   */

  const getRoleColor = () => {
    if (user?.role_id === 1) {
      return "#7C3AED";
    }

    if (user?.role_id === 3) {
      return "#F59E0B";
    }

    return "#2563EB";
  };

  /*
   * =====================================================
   * KULLANICI YOK
   * =====================================================
   */

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="person-outline"
            size={45}
            color="#94A3B8"
          />

          <Text style={styles.emptyText}>
            Kullanıcı bulunamadı.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            Kullanıcı bilgileri yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const roleColor =
    getRoleColor();

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

          <Text style={styles.headerTitle}>
            Kullanıcı Detayı
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* PROFİL */}

        <View style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  roleColor + "15",
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  color: roleColor,
                },
              ]}
            >
              {(
                (user.first_name
                  ?.charAt(0) ||
                  "") +
                (user.last_name
                  ?.charAt(0) ||
                  "")
              ).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.name}>
            {user.first_name || ""}{" "}
            {user.last_name || ""}
          </Text>

          <Text style={styles.email}>
            {user.email ||
              "E-posta yok"}
          </Text>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    roleColor + "15",
                },
              ]}
            >
              <Text
                style={[
                  styles.roleText,
                  {
                    color: roleColor,
                  },
                ]}
              >
                {getRoleName()}
              </Text>
            </View>
          </View>
        </View>

        {/* KİŞİSEL BİLGİLER */}

        <Text style={styles.sectionTitle}>
          Kişisel Bilgiler
        </Text>

        <View style={styles.infoCard}>
          <InfoRow
            icon="school-outline"
            title="Fakülte"
            value={
              user.faculty ||
              "Belirtilmemiş"
            }
          />

          <InfoRow
            icon="book-outline"
            title="Bölüm"
            value={
              user.department ||
              "Belirtilmemiş"
            }
          />

          <InfoRow
            icon="calendar-outline"
            title="Sınıf"
            value={
              user.class_year ||
              "Belirtilmemiş"
            }
            last
          />
        </View>

        {/* BAŞKANLIK */}

        <Text style={styles.sectionTitle}>
          Başkanlık Yönetimi
        </Text>

        {user.role_id === 1 ? (
          <View style={styles.adminWarningCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#7C3AED"
            />

            <Text style={styles.adminWarningText}>
              Ana Admin kullanıcıları
              kulüp başkanı olarak
              atanamaz.
            </Text>
          </View>
        ) : presidentClub ? (
          <View>
            <View
              style={
                styles.currentPresidentCard
              }
            >
              <View
                style={
                  styles.currentPresidentIcon
                }
              >
                <Ionicons
                  name="ribbon"
                  size={24}
                  color="#F59E0B"
                />
              </View>

              <View
                style={
                  styles.currentPresidentInfo
                }
              >
                <Text
                  style={
                    styles.currentPresidentLabel
                  }
                >
                  Kulüp Başkanı
                </Text>

                <Text
                  style={
                    styles.currentPresidentName
                  }
                >
                  {
                    presidentClub.club_name
                  }
                </Text>
              </View>

              {savingPresident ? (
                <ActivityIndicator
                  size="small"
                  color="#DC2626"
                />
              ) : (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={
                    handleRemovePresident
                  }
                  style={
                    styles.removePresidentButton
                  }
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color="#DC2626"
                  />
                </TouchableOpacity>
              )}
            </View>

            <Text
              style={
                styles.removePresidentHint
              }
            >
              Başkanlığı kaldırmak için
              sağdaki X butonuna basın.
            </Text>
          </View>
        ) : (
          <View>
            <Text
              style={
                styles.presidentDescription
              }
            >
              Bu kullanıcı henüz bir
              kulübün başkanı değil.
              Aşağıdaki kulüplerden
              birini seçerek başkan
              olarak atayabilirsiniz.
            </Text>

            {clubs.length > 0 ? (
              <View
                style={
                  styles.presidentClubList
                }
              >
                {clubs.map((club) => {
                  const anotherPresident =
                    club.president_id &&
                    club.president_id !==
                      user.id;

                  return (
                    <TouchableOpacity
                      key={club.id}
                      activeOpacity={0.8}
                      disabled={
                        savingPresident ||
                        anotherPresident
                      }
                      onPress={() =>
                        handleMakePresident(
                          club
                        )
                      }
                      style={[
                        styles.presidentClubOption,
                        anotherPresident &&
                          styles.disabledPresidentClub,
                      ]}
                    >
                      <View
                        style={
                          styles.presidentClubIcon
                        }
                      >
                        <Ionicons
                          name="people"
                          size={21}
                          color={
                            anotherPresident
                              ? "#CBD5E1"
                              : "#7C3AED"
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.presidentClubInfo
                        }
                      >
                        <Text
                          style={[
                            styles.presidentClubName,
                            anotherPresident &&
                              styles.disabledText,
                          ]}
                        >
                          {
                            club.club_name
                          }
                        </Text>

                        <Text
                          style={
                            styles.presidentClubStatus
                          }
                        >
                          {anotherPresident
                            ? "Başkanı mevcut"
                            : "Başkan olarak ata"}
                        </Text>
                      </View>

                      {savingPresident &&
                      !anotherPresident ? (
                        <ActivityIndicator
                          size="small"
                          color="#7C3AED"
                        />
                      ) : (
                        <Ionicons
                          name={
                            anotherPresident
                              ? "lock-closed-outline"
                              : "chevron-forward"
                          }
                          size={19}
                          color="#CBD5E1"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noClubCard}>
                <Text style={styles.noClubText}>
                  Sistemde henüz kulüp
                  bulunmuyor.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* KULÜP ÜYELİKLERİ */}

        <Text style={styles.sectionTitle}>
          Kulüp Üyelikleri
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="people-outline"
              size={24}
              color="#2563EB"
            />
          </View>

          <View>
            <Text style={styles.summaryNumber}>
              {memberClubIds.length}
            </Text>

            <Text style={styles.summaryLabel}>
              kulübe kayıtlı
            </Text>
          </View>
        </View>

        {clubs.length > 0 ? (
          <View style={styles.clubList}>
            {clubs.map((club) => {
              const isMember =
                memberClubIds.includes(
                  club.id
                );

              const saving =
                savingClubId ===
                club.id;

              return (
                <TouchableOpacity
                  key={club.id}
                  activeOpacity={0.8}
                  disabled={
                    !!savingClubId
                  }
                  onPress={() =>
                    handleToggleClub(
                      club.id
                    )
                  }
                  style={[
                    styles.clubOption,
                    isMember &&
                      styles.selectedClubOption,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      isMember &&
                        styles.selectedOptionIcon,
                    ]}
                  >
                    <Ionicons
                      name="people"
                      size={21}
                      color={
                        isMember
                          ? "#FFFFFF"
                          : "#7C3AED"
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.optionContent
                    }
                  >
                    <Text
                      style={
                        styles.optionTitle
                      }
                    >
                      {club.club_name}
                    </Text>

                    <Text
                      style={
                        styles.optionDescription
                      }
                    >
                      {isMember
                        ? "Üye"
                        : "Kulübe ekle"}
                    </Text>
                  </View>

                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#2563EB"
                    />
                  ) : (
                    <Ionicons
                      name={
                        isMember
                          ? "checkmark-circle"
                          : "add-circle-outline"
                      }
                      size={22}
                      color={
                        isMember
                          ? "#16A34A"
                          : "#CBD5E1"
                      }
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.noClubCard}>
            <Text style={styles.noClubText}>
              Sistemde henüz kulüp
              bulunmuyor.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =====================================================
 * INFO ROW
 * =====================================================
 */

function InfoRow({
  icon,
  title,
  value,
  last = false,
}) {
  return (
    <View
      style={[
        styles.infoRow,
        !last && styles.infoBorder,
      ]}
    >
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
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

  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#64748B",
    marginTop: 10,
    fontSize: 14,
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  profileCard: {
    margin: 20,
    padding: 25,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
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
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 25,
    fontWeight: "800",
  },

  name: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "800",
  },

  email: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 5,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 13,
  },

  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  roleText: {
    fontSize: 11,
    fontWeight: "800",
  },

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 13,
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
  },

  infoCard: {
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  infoRow: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
  },

  infoBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 3,
  },

  infoValue: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },

  presidentDescription: {
    marginHorizontal: 20,
    marginBottom: 12,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
  },

  presidentClubList: {
    marginHorizontal: 20,
  },

  presidentClubOption: {
    minHeight: 70,
    marginBottom: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  disabledPresidentClub: {
    backgroundColor: "#F8FAFC",
    opacity: 0.65,
  },

  presidentClubIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  presidentClubInfo: {
    flex: 1,
  },

  presidentClubName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  presidentClubStatus: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  disabledText: {
    color: "#94A3B8",
  },

  currentPresidentCard: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    flexDirection: "row",
    alignItems: "center",
  },

  currentPresidentIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  currentPresidentInfo: {
    flex: 1,
  },

  currentPresidentLabel: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },

  currentPresidentName: {
    color: "#78350F",
    fontSize: 15,
    fontWeight: "800",
  },

  removePresidentButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  removePresidentHint: {
    marginHorizontal: 20,
    marginTop: 7,
    color: "#94A3B8",
    fontSize: 11,
  },

  adminWarningCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    flexDirection: "row",
    alignItems: "center",
  },

  adminWarningText: {
    flex: 1,
    marginLeft: 10,
    color: "#6D28D9",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  summaryCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  summaryNumber: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },

  clubList: {
    marginHorizontal: 20,
    marginTop: 10,
  },

  clubOption: {
    minHeight: 70,
    marginBottom: 10,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  selectedClubOption: {
    borderColor: "#C7D2FE",
    backgroundColor: "#F8FAFF",
  },

  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  selectedOptionIcon: {
    backgroundColor: "#7C3AED",
  },

  optionContent: {
    flex: 1,
  },

  optionTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  optionDescription: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  noClubCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  noClubText: {
    color: "#94A3B8",
    fontSize: 13,
  },

  bottomSpacing: {
    height: 30,
  },
});
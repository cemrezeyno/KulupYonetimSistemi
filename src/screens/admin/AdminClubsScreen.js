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

import {
  getCurrentUserRole,
  getManagedClubs,
  isMainAdmin,
} from "../../services/adminService";

export default function AdminClubsScreen({
  navigation,
}) {
  const [clubs, setClubs] =
    useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * =====================================================
   * KULÜPLERİ YÜKLE
   * =====================================================
   */

  const loadClubs = async () => {
    try {
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
        setClubs([]);
        setCurrentUser(null);
        return;
      }

      /*
       * GİRİŞ YAPAN KULLANICI
       */

      const user =
        await getCurrentUserRole(
          session
        );

      if (!user) {
        setClubs([]);
        setCurrentUser(null);
        return;
      }

      setCurrentUser(user);

      /*
       * YETKİLİ OLUNAN KULÜPLER
       */

      const managedClubs =
        await getManagedClubs(
          user
        );

      if (
        !managedClubs ||
        managedClubs.length === 0
      ) {
        setClubs([]);
        return;
      }

      /*
       * BAŞKAN ID'LERİ
       */

      const presidentIds =
        managedClubs
          .map(
            (club) =>
              club.president_id
          )
          .filter(Boolean);

      let presidents = [];

      /*
       * BAŞKAN BİLGİLERİ
       */

      if (
        presidentIds.length > 0
      ) {
        const {
          data: presidentData,
          error: presidentError,
        } = await supabase
          .from("users")
          .select(`
            id,
            first_name,
            last_name,
            email
          `)
          .in(
            "id",
            presidentIds
          );

        if (presidentError) {
          throw presidentError;
        }

        presidents =
          presidentData || [];
      }

      /*
       * BAŞKAN MAP
       */

      const presidentMap = {};

      presidents.forEach(
        (president) => {
          presidentMap[
            president.id
          ] = president;
        }
      );

      /*
       * KULÜPLERİ HAZIRLA
       */

      setClubs(
        managedClubs.map(
          (club) => ({
            ...club,
            president:
              presidentMap[
                club.president_id
              ] || null,
          })
        )
      );
    } catch (error) {
      console.error(
        "Admin clubs error:",
        error
      );

      Alert.alert(
        "Hata",
        error.message ||
          "Kulüpler yüklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * =====================================================
   * İLK YÜKLEME
   * =====================================================
   */

  useEffect(() => {
    loadClubs();
  }, []);

  /*
   * =====================================================
   * YENİLE
   * =====================================================
   */

  const onRefresh = () => {
    setRefreshing(true);
    loadClubs();
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
      {/* =================================================
          SABİT HEADER
      ================================================= */}

      <View
        style={styles.header}
      >
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

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.title}
          >
            Kulüp Yönetimi
          </Text>

          <Text
            style={styles.subtitle}
          >
            {clubs.length} kulüp
          </Text>
        </View>

        <View
          style={styles.headerIcon}
        >
          <Ionicons
            name="people-circle"
            size={24}
            color="#7C3AED"
          />
        </View>
      </View>

      {/* =================================================
          KAYAN İÇERİK
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[
              "#2563EB",
            ]}
          />
        }
      >
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

              <View
                style={
                  styles.adminInfoContent
                }
              >
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
                  Tüm kulüpleri
                  yönetiyorsunuz.
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

              <View
                style={
                  styles.adminInfoContent
                }
              >
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
                  Yalnızca başkanı
                  olduğunuz kulübü
                  yönetiyorsunuz.
                </Text>
              </View>
            </View>
          )}

        {/* YENİ KULÜP */}

        {currentUser &&
          isMainAdmin(
            currentUser
          ) && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={
                styles.addButton
              }
              onPress={() =>
                navigation.navigate(
                  "AdminCreateClub"
                )
              }
            >
              <View
                style={
                  styles.addIcon
                }
              >
                <Ionicons
                  name="add"
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.addContent
                }
              >
                <Text
                  style={
                    styles.addTitle
                  }
                >
                  Yeni Kulüp Oluştur
                </Text>

                <Text
                  style={
                    styles.addDescription
                  }
                >
                  Sisteme yeni bir
                  üniversite kulübü
                  ekle
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}

        {/* KULÜPLER */}

        <Text
          style={styles.sectionTitle}
        >
          {currentUser?.role_id ===
          3
            ? "Yönettiğim Kulüp"
            : "Kulüpler"}
        </Text>

        {clubs.length > 0 ? (
          clubs.map(
            (club) => (
              <TouchableOpacity
                key={club.id}
                activeOpacity={0.85}
                style={
                  styles.clubCard
                }
                onPress={() =>
                  navigation.navigate(
                    "AdminClubDetail",
                    {
                      club,
                    }
                  )
                }
              >
                {/* İKON */}

                <View
                  style={
                    styles.clubIcon
                  }
                >
                  <Ionicons
                    name="people"
                    size={25}
                    color="#7C3AED"
                  />
                </View>

                {/* BİLGİ */}

                <View
                  style={
                    styles.clubInfo
                  }
                >
                  <Text
                    style={
                      styles.clubName
                    }
                    numberOfLines={1}
                  >
                    {
                      club.club_name
                    }
                  </Text>

                  <Text
                    style={
                      styles.clubDescription
                    }
                    numberOfLines={2}
                  >
                    {club.description ||
                      "Açıklama bulunmuyor."}
                  </Text>

                  {/* BAŞKAN */}

                  <View
                    style={
                      styles.presidentRow
                    }
                  >
                    <Ionicons
                      name="ribbon-outline"
                      size={14}
                      color="#F59E0B"
                    />

                    <Text
                      style={
                        styles.presidentText
                      }
                      numberOfLines={1}
                    >
                      Başkan:{" "}
                      {club.president
                        ? `${club.president.first_name} ${club.president.last_name}`
                        : "Atanmadı"}
                    </Text>
                  </View>

                  {/* EMAIL */}

                  {club.email && (
                    <Text
                      style={
                        styles.clubEmail
                      }
                      numberOfLines={1}
                    >
                      {club.email}
                    </Text>
                  )}
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#CBD5E1"
                />
              </TouchableOpacity>
            )
          )
        ) : (
          <View
            style={styles.emptyCard}
          >
            <View
              style={styles.emptyIcon}
            >
              <Ionicons
                name="people-outline"
                size={38}
                color="#94A3B8"
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              {currentUser?.role_id ===
              3
                ? "Yönettiğiniz kulüp yok"
                : "Henüz kulüp yok"}
            </Text>

            <Text
              style={styles.emptyText}
            >
              {currentUser?.role_id ===
              3
                ? "Henüz size atanmış bir kulüp bulunmuyor."
                : "İlk kulübü oluşturmak için yukarıdaki butonu kullanabilirsiniz."}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingTop: 18,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /*
   * HEADER
   */

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
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * ANA ADMİN
   */

  adminInfoCard: {
    marginHorizontal: 20,
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

  adminInfoContent: {
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
  },

  /*
   * BAŞKAN
   */

  presidentInfoCard: {
    marginHorizontal: 20,
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

  presidentInfoTitle: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "800",
  },

  presidentInfoText: {
    color: "#B45309",
    fontSize: 11,
    marginTop: 3,
  },

  /*
   * YENİ KULÜP
   */

  addButton: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
  },

  addIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  addContent: {
    flex: 1,
  },

  addTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  addDescription: {
    color: "#EDE9FE",
    fontSize: 11,
    lineHeight: 17,
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
   * KULÜP
   */

  clubCard: {
    marginHorizontal: 20,
    marginBottom: 14,
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

  clubIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  clubInfo: {
    flex: 1,
    minWidth: 0,
  },

  clubName: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  clubDescription: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  /*
   * BAŞKAN SATIRI
   */

  presidentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  presidentText: {
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
    flex: 1,
  },

  clubEmail: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 5,
  },

  /*
   * BOŞ DURUM
   */

  emptyCard: {
    marginHorizontal: 20,
    paddingVertical: 45,
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
    textAlign: "center",
  },

  bottomSpacing: {
    height: 30,
  },
});
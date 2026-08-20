import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
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

export default function ClubPresidentMembershipsScreen({
  navigation,
}) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /*
   * =====================================================
   * KULLANICININ ÜYE OLDUĞU KULÜPLERİ YÜKLE
   * =====================================================
   */

  const loadMemberships = useCallback(
    async () => {
      try {
        if (!refreshing) {
          setLoading(true);
        }

        /*
         * Oturumdaki kullanıcıyı al
         */

        const {
          data: {
            user,
          },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user?.id) {
          throw new Error(
            "Oturum açmış kullanıcı bulunamadı."
          );
        }

        /*
         * =================================================
         * 1. KULLANICININ ONAYLANMIŞ ÜYELİKLERİ
         * =================================================
         */

        const {
          data: memberships,
          error: membershipsError,
        } = await supabase
          .from("club_members")
          .select(
            `
              club_id,
              status,
              joined_at
            `
          )
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "status",
            "approved"
          )
          .order(
            "joined_at",
            {
              ascending: true,
            }
          );

        if (membershipsError) {
          throw membershipsError;
        }

        /*
         * Hiç üyelik yoksa
         */

        if (
          !memberships ||
          memberships.length === 0
        ) {
          setClubs([]);
          return;
        }

        /*
         * Üye olunan kulüp ID'lerini al
         */

        const clubIds =
          memberships.map(
            (item) => item.club_id
          );

        /*
         * =================================================
         * 2. KULÜP BİLGİLERİNİ AL
         * =================================================
         */

        const {
          data: clubsData,
          error: clubsError,
        } = await supabase
          .from("club")
          .select(
            `
              id,
              club_name,
              description,
              email,
              president_id
            `
          )
          .in(
            "id",
            clubIds
          )
          .order(
            "club_name",
            {
              ascending: true,
            }
          );

        if (clubsError) {
          throw clubsError;
        }

        /*
         * =================================================
         * 3. ÜYELİK BİLGİSİ + KULÜP BİLGİSİNİ BİRLEŞTİR
         * =================================================
         */

        const membershipMap =
          new Map(
            memberships.map(
              (membership) => [
                membership.club_id,
                membership,
              ]
            )
          );

        const mergedClubs =
          (clubsData || []).map(
            (club) => {
              const membership =
                membershipMap.get(
                  club.id
                );

              return {
                ...club,

                joined_at:
                  membership?.joined_at ||
                  null,

                membership_status:
                  membership?.status ||
                  "approved",

                isPresident:
                  club.president_id ===
                  user.id,
              };
            }
          );

        setClubs(
          mergedClubs
        );
      } catch (error) {
        console.error(
          "Club memberships loading error:",
          error
        );

        Alert.alert(
          "Hata",
          error?.message ||
            "Üye olduğunuz kulüpler yüklenemedi."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [refreshing]
  );

  /*
   * =====================================================
   * INITIAL LOAD
   * =====================================================
   */

  useEffect(() => {
    loadMemberships();
  }, []);

  /*
   * =====================================================
   * REFRESH
   * =====================================================
   */

  const handleRefresh = () => {
    setRefreshing(true);
    loadMemberships();
  };

  /*
   * =====================================================
   * KULÜP DETAY
   * =====================================================
   */

  const handleClubPress = (
    club
  ) => {
    navigation.navigate(
      "ClubDetail",
      {
        club,
      }
    );
  };

  /*
   * =====================================================
   * TARİH FORMATLAMA
   * =====================================================
   */

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
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
      return "-";
    }
  };

  /*
   * =====================================================
   * TABLE ROW
   * =====================================================
   */

  const renderClub = ({
    item,
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          handleClubPress(item)
        }
        style={styles.tableRow}
      >
        {/* KULÜP */}

        <View
          style={[
            styles.clubColumn,
            styles.cell,
          ]}
        >
          <View
            style={styles.clubIcon}
          >
            <Ionicons
              name="people"
              size={18}
              color="#4F46E5"
            />
          </View>

          <View
            style={styles.clubNameContainer}
          >
            <Text
              style={styles.clubName}
              numberOfLines={2}
            >
              {item.club_name}
            </Text>

            <Text
              style={styles.joinDate}
              numberOfLines={1}
            >
              {formatDate(
                item.joined_at
              )}
            </Text>
          </View>
        </View>

        {/* ROL */}

        <View
          style={[
            styles.roleColumn,
            styles.cell,
          ]}
        >
          {item.isPresident ? (
            <View
              style={
                styles.presidentBadge
              }
            >
              <Ionicons
                name="ribbon"
                size={13}
                color="#B45309"
              />

              <Text
                style={
                  styles.presidentBadgeText
                }
              >
                Başkan
              </Text>
            </View>
          ) : (
            <View
              style={styles.memberBadge}
            >
              <Ionicons
                name="person"
                size={12}
                color="#4F46E5"
              />

              <Text
                style={
                  styles.memberBadgeText
                }
              >
                Üye
              </Text>
            </View>
          )}
        </View>

        {/* DURUM */}

        <View
          style={[
            styles.statusColumn,
            styles.cell,
          ]}
        >
          <View
            style={styles.statusBadge}
          >
            <View
              style={
                styles.statusDot
              }
            />

            <Text
              style={
                styles.statusText
              }
            >
              Aktif
            </Text>
          </View>
        </View>

        {/* ARROW */}

        <View
          style={styles.arrowColumn}
        >
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#CBD5E1"
          />
        </View>
      </TouchableOpacity>
    );
  };

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (
    loading &&
    !refreshing
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}
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
            Üyelikler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =====================================================
   * SCREEN
   * =====================================================
   */

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <View
        style={styles.container}
      >
        {/* ================================================= */}
        {/* SABİT HEADER */}
        {/* ================================================= */}

        <View
          style={styles.header}
        >
          <View
            style={styles.headerLeft}
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
                styles.headerTextContainer
              }
            >
              <Text
                style={
                  styles.eyebrow
                }
              >
                KULÜPLERİM
              </Text>

              <Text
                style={styles.title}
                numberOfLines={1}
              >
                Üye Olduğum Kulüpler
              </Text>

              <Text
                style={
                  styles.subtitle
                }
                numberOfLines={1}
              >
                Üyesi olduğunuz kulüpler
              </Text>
            </View>
          </View>

          <View
            style={styles.headerIcon}
          >
            <Ionicons
              name="people"
              size={23}
              color="#4F46E5"
            />
          </View>
        </View>

        {/* ================================================= */}
        {/* ÖZET */}
        {/* ================================================= */}

        <View
          style={styles.summaryCard}
        >
          <View
            style={styles.summaryIcon}
          >
            <Ionicons
              name="people-outline"
              size={25}
              color="#4F46E5"
            />
          </View>

          <View>
            <Text
              style={
                styles.summaryNumber
              }
            >
              {clubs.length}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              üye olduğunuz kulüp
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* TABLO */}
        {/* ================================================= */}

        {clubs.length > 0 ? (
          <View
            style={styles.tableContainer}
          >
            {/* TABLO BAŞLIĞI */}

            <View
              style={styles.tableHeader}
            >
              <View
                style={[
                  styles.clubColumn,
                  styles.headerCell,
                ]}
              >
                <Text
                  style={
                    styles.headerText
                  }
                >
                  KULÜP
                </Text>
              </View>

              <View
                style={[
                  styles.roleColumn,
                  styles.headerCell,
                ]}
              >
                <Text
                  style={
                    styles.headerText
                  }
                >
                  ROL
                </Text>
              </View>

              <View
                style={[
                  styles.statusColumn,
                  styles.headerCell,
                ]}
              >
                <Text
                  style={
                    styles.headerText
                  }
                >
                  DURUM
                </Text>
              </View>

              <View
                style={styles.arrowColumn}
              />
            </View>

            {/* AŞAĞI DOĞRU KAYAN TABLO */}

            <FlatList
              data={clubs}
              keyExtractor={(
                item
              ) =>
                item.id.toString()
              }
              renderItem={
                renderClub
              }
              showsVerticalScrollIndicator={
                true
              }
              nestedScrollEnabled={
                true
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
              contentContainerStyle={
                styles.tableContent
              }
            />
          </View>
        ) : (
          /* ================================================= */
          /* BOŞ DURUM */
          /* ================================================= */

          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={styles.emptyCard}
            >
              <View
                style={styles.emptyIcon}
              >
                <Ionicons
                  name="people-outline"
                  size={42}
                  color="#94A3B8"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Henüz bir kulübe üye değilsiniz
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Üniversitedeki kulüpleri
                keşfederek yeni kulüplere
                katılabilirsiniz.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={
                  styles.exploreButton
                }
                onPress={() =>
                  navigation.navigate(
                    "ClubsList",
                    {
                      fromPresident: true,
                    }
                  )
                }
              >
                <Ionicons
                  name="search"
                  size={18}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.exploreButtonText
                  }
                >
                  Kulüpleri Keşfet
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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

    /*
     * =================================================
     * LOADING
     * =================================================
     */

    loadingContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
      backgroundColor:
        "#F8FAFC",
    },

    loadingText: {
      marginTop: 12,
      color: "#64748B",
      fontSize: 14,
      fontWeight: "500",
    },

    /*
     * =================================================
     * HEADER
     * =================================================
     */

    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 18,
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

    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },

    backButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F1F5F9",
      marginRight: 12,
    },

    headerTextContainer: {
      flex: 1,
      minWidth: 0,
    },

    eyebrow: {
      color: "#4F46E5",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
      marginBottom: 3,
    },

    title: {
      color: "#0F172A",
      fontSize: 21,
      fontWeight: "800",
    },

    subtitle: {
      color: "#64748B",
      fontSize: 13,
      marginTop: 3,
    },

    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    /*
     * =================================================
     * SUMMARY
     * =================================================
     */

    summaryCard: {
      marginHorizontal: 20,
      marginTop: 18,
      marginBottom: 12,
      padding: 18,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    summaryIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 14,
    },

    summaryNumber: {
      color: "#0F172A",
      fontSize: 24,
      fontWeight: "800",
    },

    summaryLabel: {
      color: "#64748B",
      fontSize: 13,
      marginTop: 1,
    },

    /*
     * =================================================
     * TABLE CONTAINER
     * =================================================
     */

    tableContainer: {
      flex: 1,
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      overflow: "hidden",
    },

    /*
     * =================================================
     * TABLE HEADER
     * =================================================
     */

    tableHeader: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#F8FAFC",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
    },

    headerCell: {
      justifyContent:
        "center",
    },

    headerText: {
      color: "#64748B",
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },

    /*
     * =================================================
     * TABLE COLUMNS
     * =================================================
     */

    clubColumn: {
      flex: 1.7,
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
      paddingLeft: 12,
    },

    roleColumn: {
      flex: 0.9,
      justifyContent:
        "center",
      alignItems: "flex-start",
      minWidth: 0,
    },

    statusColumn: {
      flex: 0.9,
      justifyContent:
        "center",
      alignItems: "flex-start",
      minWidth: 0,
    },

    arrowColumn: {
      width: 34,
      alignItems: "center",
      justifyContent:
        "center",
    },

    /*
     * =================================================
     * TABLE ROW
     * =================================================
     */

    tableContent: {
      paddingBottom: 10,
    },

    tableRow: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    cell: {
      paddingVertical: 10,
    },

    /*
     * =================================================
     * CLUB
     * =================================================
     */

    clubIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        "#EEF2FF",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 9,
    },

    clubNameContainer: {
      flex: 1,
      minWidth: 0,
      paddingRight: 5,
    },

    clubName: {
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "800",
    },

    joinDate: {
      color: "#94A3B8",
      fontSize: 9,
      marginTop: 3,
    },

    /*
     * =================================================
     * PRESIDENT BADGE
     * =================================================
     */

    presidentBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        "#FEF3C7",
    },

    presidentBadgeText: {
      color: "#B45309",
      fontSize: 9,
      fontWeight: "800",
      marginLeft: 3,
    },

    /*
     * =================================================
     * MEMBER BADGE
     * =================================================
     */

    memberBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        "#EEF2FF",
    },

    memberBadgeText: {
      color: "#4F46E5",
      fontSize: 9,
      fontWeight: "800",
      marginLeft: 3,
    },

    /*
     * =================================================
     * STATUS
     * =================================================
     */

    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor:
        "#F0FDF4",
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        "#16A34A",
      marginRight: 5,
    },

    statusText: {
      color: "#16A34A",
      fontSize: 9,
      fontWeight: "800",
    },

    /*
     * =================================================
     * EMPTY
     * =================================================
     */

    emptyContainer: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent:
        "center",
    },

    emptyCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 20,
      padding: 28,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 22,
      backgroundColor:
        "#F1F5F9",
      alignItems: "center",
      justifyContent:
        "center",
      marginBottom: 16,
    },

    emptyTitle: {
      color: "#0F172A",
      fontSize: 17,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 8,
    },

    emptyText: {
      color: "#64748B",
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
      marginBottom: 20,
    },

    exploreButton: {
      height: 46,
      paddingHorizontal: 18,
      borderRadius: 13,
      backgroundColor:
        "#4F46E5",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    exploreButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
      marginLeft: 7,
    },
  });
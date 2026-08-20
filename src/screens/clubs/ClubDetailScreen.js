import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  getClubById,
  joinClub,
  leaveClub,
  checkClubMembership,
} from "../../services/clubService";

const ClubDetailScreen = ({
  route,
  navigation,
}) => {
  const { club: initialClub } =
    route.params || {};

  const [club, setClub] =
    useState(initialClub || null);

  const [loading, setLoading] =
    useState(true);

  const [membershipStatus, setMembershipStatus] =
    useState("none");

  const [membershipLoading, setMembershipLoading] =
    useState(false);

  /*
   * ============================================================
   * KULÜP BİLGİLERİNİ YÜKLE
   * ============================================================
   */

  const loadClub = async () => {
    try {
      if (!initialClub?.id) {
        setLoading(false);
        return;
      }

      const result =
        await getClubById(
          initialClub.id
        );

      if (!result.success) {
        Alert.alert(
          "Kulüp Yüklenemedi",
          result.error
        );

        return;
      }

      setClub(result.data);

      /*
       * getClubById üyelik durumunu
       * döndürüyor.
       */

      setMembershipStatus(
        result.data?.membershipStatus ||
          "none"
      );
    } catch (error) {
      console.error(
        "ClubDetailScreen load error:",
        error
      );

      Alert.alert(
        "Hata",
        "Kulüp bilgileri alınırken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * ÜYELİK DURUMUNU KONTROL ET
   * ============================================================
   */

  const loadMembership =
    async () => {
      try {
        if (!initialClub?.id) {
          return;
        }

        const result =
          await checkClubMembership(
            initialClub.id
          );

        if (!result.success) {
          console.error(
            "Membership check error:",
            result.error
          );

          return;
        }

        setMembershipStatus(
          result.status || "none"
        );
      } catch (error) {
        console.error(
          "loadMembership error:",
          error
        );
      }
    };

  useEffect(() => {
    loadClub();
  }, []);

  /*
   * ============================================================
   * KULÜBE KATIL
   * ============================================================
   */

  const handleJoinClub =
    async () => {
      if (
        membershipLoading ||
        !club?.id
      ) {
        return;
      }

      try {
        setMembershipLoading(true);

        const result =
          await joinClub(
            club.id
          );

        if (!result.success) {
          if (
            result.alreadyMember
          ) {
            setMembershipStatus(
              "approved"
            );

            Alert.alert(
              "Bilgi",
              "Bu kulübe zaten üyesiniz."
            );

            return;
          }

          if (
            result.alreadyPending
          ) {
            setMembershipStatus(
              "pending"
            );

            Alert.alert(
              "Başvuru Beklemede",
              "Kulüp üyelik başvurunuz zaten onay bekliyor."
            );

            return;
          }

          Alert.alert(
            "Başvuru Başarısız",
            result.error ||
              "Kulübe katılma isteği gönderilemedi."
          );

          return;
        }

        /*
         * Başvuru başarılı.
         */

        setMembershipStatus(
          "pending"
        );

        Alert.alert(
          "Başvuru Gönderildi",
          "Kulüp üyelik başvurunuz gönderildi. Kulüp yöneticisinin onaylamasını bekleyin."
        );
      } catch (error) {
        console.error(
          "handleJoinClub error:",
          error
        );

        Alert.alert(
          "Hata",
          "Kulübe katılma isteği gönderilirken bir hata oluştu."
        );
      } finally {
        setMembershipLoading(
          false
        );
      }
    };

  /*
   * ============================================================
   * KULÜPTEN AYRIL
   * ============================================================
   */

  const handleLeaveClub =
    async () => {
      if (
        membershipLoading ||
        !club?.id
      ) {
        return;
      }

      Alert.alert(
        "Kulüpten Ayrıl",
        "Bu kulüpten ayrılmak istediğinize emin misiniz?",
        [
          {
            text: "Vazgeç",
            style: "cancel",
          },
          {
            text: "Ayrıl",
            style: "destructive",
            onPress:
              async () => {
                try {
                  setMembershipLoading(
                    true
                  );

                  const result =
                    await leaveClub(
                      club.id
                    );

                  if (
                    !result.success
                  ) {
                    Alert.alert(
                      "İşlem Başarısız",
                      result.error
                    );

                    return;
                  }

                  setMembershipStatus(
                    "none"
                  );

                  Alert.alert(
                    "Başarılı",
                    "Kulüpten ayrıldınız."
                  );
                } catch (error) {
                  console.error(
                    "handleLeaveClub error:",
                    error
                  );

                  Alert.alert(
                    "Hata",
                    "Kulüpten ayrılırken bir hata oluştu."
                  );
                } finally {
                  setMembershipLoading(
                    false
                  );
                }
              },
          },
        ]
      );
    };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
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
            style={styles.loadingText}
          >
            Kulüp bilgileri
            yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ============================================================
   * KULÜP BULUNAMADI
   * ============================================================
   */

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
            style={styles.errorIcon}
          >
            <Ionicons
              name="alert-circle-outline"
              size={38}
              color="#DC2626"
            />
          </View>

          <Text
            style={styles.errorTitle}
          >
            Kulüp bulunamadı
          </Text>

          <Text
            style={styles.errorText}
          >
            Kulüp bilgileri
            alınamadı.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backButtonLarge
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              Geri Dön
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * ============================================================
   * ÜYELİK BUTONU
   * ============================================================
   */

  const renderMembershipButton =
    () => {
      /*
       * ONAYLANMIŞ ÜYE
       */

      if (
        membershipStatus ===
        "approved"
      ) {
        return (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              membershipLoading
            }
            onPress={
              handleLeaveClub
            }
            style={[
              styles.membershipButton,
              styles.memberButton,
            ]}
          >
            {membershipLoading ? (
              <ActivityIndicator
                size="small"
                color="#16A34A"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color="#16A34A"
                />

                <Text
                  style={
                    styles.memberButtonText
                  }
                >
                  Kulüp Üyesisin
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      }

      /*
       * ONAY BEKLİYOR
       */

      if (
        membershipStatus ===
        "pending"
      ) {
        return (
          <View
            style={[
              styles.membershipButton,
              styles.pendingButton,
            ]}
          >
            <Ionicons
              name="time-outline"
              size={21}
              color="#D97706"
            />

            <Text
              style={
                styles.pendingButtonText
              }
            >
              Başvuru Onay Bekliyor
            </Text>
          </View>
        );
      }

      /*
       * ÜYE DEĞİL
       */

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={
            membershipLoading
          }
          onPress={
            handleJoinClub
          }
          style={[
            styles.membershipButton,
            styles.joinClubButton,
          ]}
        >
          {membershipLoading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="people-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.joinClubButtonText
                }
              >
                Kulübe Katıl
              </Text>
            </>
          )}
        </TouchableOpacity>
      );
    };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

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

          <Text
            style={
              styles.headerTitle
            }
          >
            Kulüp Detayı
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* =====================================================
            HERO
        ====================================================== */}

        <View
          style={styles.heroSection}
        >
          <View
            style={
              styles.logoContainer
            }
          >
            <Ionicons
              name="people"
              size={42}
              color="#4F46E5"
            />
          </View>

          <Text
            style={styles.clubName}
          >
            {club.club_name ||
              club.name ||
              "Kulüp"}
          </Text>

          <Text
            style={
              styles.clubSubtitle
            }
          >
            Üniversite Kulübü
          </Text>

          <View
            style={
              styles.memberBadge
            }
          >
            <Ionicons
              name="people-outline"
              size={16}
              color="#4F46E5"
            />

            <Text
              style={
                styles.memberBadgeText
              }
            >
              {club.memberCount ||
                0}{" "}
              üye
            </Text>
          </View>
        </View>

        {/* =====================================================
            ÜYELİK BUTONU
        ====================================================== */}

        <View
          style={
            styles.membershipContainer
          }
        >
          {renderMembershipButton()}
        </View>

        {/* =====================================================
            AÇIKLAMA
        ====================================================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Kulüp Hakkında
          </Text>

          <Text
            style={
              styles.description
            }
          >
            {club.description ||
              "Bu kulüp hakkında açıklama bulunmuyor."}
          </Text>
        </View>

        {/* =====================================================
            İLETİŞİM
        ====================================================== */}

        <View
          style={styles.section}
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            İletişim Bilgileri
          </Text>

          {club.email && (
            <InfoRow
              icon="mail-outline"
              title="E-posta"
              value={club.email}
            />
          )}

          {club.phone && (
            <InfoRow
              icon="call-outline"
              title="Telefon"
              value={club.phone}
            />
          )}

          {club.address && (
            <InfoRow
              icon="location-outline"
              title="Adres"
              value={club.address}
              last
            />
          )}
        </View>

        {/* =====================================================
            ETKİNLİKLER
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

            <Text
              style={
                styles.sectionCount
              }
            >
              {club.events?.length ||
                0}
            </Text>
          </View>

          {club.events &&
          club.events.length >
            0 ? (
            club.events.map(
              (event) => (
                <TouchableOpacity
                  key={event.id}
                  activeOpacity={
                    0.85
                  }
                  onPress={() => {
                    /*
                     * ClubDetailScreen,
                     * ClubsNavigator içinde.
                     *
                     * EventDetail ise
                     * EventsNavigator içinde.
                     *
                     * Bu nedenle parent navigator
                     * üzerinden Events tabına
                     * gönderiyoruz.
                     */

                    navigation.navigate(
                      "Events",
                      {
                        screen:
                          "EventDetail",
                        params: {
                          event,
                        },
                      }
                    );
                  }}
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
                      size={21}
                      color="#4F46E5"
                    />
                  </View>

                  <View
                    style={
                      styles.eventContent
                    }
                  >
                    <Text
                      style={
                        styles.eventTitle
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {event.title}
                    </Text>

                    <Text
                      style={
                        styles.eventInfo
                      }
                    >
                      {event.date ||
                        "Tarih yok"}

                      {event.time
                        ? ` • ${event.time}`
                        : ""}
                    </Text>

                    {event.location && (
                      <Text
                        style={
                          styles.eventLocation
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {event.location}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              )
            )
          ) : (
            <EmptySection
              icon="calendar-outline"
              text="Bu kulübün henüz etkinliği bulunmuyor."
            />
          )}
        </View>

        {/* =====================================================
            DUYURULAR
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
              Duyurular
            </Text>

            <Text
              style={
                styles.sectionCount
              }
            >
              {club.announcements
                ?.length || 0}
            </Text>
          </View>

          {club.announcements &&
          club.announcements.length >
            0 ? (
            club.announcements.map(
              (
                announcement
              ) => (
                <View
                  key={
                    announcement.id
                  }
                  style={
                    styles.announcementCard
                  }
                >
                  <View
                    style={
                      styles.announcementIcon
                    }
                  >
                    <Ionicons
                      name="megaphone-outline"
                      size={20}
                      color="#4F46E5"
                    />
                  </View>

                  <View
                    style={
                      styles.announcementContent
                    }
                  >
                    <Text
                      style={
                        styles.announcementTitle
                      }
                      numberOfLines={
                        2
                      }
                    >
                      {
                        announcement.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.announcementText
                      }
                      numberOfLines={
                        3
                      }
                    >
                      {
                        announcement.content
                      }
                    </Text>
                  </View>
                </View>
              )
            )
          ) : (
            <EmptySection
              icon="megaphone-outline"
              text="Bu kulübün henüz duyurusu bulunmuyor."
            />
          )}
        </View>

        <View
          style={styles.bottomSpacing}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

/*
 * ============================================================
 * INFO ROW
 * ============================================================
 */

const InfoRow = ({
  icon,
  title,
  value,
  last = false,
}) => {
  return (
    <View
      style={[
        styles.infoRow,
        !last &&
          styles.infoRowBorder,
      ]}
    >
      <View
        style={
          styles.infoIconContainer
        }
      >
        <Ionicons
          name={icon}
          size={20}
          color="#4F46E5"
        />
      </View>

      <View
        style={styles.infoContent}
      >
        <Text
          style={styles.infoTitle}
        >
          {title}
        </Text>

        <Text
          style={styles.infoValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

/*
 * ============================================================
 * EMPTY SECTION
 * ============================================================
 */

const EmptySection = ({
  icon,
  text,
}) => {
  return (
    <View
      style={
        styles.emptySection
      }
    >
      <Ionicons
        name={icon}
        size={23}
        color="#94A3B8"
      />

      <Text
        style={
          styles.emptySectionText
        }
      >
        {text}
      </Text>
    </View>
  );
};

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  contentContainer: {
    paddingBottom: 20,
  },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
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

  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor:
      "#F8FAFC",
  },

  logoContainer: {
    width: 92,
    height: 92,
    borderRadius: 30,
    backgroundColor:
      "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  clubName: {
    color: "#0F172A",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },

  clubSubtitle: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor:
      "#EEF2FF",
  },

  memberBadgeText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  membershipContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  membershipButton: {
    height: 54,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  joinClubButton: {
    backgroundColor:
      "#4F46E5",
  },

  joinClubButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  pendingButton: {
    backgroundColor:
      "#FFFBEB",
    borderWidth: 1,
    borderColor:
      "#FDE68A",
  },

  pendingButtonText: {
    color: "#D97706",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  memberButton: {
    backgroundColor:
      "#F0FDF4",
    borderWidth: 1,
    borderColor:
      "#BBF7D0",
  },

  memberButtonText: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 28,
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
  },

  sectionCount: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor:
      "#EEF2FF",
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
  },

  description: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 23,
  },

  infoRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },

  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor:
      "#F1F5F9",
  },

  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      "#EEF2FF",
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
    fontWeight: "600",
    marginBottom: 3,
  },

  infoValue: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
  },

  eventCard: {
    minHeight: 76,
    padding: 12,
    borderRadius: 17,
    backgroundColor:
      "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  eventIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  eventContent: {
    flex: 1,
    marginRight: 8,
  },

  eventTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },

  eventInfo: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },

  eventLocation: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 3,
  },

  announcementCard: {
    padding: 14,
    borderRadius: 17,
    backgroundColor:
      "#F8FAFC",
    flexDirection: "row",
    marginBottom: 10,
  },

  announcementIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  announcementContent: {
    flex: 1,
  },

  announcementTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },

  announcementText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
  },

  emptySection: {
    minHeight: 80,
    borderRadius: 17,
    backgroundColor:
      "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  emptySectionText: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
    marginTop: 7,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor:
      "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
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

  backButtonLarge: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor:
      "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  bottomSpacing: {
    height: 30,
  },
});

export default ClubDetailScreen;
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
  Modal,
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

export default function AdminEventDetailScreen({
  navigation,
  route,
}) {
  const eventId =
    route?.params?.eventId ||
    route?.params?.event?.id;

  const [event, setEvent] =
    useState(null);

  const [club, setClub] =
    useState(null);

  const [category, setCategory] =
    useState(null);

  const [participantCount, setParticipantCount] =
    useState(0);

  const [pendingCount, setPendingCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [deleting, setDeleting] =
    useState(false);

  const [deleteModalVisible, setDeleteModalVisible] =
    useState(false);

  const [successModalVisible, setSuccessModalVisible] =
    useState(false);

  /*
   * =====================================================
   * VERİLERİ YÜKLE
   * =====================================================
   */

  const loadData = async () => {
    try {
      setLoading(true);

      if (!eventId) {
        throw new Error(
          "Etkinlik ID bulunamadı."
        );
      }

      /*
       * ETKİNLİK
       */

      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select("*")
        .eq(
          "id",
          eventId
        )
        .single();

      if (eventError) {
        throw eventError;
      }

      setEvent(eventData);

      /*
       * KULÜP
       */

      if (eventData.club_id) {
        const {
          data: clubData,
          error: clubError,
        } = await supabase
          .from("club")
          .select(
            "id, club_name"
          )
          .eq(
            "id",
            eventData.club_id
          )
          .maybeSingle();

        if (clubError) {
          throw clubError;
        }

        setClub(
          clubData
        );
      } else {
        setClub(null);
      }

      /*
       * KATEGORİ
       */

      if (eventData.category_id) {
        const {
          data: categoryData,
          error: categoryError,
        } = await supabase
          .from(
            "event_categories"
          )
          .select(
            "id, category_name"
          )
          .eq(
            "id",
            eventData.category_id
          )
          .maybeSingle();

        if (categoryError) {
          throw categoryError;
        }

        setCategory(
          categoryData
        );
      } else {
        setCategory(null);
      }

      /*
       * TOPLAM KATILIMCI
       */

      const {
        count: totalParticipants,
        error:
          participantError,
      } = await supabase
        .from(
          "event_participants"
        )
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "event_id",
          eventId
        );

      if (participantError) {
        throw participantError;
      }

      setParticipantCount(
        totalParticipants || 0
      );

      /*
       * BEKLEYEN KATILIMCI
       */

      const {
        count: pendingParticipants,
        error: pendingError,
      } = await supabase
        .from(
          "event_participants"
        )
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "event_id",
          eventId
        )
        .eq(
          "approval_status",
          "pending"
        );

      if (pendingError) {
        console.log(
          "Pending count alınamadı:",
          pendingError.message
        );

        setPendingCount(0);
      } else {
        setPendingCount(
          pendingParticipants || 0
        );
      }
    } catch (error) {
      console.error(
        "Admin event detail error:",
        error
      );

      Alert.alert(
        "Hata",
        error.message ||
          "Etkinlik bilgileri yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  /*
   * =====================================================
   * SİL BUTONU
   * =====================================================
   */

  const handleDelete = () => {
    console.log(
      "SİL BUTONUNA BASILDI"
    );

    console.log(
      "Silinecek event:",
      event
    );

    if (!event?.id) {
      console.log(
        "EVENT ID BULUNAMADI"
      );

      Alert.alert(
        "Hata",
        "Etkinlik ID bulunamadı."
      );

      return;
    }

    console.log(
      "Silinecek event ID:",
      event.id
    );

    setDeleteModalVisible(
      true
    );
  };

  /*
   * =====================================================
   * ETKİNLİĞİ SİL
   * =====================================================
   */

  const deleteEvent = async () => {
    console.log(
      "SİL ONAYINA BASILDI"
    );

    console.log(
      "DELETE EVENT ÇALIŞTI"
    );

    if (!event?.id) {
      console.log(
        "DELETE EVENT: EVENT ID YOK"
      );

      setDeleteModalVisible(
        false
      );

      Alert.alert(
        "Hata",
        "Etkinlik ID bulunamadı."
      );

      return;
    }

    try {
      setDeleting(true);

      console.log(
        "Silinecek etkinlik ID:",
        event.id
      );

      setDeleteModalVisible(
        false
      );

      /*
       * KATILIMCILARI SİL
       */

      console.log(
        "Katılımcılar siliniyor..."
      );

      const {
        error:
          participantDeleteError,
      } = await supabase
        .from(
          "event_participants"
        )
        .delete()
        .eq(
          "event_id",
          event.id
        );

      if (
        participantDeleteError
      ) {
        console.error(
          "Katılımcılar silinemedi:",
          participantDeleteError
        );

        throw participantDeleteError;
      }

      console.log(
        "Katılımcılar başarıyla silindi."
      );

      /*
       * ETKİNLİĞİ SİL
       */

      console.log(
        "Etkinlik siliniyor..."
      );

      const {
        data: deletedEvent,
        error:
          eventDeleteError,
      } = await supabase
        .from("events")
        .delete()
        .eq(
          "id",
          event.id
        )
        .select()
        .maybeSingle();

      if (
        eventDeleteError
      ) {
        console.error(
          "ETKİNLİK SİLME HATASI:",
          eventDeleteError
        );

        throw eventDeleteError;
      }

      console.log(
        "Supabase silme sonucu:",
        deletedEvent
      );

      if (!deletedEvent) {
        throw new Error(
          "Etkinlik silinemedi. Supabase herhangi bir kayıt döndürmedi."
        );
      }

      console.log(
        "ETKİNLİK BAŞARIYLA SİLİNDİ"
      );

      setSuccessModalVisible(
        true
      );
    } catch (error) {
      console.error(
        "DELETE EVENT ERROR:",
        error
      );

      Alert.alert(
        "Etkinlik Silinemedi",
        error.message ||
          "Etkinlik silinirken bir hata oluştu."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * =====================================================
   * SİLME BAŞARILI
   * =====================================================
   */

  const handleSuccessClose = () => {
    console.log(
      "Etkinlik listesinden geri dönülüyor."
    );

    setSuccessModalVisible(
      false
    );

    navigation.goBack();
  };

  /*
   * =====================================================
   * KATILIMCILARA GİT
   * =====================================================
   *
   * AdminParticipants diye olmayan
   * bir ekran kullanmıyoruz.
   *
   * ClubPresidentNavigator içerisinde
   * mevcut olan:
   *
   * ClubPresidentParticipants
   *
   * route'unu kullanıyoruz.
   */

  const handleParticipants = () => {
    const state =
      navigation.getState();

    const routeNames =
      state?.routeNames || [];

    /*
     * Kulüp Başkanı tarafı
     */

    if (
      routeNames.includes(
        "ClubPresidentParticipants"
      )
    ) {
      navigation.navigate(
        "ClubPresidentParticipants",
        {
          eventId: event.id,
          eventName:
            event.event_name ||
            event.title ||
            "Etkinlik",
        }
      );

      return;
    }

    /*
     * Admin tarafında mevcut
     * bir AdminParticipants route'u
     * varsa onu kullan.
     *
     * Yoksa hata vermek yerine
     * kullanıcıya bilgi ver.
     */

    if (
      routeNames.includes(
        "AdminParticipants"
      )
    ) {
      navigation.navigate(
        "AdminParticipants",
        {
          eventId: event.id,
          eventName:
            event.event_name ||
            event.title ||
            "Etkinlik",
        }
      );

      return;
    }

    Alert.alert(
      "Bilgi",
      "Katılımcı yönetim ekranı bu bölümde kullanılabilir değil."
    );
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
            Etkinlik yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =====================================================
   * ETKİNLİK BULUNAMADI
   * =====================================================
   */

  if (!event) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.emptyContainer
          }
        >
          <Ionicons
            name="calendar-outline"
            size={50}
            color="#94A3B8"
          />

          <Text
            style={styles.emptyTitle}
          >
            Etkinlik bulunamadı
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backHomeButton
            }
          >
            <Text
              style={
                styles.backHomeText
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
   * =====================================================
   * TARİH
   * =====================================================
   */

  const formattedDate =
    event.event_date
      ? String(
          event.event_date
        )
          .split("-")
          .reverse()
          .join(".")
      : "Tarih belirtilmedi";

  /*
   * =====================================================
   * EKRAN
   * =====================================================
   */

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* SABİT HEADER */}

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
          style={styles.headerTitle}
          numberOfLines={1}
        >
          Etkinlik Detayı
        </Text>

        <View
          style={
            styles.headerRight
          }
        />
      </View>

      {/* KAYAN İÇERİK */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* HERO */}

        <View
          style={styles.heroCard}
        >
          <View
            style={styles.heroIcon}
          >
            <Ionicons
              name="calendar"
              size={32}
              color="#2563EB"
            />
          </View>

          <Text
            style={styles.eventTitle}
          >
            {event.event_name ||
              event.title ||
              "İsimsiz Etkinlik"}
          </Text>

          {category && (
            <View
              style={
                styles.categoryBadge
              }
            >
              <Ionicons
                name="pricetag-outline"
                size={13}
                color="#7C3AED"
              />

              <Text
                style={
                  styles.categoryText
                }
              >
                {
                  category.category_name
                }
              </Text>
            </View>
          )}

          {club && (
            <View
              style={
                styles.clubBadge
              }
            >
              <Ionicons
                name="people-outline"
                size={14}
                color="#64748B"
              />

              <Text
                style={
                  styles.clubText
                }
              >
                {club.club_name}
              </Text>
            </View>
          )}
        </View>

        {/* ETKİNLİK BİLGİLERİ */}

        <Text
          style={styles.sectionTitle}
        >
          Etkinlik Bilgileri
        </Text>

        <View
          style={styles.infoCard}
        >
          <InfoRow
            icon="calendar-outline"
            title="Tarih"
            value={
              formattedDate
            }
          />

          <InfoRow
            icon="time-outline"
            title="Saat"
            value={
              event.event_time ||
              "Belirtilmedi"
            }
          />

          <InfoRow
            icon="location-outline"
            title="Konum"
            value={
              event.location ||
              "Belirtilmedi"
            }
          />

          <InfoRow
            icon="people-outline"
            title="Maksimum Katılımcı"
            value={
              event.max_participants
                ? String(
                    event.max_participants
                  )
                : "Sınırsız"
            }
          />
        </View>

        {/* AÇIKLAMA */}

        <Text
          style={styles.sectionTitle}
        >
          Açıklama
        </Text>

        <View
          style={
            styles.descriptionCard
          }
        >
          <Text
            style={
              styles.descriptionText
            }
          >
            {event.description ||
              "Bu etkinlik için açıklama eklenmemiş."}
          </Text>
        </View>

        {/* KATILIMCILAR */}

        <Text
          style={styles.sectionTitle}
        >
          Katılımcılar
        </Text>

        <View
          style={
            styles.participantSummary
          }
        >
          <View
            style={
              styles.participantBox
            }
          >
            <View
              style={[
                styles.participantIcon,
                styles.blueBackground,
              ]}
            >
              <Ionicons
                name="people"
                size={22}
                color="#2563EB"
              />
            </View>

            <Text
              style={
                styles.participantNumber
              }
            >
              {participantCount}
            </Text>

            <Text
              style={
                styles.participantLabel
              }
            >
              Başvuru
            </Text>
          </View>

          <View
            style={
              styles.participantBox
            }
          >
            <View
              style={[
                styles.participantIcon,
                styles.orangeBackground,
              ]}
            >
              <Ionicons
                name="time"
                size={22}
                color="#F59E0B"
              />
            </View>

            <Text
              style={[
                styles.participantNumber,
                {
                  color: "#F59E0B",
                },
              ]}
            >
              {pendingCount}
            </Text>

            <Text
              style={
                styles.participantLabel
              }
            >
              Bekleyen
            </Text>
          </View>
        </View>

        {/* KATILIMCILARI YÖNET */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={
            handleParticipants
          }
          style={
            styles.participantsButton
          }
        >
          <View
            style={
              styles.participantsButtonIcon
            }
          >
            <Ionicons
              name="people"
              size={23}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.participantsButtonContent
            }
          >
            <Text
              style={
                styles.participantsButtonTitle
              }
            >
              Katılımcıları Yönet
            </Text>

            <Text
              style={
                styles.participantsButtonDescription
              }
            >
              Katılım taleplerini
              görüntüle ve yönet
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* SİL */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={deleting}
          onPress={
            handleDelete
          }
          style={[
            styles.deleteButton,
            deleting &&
              styles.disabledButton,
          ]}
        >
          {deleting ? (
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

          <Text
            style={
              styles.deleteButtonText
            }
          >
            {deleting
              ? "Siliniyor..."
              : "Etkinliği Sil"}
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.bottomSpacing
          }
        />
      </ScrollView>

      {/* =====================================================
          SİLME MODALI
      ===================================================== */}

      <Modal
        visible={
          deleteModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) {
            setDeleteModalVisible(
              false
            );
          }
        }}
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.deleteModal
            }
          >
            <View
              style={
                styles.deleteModalIcon
              }
            >
              <Ionicons
                name="trash-outline"
                size={30}
                color="#DC2626"
              />
            </View>

            <Text
              style={
                styles.deleteModalTitle
              }
            >
              Etkinliği Sil
            </Text>

            <Text
              style={
                styles.deleteModalText
              }
            >
              {event?.event_name ||
                event?.title ||
                "Bu etkinlik"}{" "}
              etkinliğini silmek
              istediğinizden emin
              misiniz?
            </Text>

            <Text
              style={
                styles.deleteModalWarning
              }
            >
              Bu işlem geri alınamaz
              ve etkinliğe ait
              katılımcı kayıtları da
              silinir.
            </Text>

            <View
              style={
                styles.modalButtons
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={deleting}
                onPress={() =>
                  setDeleteModalVisible(
                    false
                  )
                }
                style={
                  styles.cancelModalButton
                }
              >
                <Text
                  style={
                    styles.cancelModalButtonText
                  }
                >
                  Vazgeç
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                disabled={deleting}
                onPress={
                  deleteEvent
                }
                style={
                  styles.confirmDeleteButton
                }
              >
                {deleting ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                )}

                <Text
                  style={
                    styles.confirmDeleteButtonText
                  }
                >
                  {deleting
                    ? "Siliniyor..."
                    : "Etkinliği Sil"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          BAŞARI MODALI
      ===================================================== */}

      <Modal
        visible={
          successModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          handleSuccessClose
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.successModal
            }
          >
            <View
              style={
                styles.successModalIcon
              }
            >
              <Ionicons
                name="checkmark"
                size={32}
                color="#16A34A"
              />
            </View>

            <Text
              style={
                styles.successModalTitle
              }
            >
              Etkinlik Silindi
            </Text>

            <Text
              style={
                styles.successModalText
              }
            >
              Etkinlik ve etkinliğe
              ait katılımcı kayıtları
              başarıyla silindi.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                handleSuccessClose
              }
              style={
                styles.successModalButton
              }
            >
              <Text
                style={
                  styles.successModalButtonText
                }
              >
                Tamam
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
}) {
  return (
    <View
      style={styles.infoRow}
    >
      <View
        style={styles.infoIcon}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
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
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/*
 * =====================================================
 * STYLES
 * =====================================================
 */

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

    emptyContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      padding: 30,
    },

    emptyTitle: {
      marginTop: 15,
      color: "#0F172A",
      fontSize: 18,
      fontWeight: "800",
    },

    backHomeButton: {
      marginTop: 20,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
    },

    backHomeText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
    },

    /*
     * HEADER
     */

    header: {
      height: 64,
      paddingHorizontal: 20,
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
    },

    headerTitle: {
      flex: 1,
      marginLeft: 12,
      color: "#0F172A",
      fontSize: 17,
      fontWeight: "800",
    },

    headerRight: {
      width: 42,
      height: 42,
    },

    /*
     * HERO
     */

    heroCard: {
      margin: 20,
      padding: 22,
      borderRadius: 22,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      elevation: 3,
    },

    heroIcon: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    eventTitle: {
      marginTop: 15,
      color: "#0F172A",
      fontSize: 23,
      fontWeight: "800",
      textAlign:
        "center",
    },

    categoryBadge: {
      marginTop: 10,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor:
        "#F5F3FF",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    categoryText: {
      marginLeft: 5,
      color: "#7C3AED",
      fontSize: 11,
      fontWeight: "700",
    },

    clubBadge: {
      marginTop: 7,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    clubText: {
      marginLeft: 5,
      color: "#64748B",
      fontSize: 11,
    },

    /*
     * SECTION
     */

    sectionTitle: {
      marginHorizontal: 20,
      marginTop: 25,
      marginBottom: 13,
      color: "#0F172A",
      fontSize: 19,
      fontWeight: "800",
    },

    /*
     * INFO
     */

    infoCard: {
      marginHorizontal: 20,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      elevation: 2,
    },

    infoRow: {
      minHeight: 68,
      flexDirection:
        "row",
      alignItems:
        "center",
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    infoIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      color: "#94A3B8",
      fontSize: 10,
      fontWeight: "700",
    },

    infoValue: {
      marginTop: 3,
      color: "#0F172A",
      fontSize: 13,
      fontWeight: "700",
    },

    /*
     * DESCRIPTION
     */

    descriptionCard: {
      marginHorizontal: 20,
      padding: 18,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      elevation: 2,
    },

    descriptionText: {
      color: "#475569",
      fontSize: 13,
      lineHeight: 21,
    },

    /*
     * PARTICIPANTS
     */

    participantSummary: {
      marginHorizontal: 20,
      flexDirection:
        "row",
      gap: 12,
    },

    participantBox: {
      flex: 1,
      padding: 16,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      alignItems:
        "center",
      elevation: 2,
    },

    participantIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    blueBackground: {
      backgroundColor:
        "#EFF6FF",
    },

    orangeBackground: {
      backgroundColor:
        "#FFF7ED",
    },

    participantNumber: {
      marginTop: 8,
      color: "#2563EB",
      fontSize: 23,
      fontWeight: "800",
    },

    participantLabel: {
      marginTop: 3,
      color: "#64748B",
      fontSize: 11,
    },

    participantsButton: {
      marginHorizontal: 20,
      marginTop: 18,
      padding: 15,
      minHeight: 70,
      borderRadius: 19,
      backgroundColor:
        "#2563EB",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    participantsButtonIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        "rgba(255,255,255,0.18)",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    participantsButtonContent: {
      flex: 1,
    },

    participantsButtonTitle: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },

    participantsButtonDescription: {
      marginTop: 3,
      color: "#DBEAFE",
      fontSize: 11,
    },

    /*
     * DELETE
     */

    deleteButton: {
      marginHorizontal: 20,
      marginTop: 12,
      minHeight: 52,
      borderRadius: 16,
      backgroundColor:
        "#FEF2F2",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    disabledButton: {
      opacity: 0.5,
    },

    deleteButtonText: {
      marginLeft: 8,
      color: "#DC2626",
      fontSize: 14,
      fontWeight: "800",
    },

    /*
     * DELETE MODAL
     */

    modalOverlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.55)",
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 25,
    },

    deleteModal: {
      width: "100%",
      maxWidth: 430,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      padding: 24,
      alignItems:
        "center",
    },

    deleteModalIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor:
        "#FEF2F2",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    deleteModalTitle: {
      marginTop: 16,
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
      textAlign:
        "center",
    },

    deleteModalText: {
      marginTop: 10,
      color: "#475569",
      fontSize: 13,
      lineHeight: 20,
      textAlign:
        "center",
    },

    deleteModalWarning: {
      marginTop: 10,
      paddingHorizontal: 10,
      color: "#DC2626",
      fontSize: 11,
      lineHeight: 17,
      textAlign:
        "center",
    },

    modalButtons: {
      width: "100%",
      flexDirection:
        "row",
      marginTop: 22,
      gap: 10,
    },

    cancelModalButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 15,
      backgroundColor:
        "#F1F5F9",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    cancelModalButtonText: {
      color: "#475569",
      fontSize: 13,
      fontWeight: "800",
    },

    confirmDeleteButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 15,
      backgroundColor:
        "#DC2626",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    confirmDeleteButtonText: {
      marginLeft: 7,
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
    },

    /*
     * SUCCESS MODAL
     */

    successModal: {
      width: "100%",
      maxWidth: 430,
      borderRadius: 24,
      backgroundColor:
        "#FFFFFF",
      padding: 25,
      alignItems:
        "center",
    },

    successModalIcon: {
      width: 66,
      height: 66,
      borderRadius: 21,
      backgroundColor:
        "#F0FDF4",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    successModalTitle: {
      marginTop: 16,
      color: "#0F172A",
      fontSize: 20,
      fontWeight: "800",
      textAlign:
        "center",
    },

    successModalText: {
      marginTop: 9,
      color: "#64748B",
      fontSize: 13,
      lineHeight: 20,
      textAlign:
        "center",
    },

    successModalButton: {
      width: "100%",
      minHeight: 50,
      marginTop: 22,
      borderRadius: 15,
      backgroundColor:
        "#16A34A",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    successModalButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },

    bottomSpacing: {
      height: 30,
    },
  });
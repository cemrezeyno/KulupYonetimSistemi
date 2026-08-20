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
  Alert,
  ActivityIndicator,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  joinEvent,
  leaveEvent,
  getEventById,
} from "../../services/eventsService";

const EventDetailScreen = ({
  route,
  navigation,
}) => {
  const {
    event: initialEvent,
  } = route.params || {};

  const [
    event,
    setEvent,
  ] = useState(
    initialEvent || null
  );

  const [
    isJoined,
    setIsJoined,
  ] = useState(
    initialEvent?.isJoined ||
      false
  );

  const [
    approvalStatus,
    setApprovalStatus,
  ] = useState(
    initialEvent?.approvalStatus ||
      null
  );

  const [
    participantCount,
    setParticipantCount,
  ] = useState(
    initialEvent?.participantCount ||
      initialEvent?.participant_count ||
      0
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    pageLoading,
    setPageLoading,
  ] = useState(true);

  /*
   * ============================================================
   * ETKİNLİK BİLGİSİNİ GÜNCELLE
   * ============================================================
   */

  const loadEvent =
    async () => {
      if (!initialEvent?.id) {
        setPageLoading(false);
        return;
      }

      try {
        const result =
          await getEventById(
            initialEvent.id
          );

        if (!result.success) {
          console.error(
            "Event detail load error:",
            result.error
          );

          return;
        }

        setEvent(
          result.data
        );

        setIsJoined(
          result.data.isJoined
        );

        setApprovalStatus(
          result.data.approvalStatus
        );

        setParticipantCount(
          result.data.participantCount ||
            0
        );
      } catch (error) {
        console.error(
          "loadEvent error:",
          error
        );
      } finally {
        setPageLoading(
          false
        );
      }
    };

  useEffect(() => {
    loadEvent();
  }, [initialEvent?.id]);

  /*
   * ============================================================
   * KATIL / AYRIL
   * ============================================================
   */

  const handleJoin =
    async () => {
      if (
        loading ||
        !event?.id
      ) {
        return;
      }

      try {
        setLoading(true);

        /*
         * ONAYLI ÜYE
         * Etkinlikten ayrılabilir.
         */

        if (
          approvalStatus ===
            "approved" &&
          isJoined
        ) {
          const result =
            await leaveEvent(
              event.id
            );

          if (!result.success) {
            Alert.alert(
              "İşlem Başarısız",
              result.error
            );

            return;
          }

          setIsJoined(false);

          setApprovalStatus(
            null
          );

          setParticipantCount(
            (count) =>
              Math.max(
                0,
                count - 1
              )
          );

          return;
        }

        /*
         * PENDING
         */

        if (
          approvalStatus ===
          "pending"
        ) {
          Alert.alert(
            "Onay Bekleniyor",
            "Etkinlik katılım başvurunuz kulüp yöneticisinin onayını bekliyor."
          );

          return;
        }

        /*
         * ETKİNLİĞE KATIL
         */

        const result =
          await joinEvent(
            event.id
          );

        if (!result.success) {
          Alert.alert(
            "Katılım Başarısız",
            result.error
          );

          return;
        }

        /*
         * Başvuru artık pending.
         */

        setApprovalStatus(
          "pending"
        );

        setIsJoined(false);

        Alert.alert(
          "Başvuru Gönderildi",
          "Etkinlik katılım başvurunuz gönderildi. Kulüp yöneticisinin onayını bekleyin."
        );
      } catch (error) {
        console.error(
          "EventDetailScreen join error:",
          error
        );

        Alert.alert(
          "Hata",
          "İşlem sırasında bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

  if (
    pageLoading ||
    !event
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
            Etkinlik yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const eventDate =
    event.date ??
    event.event_date;

  const eventTime =
    event.time ??
    event.event_time;

  const eventCategory =
    event.category ??
    event.category_name ??
    "Etkinlik";

  const eventMaxParticipants =
    event.maxParticipants ??
    event.max_participants ??
    null;

  const formattedDate =
    eventDate
      ? new Date(
          eventDate
        ).toLocaleDateString(
          "tr-TR",
          {
            weekday:
              "long",
            day: "numeric",
            month:
              "long",
            year:
              "numeric",
          }
        )
      : "Tarih belirtilmemiş";

  const hasParticipantLimit =
    eventMaxParticipants !==
      null &&
    eventMaxParticipants !==
      undefined;

  const isFull =
    hasParticipantLimit &&
    participantCount >=
      eventMaxParticipants &&
    approvalStatus !==
      "approved";

  /*
   * ============================================================
   * BUTON DURUMU
   * ============================================================
   */

  let buttonText =
    "Etkinliğe Katıl";

  let buttonIcon =
    "add-circle-outline";

  let buttonStyle =
    styles.joinButton;

  let buttonTextStyle =
    styles.joinButtonText;

  let buttonDisabled =
    false;

  if (
    approvalStatus ===
    "pending"
  ) {
    buttonText =
      "Onay Bekleniyor";

    buttonIcon =
      "time-outline";

    buttonStyle =
      styles.pendingButton;

    buttonTextStyle =
      styles.pendingButtonText;

    buttonDisabled =
      true;
  }

  if (
    approvalStatus ===
      "approved" &&
    isJoined
  ) {
    buttonText =
      "Katıldın";

    buttonIcon =
      "checkmark-circle";

    buttonStyle =
      styles.joinedButton;

    buttonTextStyle =
      styles.joinedButtonText;
  }

  if (
    approvalStatus ===
      "rejected"
  ) {
    buttonText =
      "Tekrar Başvur";

    buttonIcon =
      "refresh-outline";

    buttonStyle =
      styles.joinButton;

    buttonTextStyle =
      styles.joinButtonText;
  }

  if (isFull) {
    buttonText =
      "Kontenjan Doldu";

    buttonIcon =
      "alert-circle-outline";

    buttonStyle =
      styles.fullButton;

    buttonTextStyle =
      styles.fullButtonText;

    buttonDisabled =
      true;
  }

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

          <Text
            style={
              styles.headerTitle
            }
          >
            Etkinlik Detayı
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* HERO */}

        <View
          style={styles.heroSection}
        >
          <View
            style={
              styles.categoryBadge
            }
          >
            <Text
              style={
                styles.categoryText
              }
            >
              {eventCategory}
            </Text>
          </View>

          <Text
            style={styles.title}
          >
            {event.title}
          </Text>

          {event.description && (
            <Text
              style={
                styles.descriptionPreview
              }
            >
              {event.description}
            </Text>
          )}
        </View>

        {/* BİLGİLER */}

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

          {eventTime && (
            <InfoRow
              icon="time-outline"
              title="Saat"
              value={
                eventTime
              }
            />
          )}

          {event.location && (
            <InfoRow
              icon="location-outline"
              title="Konum"
              value={
                event.location
              }
              last
            />
          )}
        </View>

        {/* AÇIKLAMA */}

        {event.description && (
          <View
            style={
              styles.section
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Etkinlik Hakkında
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {
                event.description
              }
            </Text>
          </View>
        )}

        {/* KATILIMCI */}

        <View
          style={
            styles.participantCard
          }
        >
          <View
            style={
              styles.participantIcon
            }
          >
            <Ionicons
              name="people-outline"
              size={24}
              color="#4F46E5"
            />
          </View>

          <View
            style={
              styles.participantInfo
            }
          >
            <Text
              style={
                styles.participantTitle
              }
            >
              Katılımcılar
            </Text>

            <Text
              style={
                styles.participantCount
              }
            >
              {participantCount}

              {hasParticipantLimit
                ? ` / ${eventMaxParticipants}`
                : ""}{" "}
              kişi
            </Text>
          </View>
        </View>

        {/* ONAY DURUMU */}

        {approvalStatus ===
          "pending" && (
          <View
            style={
              styles.pendingInfo
            }
          >
            <Ionicons
              name="time-outline"
              size={21}
              color="#D97706"
            />

            <View
              style={
                styles.statusContent
              }
            >
              <Text
                style={
                  styles.pendingTitle
                }
              >
                Başvurun Onay Bekliyor
              </Text>

              <Text
                style={
                  styles.pendingText
                }
              >
                Etkinlik katılım
                talebiniz kulüp
                yöneticisine
                gönderildi.
              </Text>
            </View>
          </View>
        )}

        {approvalStatus ===
          "rejected" && (
          <View
            style={
              styles.rejectedInfo
            }
          >
            <Ionicons
              name="close-circle-outline"
              size={21}
              color="#DC2626"
            />

            <View
              style={
                styles.statusContent
              }
            >
              <Text
                style={
                  styles.rejectedTitle
                }
              >
                Katılım Başvurusu Reddedildi
              </Text>

              <Text
                style={
                  styles.rejectedText
                }
              >
                Kulüp yöneticisi
                etkinlik katılım
                başvurunuzu
                reddetti.
              </Text>
            </View>
          </View>
        )}

        {isFull && (
          <View
            style={
              styles.fullContainer
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#DC2626"
            />

            <Text
              style={
                styles.fullText
              }
            >
              Bu etkinliğin
              kontenjanı
              dolmuştur.
            </Text>
          </View>
        )}

        {/* KATIL BUTONU */}

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={
            loading ||
            buttonDisabled
          }
          onPress={
            handleJoin
          }
          style={[
            styles.joinButton,
            buttonStyle,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name={buttonIcon}
                size={21}
                color={
                  buttonTextStyle.color
                }
              />

              <Text
                style={
                  buttonTextStyle
                }
              >
                {buttonText}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* QR */}

        {approvalStatus ===
          "approved" &&
          isJoined && (
            <TouchableOpacity
              activeOpacity={
                0.85
              }
              onPress={() =>
                navigation.navigate(
                  "QRScanner"
                )
              }
              style={
                styles.qrButton
              }
            >
              <Ionicons
                name="qr-code-outline"
                size={21}
                color="#4F46E5"
              />

              <Text
                style={
                  styles.qrButtonText
                }
              >
                QR ile Katılım Yap
              </Text>
            </TouchableOpacity>
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
          size={21}
          color="#4F46E5"
        />
      </View>

      <View
        style={styles.infoContent}
      >
        <Text
          style={
            styles.infoTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.infoValue
          }
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor:
      "#FFFFFF",
  },

  contentContainer: {
    paddingBottom: 20,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    backgroundColor:
      "#F8FAFC",
  },

  categoryBadge: {
    alignSelf:
      "flex-start",
    backgroundColor:
      "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 12,
  },

  categoryText: {
    color: "#4F46E5",
    fontSize: 12,
    fontWeight: "800",
  },

  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 35,
  },

  descriptionPreview: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  infoCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor:
      "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      "#E2E8F0",
    paddingHorizontal: 16,
  },

  infoRow: {
    minHeight: 70,
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

  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 10,
  },

  description: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 23,
  },

  participantCard: {
    marginHorizontal: 20,
    marginTop: 28,
    padding: 16,
    borderRadius: 20,
    backgroundColor:
      "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  participantIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor:
      "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  participantInfo: {
    flex: 1,
  },

  participantTitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 3,
  },

  participantCount: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },

  pendingInfo: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor:
      "#FFFBEB",
    borderWidth: 1,
    borderColor:
      "#FDE68A",
    flexDirection: "row",
    alignItems: "center",
  },

  rejectedInfo: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor:
      "#FEF2F2",
    borderWidth: 1,
    borderColor:
      "#FECACA",
    flexDirection: "row",
    alignItems: "center",
  },

  statusContent: {
    flex: 1,
    marginLeft: 10,
  },

  pendingTitle: {
    color: "#92400E",
    fontSize: 13,
    fontWeight: "800",
  },

  pendingText: {
    color: "#B45309",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  rejectedTitle: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "800",
  },

  rejectedText: {
    color: "#B91C1C",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  fullContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 13,
    borderRadius: 14,
    backgroundColor:
      "#FEF2F2",
    borderWidth: 1,
    borderColor:
      "#FECACA",
  },

  fullText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },

  joinButton: {
    height: 54,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
  },

  joinButtonText: {
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

  joinedButton: {
    backgroundColor:
      "#F0FDF4",
    borderWidth: 1,
    borderColor:
      "#BBF7D0",
  },

  joinedButtonText: {
    color: "#16A34A",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  fullButton: {
    backgroundColor:
      "#E2E8F0",
  },

  fullButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

  qrButton: {
    height: 52,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 17,
    backgroundColor:
      "#EEF2FF",
    borderWidth: 1,
    borderColor:
      "#C7D2FE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
  },

  qrButtonText: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 8,
  },

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

  bottomSpacing: {
    height: 30,
  },
});

export default EventDetailScreen;
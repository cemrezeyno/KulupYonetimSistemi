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

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  supabase,
} from "../../config/supabase";

export default function AdminClubDetailScreen({
  route,
  navigation,
}) {
  const club = route?.params?.club;

  const [members, setMembers] =
    useState([]);

  const [
    presidentCandidates,
    setPresidentCandidates,
  ] = useState([]);

  const [presidentId, setPresidentId] =
    useState(
      club?.president_id || null
    );

  const [loading, setLoading] =
    useState(true);

  const [
    savingPresident,
    setSavingPresident,
  ] = useState(false);

  /*
   * =====================================================
   * VERİLERİ GETİR
   * =====================================================
   */

  const loadData = async () => {
    if (!club?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      /*
       * KULÜP ÜYELERİ
       */

      const {
        data: membersData,
        error: membersError,
      } = await supabase
        .from("club_members")
        .select(`
          user_id,
          joined_at,
          users (
            id,
            first_name,
            last_name,
            email,
            department,
            class_year,
            role_id,
            status_id
          )
        `)
        .eq(
          "club_id",
          club.id
        )
        .order(
          "joined_at",
          {
            ascending: true,
          }
        );

      if (membersError) {
        throw membersError;
      }

      /*
       * MEMBER + CLUB PRESIDENT
       */

      const {
        data: usersData,
        error: usersError,
      } = await supabase
        .from("users")
        .select(`
          id,
          first_name,
          last_name,
          email,
          role_id
        `)
        .in(
          "role_id",
          [2, 3]
        )
        .order(
          "first_name",
          {
            ascending: true,
          }
        );

      if (usersError) {
        throw usersError;
      }

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
        );

      if (clubsError) {
        throw clubsError;
      }

      /*
       * ÜYELERİ HAZIRLA
       */

      const formattedMembers =
        (membersData || [])
          .map(
            (item) =>
              item.users
          )
          .filter(Boolean);

      setMembers(
        formattedMembers
      );

      /*
       * BAŞKA KULÜPLERİN BAŞKANLARI
       */

      const otherClubPresidentIds =
        (clubsData || [])
          .filter(
            (item) =>
              item.id !== club.id &&
              item.president_id
          )
          .map(
            (item) =>
              item.president_id
          );

      /*
       * UYGUN BAŞKAN ADAYLARI
       */

      const availableCandidates =
        (usersData || []).filter(
          (user) => {
            if (
              user.id ===
              presidentId
            ) {
              return true;
            }

            return !otherClubPresidentIds.includes(
              user.id
            );
          }
        );

      setPresidentCandidates(
        availableCandidates
      );
    } catch (error) {
      console.error(
        "Club detail loading error:",
        error
      );

      Alert.alert(
        "Hata",
        error.message ||
          "Kulüp bilgileri yüklenemedi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [club?.id]);

  /*
   * =====================================================
   * BAŞKAN ATA
   * =====================================================
   */

  const handleAssignPresident =
    async (newPresidentId) => {
      if (
        !club?.id ||
        !newPresidentId ||
        savingPresident
      ) {
        return;
      }

      if (
        newPresidentId ===
        presidentId
      ) {
        return;
      }

      try {
        setSavingPresident(true);

        /*
         * BAŞKA KULÜBÜN BAŞKANI MI?
         */

        const {
          data: existingPresidentClubs,
          error:
            existingPresidentError,
        } = await supabase
          .from("club")
          .select(
            "id, club_name"
          )
          .eq(
            "president_id",
            newPresidentId
          )
          .neq(
            "id",
            club.id
          );

        if (existingPresidentError) {
          throw existingPresidentError;
        }

        if (
          existingPresidentClubs &&
          existingPresidentClubs.length >
            0
        ) {
          Alert.alert(
            "Başkan atanamadı",
            "Bu kullanıcı zaten başka bir kulübün başkanı."
          );

          return;
        }

        const oldPresidentId =
          presidentId;

        /*
         * YENİ BAŞKANIN ROLÜ
         */

        const {
          error: newPresidentError,
        } = await supabase
          .from("users")
          .update({
            role_id: 3,
          })
          .eq(
            "id",
            newPresidentId
          );

        if (newPresidentError) {
          throw newPresidentError;
        }

        /*
         * KULÜBE ÜYE EKLE
         */

        const {
          error: membershipError,
        } = await supabase
          .from("club_members")
          .upsert(
            {
              club_id: club.id,
              user_id:
                newPresidentId,
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
         * KULÜP BAŞKANINI GÜNCELLE
         */

        const {
          error: clubError,
        } = await supabase
          .from("club")
          .update({
            president_id:
              newPresidentId,
          })
          .eq(
            "id",
            club.id
          );

        if (clubError) {
          throw clubError;
        }

        /*
         * ESKİ BAŞKANI MEMBER YAP
         */

        if (
          oldPresidentId &&
          oldPresidentId !==
            newPresidentId
        ) {
          const {
            data: oldPresident,
            error:
              oldPresidentError,
          } = await supabase
            .from("users")
            .select(
              "id, role_id"
            )
            .eq(
              "id",
              oldPresidentId
            )
            .single();

          if (
            !oldPresidentError &&
            oldPresident &&
            oldPresident.role_id === 3
          ) {
            const {
              data: otherClubs,
              error:
                otherClubsError,
            } = await supabase
              .from("club")
              .select("id")
              .eq(
                "president_id",
                oldPresidentId
              )
              .neq(
                "id",
                club.id
              );

            if (
              !otherClubsError &&
              (!otherClubs ||
                otherClubs.length ===
                  0)
            ) {
              await supabase
                .from("users")
                .update({
                  role_id: 2,
                })
                .eq(
                  "id",
                  oldPresidentId
                );
            }
          }
        }

        setPresidentId(
          newPresidentId
        );

        await loadData();

        Alert.alert(
          "Başarılı",
          "Kulüp başkanı başarıyla güncellendi."
        );
      } catch (error) {
        console.error(
          "Assign president error:",
          error
        );

        Alert.alert(
          "Hata",
          error.message ||
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

  const handleRemovePresident =
    async () => {
      if (
        !club?.id ||
        !presidentId ||
        savingPresident
      ) {
        return;
      }

      try {
        setSavingPresident(true);

        const oldPresidentId =
          presidentId;

        /*
         * KULÜPTEN BAŞKANI KALDIR
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
            club.id
          );

        if (clubError) {
          throw clubError;
        }

        /*
         * ESKİ BAŞKANI MEMBER YAP
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
            oldPresidentId
          )
          .eq(
            "role_id",
            3
          );

        if (userError) {
          throw userError;
        }

        setPresidentId(null);

        await loadData();

        Alert.alert(
          "Başarılı",
          "Kulüp başkanlığı kaldırıldı."
        );
      } catch (error) {
        console.error(
          "Remove president error:",
          error
        );

        Alert.alert(
          "Hata",
          error.message ||
            "Başkanlık kaldırılamadı."
        );
      } finally {
        setSavingPresident(false);
      }
    };

  /*
   * =====================================================
   * KULÜP YOK
   * =====================================================
   */

  if (!club) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={styles.emptyContainer}
        >
          <Text
            style={styles.emptyText}
          >
            Kulüp bulunamadı.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
   * =====================================================
   * MEVCUT BAŞKAN
   * =====================================================
   */

  const currentPresident =
    presidentCandidates.find(
      (user) =>
        user.id === presidentId
    );

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

        <Text
          style={styles.headerTitle}
        >
          Kulüp Detayı
        </Text>

        <View
          style={styles.headerSpacer}
        />
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
      >
        {/* KULÜP */}

        <View
          style={styles.heroCard}
        >
          <View
            style={styles.clubIcon}
          >
            <Ionicons
              name="people"
              size={32}
              color="#7C3AED"
            />
          </View>

          <Text
            style={styles.clubName}
          >
            {club.club_name}
          </Text>

          <Text
            style={styles.description}
          >
            {club.description ||
              "Kulüp açıklaması bulunmuyor."}
          </Text>
        </View>

        {/* İLETİŞİM */}

        <Text
          style={styles.sectionTitle}
        >
          İletişim Bilgileri
        </Text>

        <View
          style={styles.infoCard}
        >
          <InfoRow
            icon="mail-outline"
            title="E-posta"
            value={
              club.email ||
              "Belirtilmemiş"
            }
          />

          <InfoRow
            icon="call-outline"
            title="Telefon"
            value={
              club.phone ||
              "Belirtilmemiş"
            }
          />

          <InfoRow
            icon="location-outline"
            title="Adres"
            value={
              club.address ||
              "Belirtilmemiş"
            }
            last
          />
        </View>

        {/* BAŞKAN */}

        <Text
          style={styles.sectionTitle}
        >
          Kulüp Başkanı
        </Text>

        <View
          style={styles.presidentCard}
        >
          <View
            style={styles.presidentIcon}
          >
            <Ionicons
              name="ribbon-outline"
              size={25}
              color="#F59E0B"
            />
          </View>

          <View
            style={styles.presidentInfo}
          >
            <Text
              style={styles.presidentLabel}
            >
              Mevcut Başkan
            </Text>

            <Text
              style={styles.presidentName}
            >
              {currentPresident
                ? `${currentPresident.first_name} ${currentPresident.last_name}`
                : "Başkan atanmadı"}
            </Text>
          </View>
        </View>

        {/* BAŞKANLIĞI KALDIR */}

        {presidentId ? (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={
              savingPresident
            }
            onPress={
              handleRemovePresident
            }
            style={[
              styles.removePresidentButton,
              savingPresident &&
                styles.disabledRemoveButton,
            ]}
          >
            {savingPresident ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color="#DC2626"
                />

                <Text
                  style={
                    styles.removePresidentText
                  }
                >
                  Başkanlığı Kaldır
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {/* BAŞKAN ATA */}

        <Text
          style={styles.sectionTitle}
        >
          Başkan Ata
        </Text>

        <Text
          style={
            styles.sectionDescription
          }
        >
          Bir kullanıcıyı kulüp başkanı
          yaptığınızda otomatik olarak
          bu kulübe üye olur.
        </Text>

        {presidentCandidates.length >
        0 ? (
          <View
            style={styles.candidateList}
          >
            {presidentCandidates.map(
              (candidate) => {
                const selected =
                  candidate.id ===
                  presidentId;

                return (
                  <TouchableOpacity
                    key={
                      candidate.id
                    }
                    activeOpacity={0.8}
                    disabled={
                      savingPresident
                    }
                    onPress={() =>
                      handleAssignPresident(
                        candidate.id
                      )
                    }
                    style={[
                      styles.candidateCard,
                      selected &&
                        styles.selectedCandidate,
                    ]}
                  >
                    <View
                      style={[
                        styles.candidateIcon,
                        selected &&
                          styles.selectedCandidateIcon,
                      ]}
                    >
                      <Text
                        style={[
                          styles.candidateInitials,
                          selected &&
                            styles.selectedCandidateInitials,
                        ]}
                      >
                        {(
                          (candidate.first_name
                            ?.charAt(0) ||
                            "") +
                          (candidate.last_name
                            ?.charAt(0) ||
                            "")
                        ).toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.candidateInfo
                      }
                    >
                      <Text
                        style={
                          styles.candidateName
                        }
                      >
                        {
                          candidate.first_name
                        }{" "}
                        {
                          candidate.last_name
                        }
                      </Text>

                      <Text
                        style={
                          styles.candidateEmail
                        }
                      >
                        {candidate.email ||
                          "E-posta yok"}
                      </Text>

                      {selected && (
                        <Text
                          style={
                            styles.currentPresidentText
                          }
                        >
                          Mevcut başkan
                        </Text>
                      )}
                    </View>

                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={23}
                        color="#16A34A"
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={19}
                        color="#CBD5E1"
                      />
                    )}
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        ) : (
          <View
            style={
              styles.noCandidateCard
            }
          >
            <Ionicons
              name="person-outline"
              size={30}
              color="#94A3B8"
            />

            <Text
              style={
                styles.noCandidateText
              }
            >
              Başkan atanabilecek
              kullanıcı bulunmuyor.
            </Text>
          </View>
        )}

        {/* ÜYELER */}

        <Text
          style={styles.sectionTitle}
        >
          Kulüp Üyeleri
        </Text>

        <View
          style={styles.memberCountCard}
        >
          <View
            style={styles.memberIcon}
          >
            <Ionicons
              name="people-outline"
              size={25}
              color="#2563EB"
            />
          </View>

          <View>
            <Text
              style={styles.memberCount}
            >
              {members.length}
            </Text>

            <Text
              style={styles.memberLabel}
            >
              kayıtlı üye
            </Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator
            style={styles.loading}
            size="large"
            color="#2563EB"
          />
        ) : members.length > 0 ? (
          members.map(
            (member) => (
              <TouchableOpacity
                key={member.id}
                activeOpacity={0.8}
                style={
                  styles.memberCard
                }
                onPress={() =>
                  navigation.navigate(
                    "AdminUserDetail",
                    {
                      user: member,
                    }
                  )
                }
              >
                <View
                  style={styles.avatar}
                >
                  <Text
                    style={
                      styles.avatarText
                    }
                  >
                    {(
                      (member.first_name
                        ?.charAt(0) ||
                        "") +
                      (member.last_name
                        ?.charAt(0) ||
                        "")
                    ).toUpperCase()}
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
                    {
                      member.first_name
                    }{" "}
                    {
                      member.last_name
                    }
                  </Text>

                  <Text
                    style={
                      styles.memberDepartment
                    }
                  >
                    {member.department ||
                      "Bölüm belirtilmemiş"}
                  </Text>
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
            style={styles.noMembers}
          >
            <Ionicons
              name="people-outline"
              size={35}
              color="#94A3B8"
            />

            <Text
              style={
                styles.noMembersText
              }
            >
              Bu kulüpte henüz üye
              bulunmuyor.
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
        !last &&
          styles.infoBorder,
      ]}
    >
      <View
        style={styles.infoIcon}
      >
        <Ionicons
          name={icon}
          size={20}
          color="#7C3AED"
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

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#64748B",
  },

  /*
   * HEADER
   */

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

  /*
   * HERO
   */

  heroCard: {
    margin: 20,
    padding: 25,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  clubIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  clubName: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },

  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  /*
   * SECTION
   */

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 13,
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
  },

  sectionDescription: {
    marginHorizontal: 20,
    marginTop: -5,
    marginBottom: 12,
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
  },

  /*
   * INFO
   */

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
    backgroundColor: "#F5F3FF",
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

  /*
   * PRESIDENT
   */

  presidentCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  presidentIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  presidentInfo: {
    flex: 1,
  },

  presidentLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 4,
  },

  presidentName: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  removePresidentButton: {
    marginHorizontal: 20,
    marginTop: 10,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledRemoveButton: {
    opacity: 0.5,
  },

  removePresidentText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },

  /*
   * CANDIDATES
   */

  candidateList: {
    marginHorizontal: 20,
  },

  candidateCard: {
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

  selectedCandidate: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },

  candidateIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  selectedCandidateIcon: {
    backgroundColor: "#F59E0B",
  },

  candidateInitials: {
    color: "#4F46E5",
    fontSize: 14,
    fontWeight: "800",
  },

  selectedCandidateInitials: {
    color: "#FFFFFF",
  },

  candidateInfo: {
    flex: 1,
  },

  candidateName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  candidateEmail: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  currentPresidentText: {
    color: "#F59E0B",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },

  noCandidateCard: {
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  noCandidateText: {
    color: "#94A3B8",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },

  /*
   * MEMBERS
   */

  memberCountCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  memberIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  memberCount: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
  },

  memberLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 2,
  },

  memberCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#4F46E5",
    fontSize: 15,
    fontWeight: "800",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  memberDepartment: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  noMembers: {
    marginHorizontal: 20,
    padding: 35,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  noMembersText: {
    color: "#94A3B8",
    fontSize: 13,
    marginTop: 10,
  },

  loading: {
    marginTop: 25,
  },

  bottomSpacing: {
    height: 30,
  },
});
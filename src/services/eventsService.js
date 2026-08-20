import { supabase } from "../config/supabase";

/*
 * ============================================================
 * CURRENT USER PROFILE
 * ============================================================
 */

const getCurrentUserProfile =
  async () => {
    const {
      data: { user },
      error: authError,
    } =
      await supabase.auth.getUser();

    if (authError) {
      throw authError;
    }

    if (!user) {
      throw new Error(
        "Oturum açmış kullanıcı bulunamadı."
      );
    }

    /*
     * ========================================================
     * 1. users.id
     * ========================================================
     */

    const {
      data: userById,
      error: idError,
    } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (idError) {
      throw idError;
    }

    if (userById) {
      return userById;
    }

    /*
     * ========================================================
     * 2. auth_user_id
     * ========================================================
     */

    const {
      data: userByAuthId,
      error: authIdError,
    } =
      await supabase
        .from("users")
        .select("id")
        .eq(
          "auth_user_id",
          user.id
        )
        .maybeSingle();

    if (authIdError) {
      throw authIdError;
    }

    if (userByAuthId) {
      return userByAuthId;
    }

    /*
     * ========================================================
     * 3. Email
     * ========================================================
     */

    if (!user.email) {
      throw new Error(
        "Kullanıcı e-posta adresi bulunamadı."
      );
    }

    const {
      data: userByEmail,
      error: emailError,
    } =
      await supabase
        .from("users")
        .select("id")
        .eq(
          "email",
          user.email
        )
        .maybeSingle();

    if (emailError) {
      throw emailError;
    }

    if (!userByEmail) {
      throw new Error(
        "Kullanıcının users tablosunda profil kaydı bulunamadı."
      );
    }

    return userByEmail;
  };

/*
 * ============================================================
 * GET EVENTS
 *
 * SADECE KULLANICININ ONAYLI ÜYESİ OLDUĞU
 * KULÜPLERİN ETKİNLİKLERİNİ GETİRİR.
 * ============================================================
 */

export const getEvents =
  async () => {
    try {

      /*
       * ======================================================
       * 1. AKTİF KULLANICI
       * ======================================================
       */

      const currentUser =
        await getCurrentUserProfile();

      /*
       * ======================================================
       * 2. KULLANICININ ONAYLI KULÜP ÜYELİKLERİNİ GETİR
       * ======================================================
       */

      const {
        data: memberships,
        error: membershipError,
      } = await supabase
        .from("club_members")
        .select(
          "club_id, user_id, status"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .eq(
          "status",
          "approved"
        );

      if (membershipError) {
        throw membershipError;
      }

      /*
       * ======================================================
       * 3. ÜYE OLUNAN KULÜPLERİN ID'LERİ
       * ======================================================
       */

      const clubIds =
        (memberships || [])
          .map(
            (membership) =>
              membership.club_id
          )
          .filter(Boolean);

      /*
       * Kullanıcının onaylı üyeliği yoksa
       * etkinlik göstermiyoruz.
       */

      if (clubIds.length === 0) {
        return {
          success: true,
          data: [],
          error: null,
        };
      }

      /*
       * ======================================================
       * 4. SADECE ÜYE OLUNAN KULÜPLERİN
       *    AKTİF ETKİNLİKLERİNİ GETİR
       * ======================================================
       */

      const {
        data: events,
        error: eventsError,
      } =
        await supabase
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
            club_id,
            created_by,
            created_at,

            category:event_categories (
              id,
              category_name
            ),

            event_participants (
              user_id,
              approval_status
            )
          `)
          .eq(
            "is_active",
            true
          )
          .in(
            "club_id",
            clubIds
          )
          .order(
            "event_date",
            {
              ascending: true,
            }
          )
          .order(
            "event_time",
            {
              ascending: true,
            }
          );

      if (eventsError) {
        throw eventsError;
      }

      /*
       * ======================================================
       * 5. ETKİNLİKLERİ FORMATLA
       * ======================================================
       */

      const formattedEvents =
        (events || []).map(
          (event) => {

            const participants =
              event.event_participants ||
              [];

            /*
             * Sadece approved katılımcıları
             * gerçek katılımcı olarak say.
             */

            const approvedParticipants =
              participants.filter(
                (participant) =>
                  participant.approval_status ===
                    "approved" ||
                  participant.approval_status ===
                    null
              );

            /*
             * ==================================================
             * MEVCUT KULLANICININ ETKİNLİK KATILIMI
             * ==================================================
             */

            const userParticipation =
              participants.find(
                (participant) =>
                  participant.user_id ===
                  currentUser.id
              );

            const approvalStatus =
              userParticipation
                ?.approval_status ||
              null;

            const isJoined =
              approvalStatus ===
                "approved" ||
              (
                approvalStatus ===
                  null &&
                !!userParticipation
              );

            /*
             * ==================================================
             * FORMATLANMIŞ ETKİNLİK
             * ==================================================
             */

            return {
              id:
                event.id,

              title:
                event.title,

              description:
                event.description,

              date:
                event.event_date,

              time:
                event.event_time
                  ? event.event_time.substring(
                      0,
                      5
                    )
                  : null,

              location:
                event.location,

              maxParticipants:
                event.max_participants,

              participantCount:
                approvedParticipants.length,

              isJoined,

              approvalStatus,

              categoryId:
                event.category_id,

              category:
                event.category
                  ?.category_name ||
                "Etkinlik",

              clubId:
                event.club_id,

              createdBy:
                event.created_by,

              createdAt:
                event.created_at,
            };
          }
        );

      /*
       * ======================================================
       * 6. SONUÇ
       * ======================================================
       */

      return {
        success: true,
        data: formattedEvents,
        error: null,
      };

    } catch (error) {

      console.error(
        "getEvents error:",
        error
      );

      return {
        success: false,
        data: [],
        error:
          error.message ||
          "Etkinlikler alınırken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * GET EVENT CATEGORIES
 * ============================================================
 */

export const getEventCategories =
  async () => {
    try {

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "event_categories"
          )
          .select(
            "id, category_name"
          )
          .order(
            "category_name",
            {
              ascending: true,
            }
          );

      if (error) {
        throw error;
      }

      const categories =
        (data || []).map(
          (category) => ({
            id:
              category.id,

            name:
              category.category_name,
          })
        );

      return {
        success: true,
        data: [
          {
            id: "all",
            name: "Tümü",
          },
          ...categories,
        ],
        error: null,
      };

    } catch (error) {

      console.error(
        "getEventCategories error:",
        error
      );

      return {
        success: false,
        data: [
          {
            id: "all",
            name: "Tümü",
          },
        ],
        error:
          error.message ||
          "Kategoriler alınırken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * JOIN EVENT
 * ============================================================
 *
 * Kullanıcı:
 *
 * 1. Etkinliğin kulübüne approved üye olmalı.
 * 2. Kontenjan dolmamış olmalı.
 * 3. Daha önce başvurmamış olmalı.
 *
 * Sonrasında:
 *
 * approval_status = pending
 *
 * olarak başvuru oluşturulur.
 * ============================================================
 */

export const joinEvent =
  async (eventId) => {
    try {

      const currentUser =
        await getCurrentUserProfile();

      /*
       * ======================================================
       * ETKİNLİK
       * ======================================================
       */

      const {
        data: event,
        error: eventError,
      } =
        await supabase
          .from("events")
          .select(`
            id,
            club_id,
            max_participants,
            is_active
          `)
          .eq(
            "id",
            eventId
          )
          .maybeSingle();

      if (eventError) {
        throw eventError;
      }

      if (!event) {
        return {
          success: false,
          alreadyJoined: false,
          alreadyPending: false,
          notClubMember: false,
          error:
            "Etkinlik bulunamadı.",
        };
      }

      if (!event.is_active) {
        return {
          success: false,
          alreadyJoined: false,
          alreadyPending: false,
          notClubMember: false,
          error:
            "Bu etkinlik artık aktif değil.",
        };
      }

      if (!event.club_id) {
        return {
          success: false,
          alreadyJoined: false,
          alreadyPending: false,
          notClubMember: false,
          error:
            "Bu etkinlik herhangi bir kulübe bağlı değil.",
        };
      }

      /*
       * ======================================================
       * KULÜP ÜYELİĞİ
       *
       * Sadece approved üyeler etkinliğe
       * başvurabilir.
       * ======================================================
       */

      const {
        data: clubMembership,
        error:
          membershipError,
      } =
        await supabase
          .from("club_members")
          .select(
            "club_id, user_id, status"
          )
          .eq(
            "club_id",
            event.club_id
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .eq(
            "status",
            "approved"
          )
          .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      if (!clubMembership) {
        return {
          success: false,
          alreadyJoined: false,
          alreadyPending: false,
          notClubMember: true,
          error:
            "Bu etkinliğe katılabilmek için öncelikle etkinliğin bağlı olduğu kulübe üye olmanız ve üyeliğinizin onaylanması gerekiyor.",
        };
      }

      /*
       * ======================================================
       * DAHA ÖNCE BAŞVURU VAR MI?
       * ======================================================
       */

      const {
        data:
          existingParticipant,
        error:
          participantError,
      } =
        await supabase
          .from(
            "event_participants"
          )
          .select(
            "id, event_id, user_id, approval_status"
          )
          .eq(
            "event_id",
            eventId
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .maybeSingle();

      if (participantError) {
        throw participantError;
      }

      if (
        existingParticipant
          ?.approval_status ===
        "approved"
      ) {
        return {
          success: false,
          alreadyJoined: true,
          alreadyPending: false,
          notClubMember: false,
          error:
            "Bu etkinliğe zaten katıldınız.",
        };
      }

      if (
        existingParticipant
          ?.approval_status ===
        "pending"
      ) {
        return {
          success: false,
          alreadyJoined: false,
          alreadyPending: true,
          notClubMember: false,
          error:
            "Etkinlik katılım başvurunuz zaten onay bekliyor.",
        };
      }

      /*
       * ======================================================
       * KONTENJAN
       *
       * Sadece onaylı katılımcıları sayıyoruz.
       * ======================================================
       */

      const {
        count,
        error: countError,
      } =
        await supabase
          .from(
            "event_participants"
          )
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq(
            "event_id",
            eventId
          )
          .eq(
            "approval_status",
            "approved"
          );

      if (countError) {
        throw countError;
      }

      if (
        event.max_participants !==
          null &&
        count >=
          event.max_participants
      ) {
        return {
          success: false,
          alreadyJoined: false,
          alreadyPending: false,
          notClubMember: false,
          full: true,
          error:
            "Bu etkinliğin kontenjanı dolmuştur.",
        };
      }

      /*
       * ======================================================
       * YENİ BAŞVURU
       * ======================================================
       */

      if (
        existingParticipant
      ) {

        /*
         * Eski rejected kayıt varsa
         * tekrar pending yap.
         */

        const {
          error:
            updateError,
        } =
          await supabase
            .from(
              "event_participants"
            )
            .update({
              approval_status:
                "pending",
            })
            .eq(
              "id",
              existingParticipant.id
            );

        if (updateError) {
          throw updateError;
        }

      } else {

        /*
         * Yeni kayıt.
         */

        const {
          error:
            insertError,
        } =
          await supabase
            .from(
              "event_participants"
            )
            .insert({
              event_id:
                eventId,

              user_id:
                currentUser.id,

              approval_status:
                "pending",
            });

        if (insertError) {
          throw insertError;
        }
      }

      return {
        success: true,
        alreadyJoined: false,
        alreadyPending: false,
        notClubMember: false,
        pending: true,
        error: null,
      };

    } catch (error) {

      console.error(
        "joinEvent error:",
        error
      );

      return {
        success: false,
        alreadyJoined: false,
        alreadyPending: false,
        notClubMember: false,
        error:
          error.message ||
          "Etkinliğe katılırken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * LEAVE EVENT
 * ============================================================
 */

export const leaveEvent =
  async (eventId) => {
    try {

      const currentUser =
        await getCurrentUserProfile();

      const {
        error,
      } =
        await supabase
          .from(
            "event_participants"
          )
          .delete()
          .eq(
            "event_id",
            eventId
          )
          .eq(
            "user_id",
            currentUser.id
          );

      if (error) {
        throw error;
      }

      return {
        success: true,
        error: null,
      };

    } catch (error) {

      console.error(
        "leaveEvent error:",
        error
      );

      return {
        success: false,
        error:
          error.message ||
          "Etkinlikten ayrılırken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * MARK ATTENDANCE
 * ============================================================
 */

export const markAttendance =
  async (eventId) => {
    try {

      if (!eventId) {
        throw new Error(
          "Geçerli bir etkinlik bulunamadı."
        );
      }

      const currentUser =
        await getCurrentUserProfile();

      /*
       * ======================================================
       * ETKİNLİK
       * ======================================================
       */

      const {
        data: event,
        error: eventError,
      } =
        await supabase
          .from("events")
          .select(`
            id,
            title,
            is_active,
            event_date,
            event_time
          `)
          .eq(
            "id",
            eventId
          )
          .maybeSingle();

      if (eventError) {
        throw eventError;
      }

      if (!event) {
        return {
          success: false,
          error:
            "Bu QR koduna ait etkinlik bulunamadı.",
        };
      }

      if (!event.is_active) {
        return {
          success: false,
          error:
            "Bu etkinlik artık aktif değil.",
        };
      }

      /*
       * ======================================================
       * SADECE APPROVED KATILIMCI
       * YOKLAMA VEREBİLİR.
       * ======================================================
       */

      const {
        data: participant,
        error:
          participantError,
      } =
        await supabase
          .from(
            "event_participants"
          )
          .select(
            "event_id, user_id, approval_status"
          )
          .eq(
            "event_id",
            eventId
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .eq(
            "approval_status",
            "approved"
          )
          .maybeSingle();

      if (participantError) {
        throw participantError;
      }

      if (!participant) {
        return {
          success: false,
          error:
            "Bu etkinliğe katılımınız henüz onaylanmadı.",
        };
      }

      /*
       * ======================================================
       * DAHA ÖNCE YOKLAMA
       * ======================================================
       */

      const {
        data:
          existingAttendance,
        error:
          attendanceCheckError,
      } =
        await supabase
          .from("attendance")
          .select(
            "event_id, user_id"
          )
          .eq(
            "event_id",
            eventId
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .maybeSingle();

      if (attendanceCheckError) {
        throw attendanceCheckError;
      }

      if (existingAttendance) {
        return {
          success: false,
          alreadyAttended: true,
          error:
            "Bu etkinlik için yoklamanız zaten alınmış.",
        };
      }

      /*
       * ======================================================
       * YOKLAMA KAYDI
       * ======================================================
       */

      const {
        error: insertError,
      } =
        await supabase
          .from("attendance")
          .insert({
            event_id:
              eventId,

            user_id:
              currentUser.id,
          });

      if (insertError) {
        throw insertError;
      }

      return {
        success: true,
        message:
          `${event.title} etkinliği için katılımınız kaydedildi.`,
        error: null,
      };

    } catch (error) {

      console.error(
        "markAttendance error:",
        error
      );

      return {
        success: false,
        error:
          error.message ||
          "Katılım kaydedilirken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * GET EVENT BY ID
 * ============================================================
 */

export const getEventById =
  async (eventId) => {
    try {

      if (!eventId) {
        throw new Error(
          "Etkinlik ID bulunamadı."
        );
      }

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "Oturum açmış kullanıcı bulunamadı."
        );
      }

      const currentUser =
        await getCurrentUserProfile();

      const {
        data: event,
        error: eventError,
      } =
        await supabase
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
            club_id,
            created_by,
            created_at,

            category:event_categories (
              id,
              category_name
            ),

            event_participants (
              user_id,
              approval_status
            )
          `)
          .eq(
            "id",
            eventId
          )
          .maybeSingle();

      if (eventError) {
        throw eventError;
      }

      if (!event) {
        return {
          success: false,
          data: null,
          error:
            "Etkinlik bulunamadı.",
        };
      }

      const participants =
        event.event_participants ||
        [];

      const approvedParticipants =
        participants.filter(
          (participant) =>
            participant.approval_status ===
              "approved" ||
            participant.approval_status ===
              null
        );

      const userParticipation =
        participants.find(
          (participant) =>
            participant.user_id ===
            currentUser.id
        );

      const approvalStatus =
        userParticipation
          ?.approval_status ||
        null;

      const isJoined =
        approvalStatus ===
          "approved" ||
        (
          approvalStatus ===
            null &&
          !!userParticipation
        );

      const formattedEvent = {
        id:
          event.id,

        title:
          event.title,

        description:
          event.description,

        date:
          event.event_date,

        time:
          event.event_time
            ? event.event_time.substring(
                0,
                5
              )
            : null,

        location:
          event.location,

        maxParticipants:
          event.max_participants,

        participantCount:
          approvedParticipants.length,

        isJoined,

        approvalStatus,

        categoryId:
          event.category_id,

        category:
          event.category
            ?.category_name ||
          "Etkinlik",

        clubId:
          event.club_id,

        createdBy:
          event.created_by,

        createdAt:
          event.created_at,

        isActive:
          event.is_active,
      };

      return {
        success: true,
        data: formattedEvent,
        error: null,
      };

    } catch (error) {

      console.error(
        "getEventById error:",
        error
      );

      return {
        success: false,
        data: null,
        error:
          error.message ||
          "Etkinlik bilgileri alınırken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * UPDATE EVENT PARTICIPANT STATUS
 * ============================================================
 *
 * Kulüp başkanı tarafından kullanılır.
 * ============================================================
 */

export const updateEventParticipantStatus =
  async (
    participantId,
    status
  ) => {
    try {

      if (
        !participantId ||
        !status
      ) {
        throw new Error(
          "Geçersiz katılımcı bilgisi."
        );
      }

      if (
        ![
          "approved",
          "rejected",
        ].includes(status)
      ) {
        throw new Error(
          "Geçersiz onay durumu."
        );
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "event_participants"
          )
          .update({
            approval_status:
              status,
          })
          .eq(
            "id",
            participantId
          )
          .select(
            "id, event_id, user_id, approval_status"
          )
          .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error(
          "Katılımcı durumu güncellenemedi."
        );
      }

      return {
        success: true,
        data,
        error: null,
      };

    } catch (error) {

      console.error(
        "updateEventParticipantStatus error:",
        error
      );

      return {
        success: false,
        data: null,
        error:
          error.message ||
          "Katılımcı durumu güncellenemedi.",
      };
    }
  };
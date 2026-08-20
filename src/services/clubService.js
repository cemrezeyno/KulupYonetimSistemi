import { supabase } from "../config/supabase";

/*
 * ============================================================
 * CURRENT USER PROFILE
 * ============================================================
 */

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

  /*
   * 1. users.id = auth user id
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
   * 2. users.auth_user_id
   */

  const {
    data: userByAuthId,
    error: authIdError,
  } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (authIdError) {
    throw authIdError;
  }

  if (userByAuthId) {
    return userByAuthId;
  }

  /*
   * 3. Email
   */

  if (user.email) {
    const {
      data: userByEmail,
      error: emailError,
    } = await supabase
      .from("users")
      .select("id")
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

/*
 * ============================================================
 * GET CLUBS
 * ============================================================
 */

export const getClubs = async () => {
  try {
    const {
      data,
      error,
    } = await supabase
      .from("club")
      .select(`
        id,
        club_name,
        description,
        email
      `)
      .order("club_name", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    /*
     * Ekran tarafında club.name kullanılıyor.
     * Bu nedenle burada name alanını da oluşturuyoruz.
     */

    const formattedClubs =
      (data || []).map(
        (club) => ({
          id: club.id,
          name:
            club.club_name,
          club_name:
            club.club_name,
          description:
            club.description,
          email:
            club.email,
        })
      );

    return {
      success: true,
      data: formattedClubs,
      error: null,
    };
  } catch (error) {
    console.error(
      "getClubs error:",
      error
    );

    return {
      success: false,
      data: [],
      error:
        error.message ||
        "Kulüpler alınırken bir hata oluştu.",
    };
  }
};

    /*
 * ============================================================
 * REMOVE CLUB MEMBER
 * ============================================================
 *
 * Kulüp başkanı tarafından onaylanmış bir üyeyi
 * kulüpten çıkarmak için kullanılır.
 */

export const removeClubMember = async (
  clubId,
  userId
) => {
  try {
    if (!clubId) {
      throw new Error(
        "Geçerli bir kulüp bulunamadı."
      );
    }

    if (!userId) {
      throw new Error(
        "Geçerli bir kullanıcı bulunamadı."
      );
    }

    /*
     * --------------------------------------------------------
     * Giriş yapan kullanıcı
     * --------------------------------------------------------
     */

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

    /*
     * --------------------------------------------------------
     * Başkanın users profilini bul
     * --------------------------------------------------------
     */

    const {
      data: currentProfile,
      error: profileError,
    } = await supabase
      .from("users")
      .select(
        "id, role_id, club_id"
      )
      .eq(
        "auth_user_id",
        user.id
      )
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!currentProfile) {
      throw new Error(
        "Yönetici profili bulunamadı."
      );
    }

    /*
     * --------------------------------------------------------
     * KULÜP BAŞKANI KONTROLÜ
     * --------------------------------------------------------
     *
     * role_id = 3 -> Kulüp Başkanı
     *
     * Ayrıca yöneticinin kendi club_id'si,
     * işlem yapılan clubId ile aynı olmalı.
     */

    if (
      currentProfile.role_id !== 3
    ) {
      return {
        success: false,
        error:
          "Bu işlemi yalnızca kulüp başkanı yapabilir.",
      };
    }

    if (
      currentProfile.club_id !== clubId
    ) {
      return {
        success: false,
        error:
          "Bu kulübün üyelerini yönetme yetkiniz yok.",
      };
    }

    /*
     * --------------------------------------------------------
     * ÇIKARILACAK ÜYENİN KAYDINI BUL
     * --------------------------------------------------------
     */

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("club_members")
      .select(
        "id, club_id, user_id, status"
      )
      .eq(
        "id",
        userId
      )
      .maybeSingle();

    if (membershipError) {
      throw membershipError;
    }

    /*
     * Burada userId olarak membership ID
     * gönderilmesini bekliyoruz.
     */

    if (!membership) {
      return {
        success: false,
        error:
          "Üyelik kaydı bulunamadı.",
      };
    }

    /*
     * Başka kulübün üyeliği yanlışlıkla
     * silinmesin.
     */

    if (
      membership.club_id !== clubId
    ) {
      return {
        success: false,
        error:
          "Bu üyelik bu kulübe ait değil.",
      };
    }

    /*
     * Sadece onaylanmış üyeler çıkarılabilir.
     */

    if (
      membership.status !==
      "approved"
    ) {
      return {
        success: false,
        error:
          "Bu kullanıcı onaylanmış bir üye değil.",
      };
    }

    /*
     * --------------------------------------------------------
     * ÜYELİĞİ SİL
     * --------------------------------------------------------
     */

    const {
      error: deleteError,
    } = await supabase
      .from("club_members")
      .delete()
      .eq(
        "id",
        membership.id
      )
      .eq(
        "club_id",
        clubId
      );

    if (deleteError) {
      throw deleteError;
    }

    return {
      success: true,
      error: null,
    };

  } catch (error) {
    console.error(
      "removeClubMember error:",
      error
    );

    return {
      success: false,
      error:
        error.message ||
        "Üye kulüpten çıkarılırken bir hata oluştu.",
    };
  }
};
/*
 * ============================================================
 * GET CLUB BY ID
 * ============================================================
 */

export const getClubById =
  async (clubId) => {
    try {
      if (!clubId) {
        throw new Error(
          "Kulüp ID bulunamadı."
        );
      }

      /*
       * Kulüp bilgileri
       */

      const {
        data: club,
        error: clubError,
      } = await supabase
        .from("club")
        .select(`
          id,
          club_name,
          description,
          email
        `)
        .eq("id", clubId)
        .maybeSingle();

      if (clubError) {
        throw clubError;
      }

      if (!club) {
        return {
          success: false,
          data: null,
          error:
            "Kulüp bulunamadı.",
        };
      }

      /*
       * Kulüp etkinlikleri
       */

      const {
        data: events,
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
          category_id
        `)
        .eq(
          "club_id",
          clubId
        )
        .eq(
          "is_active",
          true
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

      /*
       * Kullanıcı üyelik durumu
       */

      let membershipStatus =
        "none";

      try {
        const currentUser =
          await getCurrentUserProfile();

        const {
          data: membership,
          error:
            membershipError,
        } = await supabase
          .from("club_members")
          .select(
            "club_id, user_id, status"
          )
          .eq(
            "club_id",
            clubId
          )
          .eq(
            "user_id",
            currentUser.id
          )
          .maybeSingle();

        if (membershipError) {
          throw membershipError;
        }

        if (membership) {
          membershipStatus =
            membership.status ||
            "approved";
        }
      } catch (membershipError) {
        console.log(
          "Membership check:",
          membershipError.message
        );
      }

      /*
       * Üye sayısı
       *
       * Sadece approved üyeleri
       * sayıyoruz.
       */

      const {
        count: memberCount,
        error:
          memberCountError,
      } = await supabase
        .from("club_members")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(
          "club_id",
          clubId
        )
        .eq(
          "status",
          "approved"
        );

      if (
        memberCountError
      ) {
        console.log(
          "Member count error:",
          memberCountError.message
        );
      }

      return {
        success: true,

        data: {
          id: club.id,

          name:
            club.club_name,

          club_name:
            club.club_name,

          description:
            club.description,

          email:
            club.email,

          memberCount:
            memberCount || 0,

          membershipStatus,

          isMember:
            membershipStatus ===
            "approved",

          events:
            (events || []).map(
              (event) => ({
                id: event.id,

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

                isActive:
                  event.is_active,

                categoryId:
                  event.category_id,
              })
            ),

          announcements: [],
        },

        error: null,
      };
    } catch (error) {
      console.error(
        "getClubById error:",
        error
      );

      return {
        success: false,
        data: null,
        error:
          error.message ||
          "Kulüp bilgileri alınırken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * CHECK CLUB MEMBERSHIP
 * ============================================================
 */

export const checkClubMembership =
  async (clubId) => {
    try {
      const currentUser =
        await getCurrentUserProfile();

      const {
        data,
        error,
      } = await supabase
        .from("club_members")
        .select(
          "club_id, user_id, status"
        )
        .eq(
          "club_id",
          clubId
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          success: true,
          isMember: false,
          status: "none",
          error: null,
        };
      }

      return {
        success: true,

        isMember:
          data.status ===
          "approved",

        status:
          data.status ||
          "approved",

        error: null,
      };
    } catch (error) {
      console.error(
        "checkClubMembership error:",
        error
      );

      return {
        success: false,
        isMember: false,
        status: "none",
        error:
          error.message ||
          "Üyelik kontrolü yapılamadı.",
      };
    }
  };

/*
 * ============================================================
 * JOIN CLUB
 * ============================================================
 *
 * Kullanıcı artık direkt üye olmaz.
 *
 * none
 *   ↓
 * pending
 *   ↓
 * Yönetici onayı
 *   ↓
 * approved
 *
 * ============================================================
 */

export const joinClub =
  async (clubId) => {
    try {
      if (!clubId) {
        throw new Error(
          "Geçerli bir kulüp bulunamadı."
        );
      }

      const currentUser =
        await getCurrentUserProfile();

      /*
       * Mevcut üyelik / başvuru
       */

      const {
        data: existingMembership,
        error:
          checkError,
      } = await supabase
        .from("club_members")
        .select(
          "club_id, user_id, status"
        )
        .eq(
          "club_id",
          clubId
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      /*
       * Zaten approved
       */

      if (
        existingMembership?.status ===
        "approved"
      ) {
        return {
          success: false,
          alreadyMember: true,
          alreadyPending: false,
          error:
            "Bu kulübe zaten üyesiniz.",
        };
      }

      /*
       * Zaten pending
       */

      if (
        existingMembership?.status ===
        "pending"
      ) {
        return {
          success: false,
          alreadyMember: false,
          alreadyPending: true,
          error:
            "Kulüp üyelik başvurunuz zaten onay bekliyor.",
        };
      }

      /*
       * Eski kayıt varsa ama rejected vb.
       * durumdaysa tekrar pending yap.
       */

      if (existingMembership) {
        const {
          error:
            updateError,
        } = await supabase
          .from("club_members")
          .update({
            status: "pending",
          })
          .eq(
            "club_id",
            clubId
          )
          .eq(
            "user_id",
            currentUser.id
          );

        if (updateError) {
          throw updateError;
        }

        return {
          success: true,
          alreadyMember: false,
          alreadyPending: false,
          error: null,
        };
      }

      /*
       * Yeni başvuru oluştur.
       *
       * DİKKAT:
       * Burada status = pending.
       */

      const {
        error: insertError,
      } = await supabase
        .from("club_members")
        .insert({
          club_id: clubId,
          user_id:
            currentUser.id,
          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      return {
        success: true,
        alreadyMember: false,
        alreadyPending: false,
        error: null,
      };
    } catch (error) {
      console.error(
        "joinClub error:",
        error
      );

      return {
        success: false,
        alreadyMember: false,
        alreadyPending: false,
        error:
          error.message ||
          "Kulübe katılırken bir hata oluştu.",
      };
    }
  };

/*
 * ============================================================
 * LEAVE CLUB
 * ============================================================
 */

export const leaveClub =
  async (clubId) => {
    try {
      if (!clubId) {
        throw new Error(
          "Geçerli bir kulüp bulunamadı."
        );
      }

      const currentUser =
        await getCurrentUserProfile();

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
        "leaveClub error:",
        error
      );

      return {
        success: false,
        error:
          error.message ||
          "Kulüpten ayrılırken bir hata oluştu.",
      };
    }
  };
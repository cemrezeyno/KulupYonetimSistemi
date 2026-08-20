import { supabase } from "../config/supabase";

export async function getHomeData() {
  /*
   * ==========================================================
   * AKTİF KULLANICI
   * ==========================================================
   */

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
      "Kullanıcı bulunamadı."
    );
  }

  /*
   * ==========================================================
   * PROFİL
   * ==========================================================
   */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("users")
    .select("*")
    .eq(
      "auth_user_id",
      user.id
    )
    .single();

  if (profileError) {
    throw profileError;
  }

  /*
   * ==========================================================
   * BUGÜNÜN TARİHİ
   * ==========================================================
   */

  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  const today =
    `${year}-${month}-${day}`;

  /*
   * ==========================================================
   * KULLANICININ ONAYLI KULÜPLERİ
   * ==========================================================
   */

  const {
    data: memberships,
    error: membershipError,
  } = await supabase
    .from("club_members")
    .select(`
      club_id,
      status
    `)
    .eq(
      "user_id",
      profile.id
    )
    .eq(
      "status",
      "approved"
    );

  if (membershipError) {
    throw membershipError;
  }

  /*
   * Sadece APPROVED kulüpler
   */

  const approvedClubIds =
    (memberships || []).map(
      (membership) =>
        membership.club_id
    );

  /*
   * ==========================================================
   * KULÜP YOKSA
   * ==========================================================
   *
   * Kullanıcının henüz onaylanmış kulübü yoksa
   * kulüp içerikleri gösterilmeyecek.
   */

  if (
    approvedClubIds.length === 0
  ) {
    /*
     * Kullanıcıya ait okunmamış bildirimler
     * yine getirilebilir.
     *
     * Ancak kulüp bildirimi sistemi user_id üzerinden
     * oluşturulduğu için burada mevcut sistemi koruyoruz.
     */

    const {
      count: notificationCount,
      error: notificationError,
    } = await supabase
      .from("notifications")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "user_id",
        profile.id
      )
      .eq(
        "is_read",
        false
      );

    if (notificationError) {
      throw notificationError;
    }

    return {
      profile,

      eventCount: 0,

      clubCount: 0,

      notificationCount:
        notificationCount || 0,

      todayEvents: [],

      upcomingEvents: [],

      announcements: [],

      popularEvents: [],

      leaderboard: [],
    };
  }

  /*
   * ==========================================================
   * ETKİNLİK SAYISI
   * ==========================================================
   *
   * Sadece kullanıcının onaylı kulüplerinin etkinlikleri.
   */

  const {
    count: eventCount,
    error: eventCountError,
  } = await supabase
    .from("events")
    .select("*", {
      count: "exact",
      head: true,
    })
    .in(
      "club_id",
      approvedClubIds
    )
    .eq(
      "is_active",
      true
    );

  if (eventCountError) {
    throw eventCountError;
  }

  /*
   * ==========================================================
   * BİLDİRİM SAYISI
   * ==========================================================
   */

  const {
    count: notificationCount,
    error: notificationError,
  } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "user_id",
      profile.id
    )
    .eq(
      "is_read",
      false
    );

  if (notificationError) {
    throw notificationError;
  }

  /*
   * ==========================================================
   * BUGÜNKÜ ETKİNLİKLER
   * ==========================================================
   */

  const {
    data: todayEvents,
    error: todayEventsError,
  } = await supabase
    .from("events")
    .select(`
      *,
      event_participants (
        user_id
      ),
      event_categories (
        id,
        category_name
      )
    `)
    .in(
      "club_id",
      approvedClubIds
    )
    .eq(
      "event_date",
      today
    )
    .eq(
      "is_active",
      true
    )
    .order(
      "event_time",
      {
        ascending: true,
      }
    );

  if (todayEventsError) {
    throw todayEventsError;
  }

  /*
   * ==========================================================
   * YAKLAŞAN ETKİNLİKLER
   * ==========================================================
   */

  const {
    data: upcomingEvents,
    error: upcomingEventsError,
  } = await supabase
    .from("events")
    .select(`
      *,
      event_participants (
        user_id
      ),
      event_categories (
        id,
        category_name
      )
    `)
    .in(
      "club_id",
      approvedClubIds
    )
    .gt(
      "event_date",
      today
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
    )
    .order(
      "event_time",
      {
        ascending: true,
      }
    )
    .limit(5);

  if (upcomingEventsError) {
    throw upcomingEventsError;
  }

  /*
   * ==========================================================
   * DUYURULAR
   * ==========================================================
   *
   * announcements tablosunda club_id olduğunu varsayıyoruz.
   */

  const {
    data: announcements,
    error: announcementsError,
  } = await supabase
    .from("announcements")
    .select("*")
    .in(
      "club_id",
      approvedClubIds
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(5);

  if (announcementsError) {
    throw announcementsError;
  }

  /*
   * ==========================================================
   * KULÜP SAYISI
   * ==========================================================
   */

  const clubCount =
    approvedClubIds.length;

  /*
   * ==========================================================
   * SONUÇ
   * ==========================================================
   */

  return {
    profile,

    eventCount:
      eventCount || 0,

    clubCount,

    notificationCount:
      notificationCount || 0,

    todayEvents:
      todayEvents || [],

    upcomingEvents:
      upcomingEvents || [],

    announcements:
      announcements || [],

    popularEvents: [],

    leaderboard: [],
  };
}
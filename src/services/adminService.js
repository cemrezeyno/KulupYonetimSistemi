import { supabase } from "../config/supabase";

/*
 * =====================================================
 * AKTİF KULLANICININ ROLÜNÜ GETİR
 * =====================================================
 */

export async function getCurrentUserRole(session) {
  if (!session?.user?.id) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from("users")
    .select(
      `
      id,
      auth_user_id,
      first_name,
      last_name,
      email,
      role_id
      `
    )
    .eq(
      "auth_user_id",
      session.user.id
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/*
 * =====================================================
 * ANA ADMİN Mİ?
 * role_id = 1
 * =====================================================
 */

export function isMainAdmin(user) {
  return user?.role_id === 1;
}

/*
 * =====================================================
 * KULÜP BAŞKANI MI?
 * role_id = 3
 * =====================================================
 */

export function isClubPresident(user) {
  return user?.role_id === 3;
}

/*
 * =====================================================
 * KULLANICININ YÖNETEBİLECEĞİ KULÜPLER
 *
 * Ana Admin:
 *      Bütün kulüpler
 *
 * Kulüp Başkanı:
 *      Sadece president_id kendi ID'si olan kulüp
 * =====================================================
 */

export async function getManagedClubs(
  user
) {
  if (!user?.id) {
    return [];
  }

  /*
   * ANA ADMİN
   */

  if (isMainAdmin(user)) {
    const {
      data,
      error,
    } = await supabase
      .from("club")
      .select("*")
      .order("club_name", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /*
   * KULÜP BAŞKANI
   */

  if (isClubPresident(user)) {
    const {
      data,
      error,
    } = await supabase
      .from("club")
      .select("*")
      .eq(
        "president_id",
        user.id
      )
      .order("club_name", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /*
   * NORMAL ÜYE
   */

  return [];
}

/*
 * =====================================================
 * YÖNETİLEBİLEN KULÜPLERİN ID'LERİ
 * =====================================================
 */

export async function getManagedClubIds(
  user
) {
  const clubs =
    await getManagedClubs(user);

  return clubs.map(
    (club) => club.id
  );
}

/*
 * =====================================================
 * BELİRLİ BİR KULÜBÜ YÖNETEBİLİYOR MU?
 * =====================================================
 */

export async function canManageClub(
  user,
  clubId
) {
  if (
    !user?.id ||
    !clubId
  ) {
    return false;
  }

  /*
   * Ana Admin her kulübü yönetebilir.
   */

  if (isMainAdmin(user)) {
    return true;
  }

  /*
   * Kulüp Başkanı yalnızca
   * başkanı olduğu kulübü yönetebilir.
   */

  if (isClubPresident(user)) {
    const {
      data,
      error,
    } = await supabase
      .from("club")
      .select("id")
      .eq(
        "id",
        clubId
      )
      .eq(
        "president_id",
        user.id
      )
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !!data;
  }

  return false;
}
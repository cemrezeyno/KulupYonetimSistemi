import { supabase } from "../config/supabase";


/*
 * ============================================================
 * GİRİŞ YAPAN KULLANICI
 * ============================================================
 */

async function getCurrentProfile() {
  const {
    data: {
      user,
    },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error(
      "Kullanıcı bulunamadı."
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("users")
    .select(`
      id,
      auth_user_id,
      first_name,
      last_name,
      email,
      role_id
    `)
    .eq(
      "auth_user_id",
      user.id
    )
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error(
      "Kullanıcı profili bulunamadı."
    );
  }

  return profile;
}


/*
 * ============================================================
 * TÜM DUYURULAR
 *
 * ÜYE TARAFI İÇİN
 * ============================================================
 */

export async function getAnnouncements() {
  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throw error;
  }

  return data || [];
}


/*
 * ============================================================
 * YÖNETİLEBİLEN DUYURULAR
 *
 * ADMIN:
 *     Bütün duyurular
 *
 * KULÜP BAŞKANI:
 *     Kendi oluşturduğu duyurular
 * ============================================================
 */

export async function getManagedAnnouncements() {
  const profile =
    await getCurrentProfile();


  /*
   * ADMIN
   */

  if (
    profile.role_id === 1
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("announcements")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      throw error;
    }

    return data || [];
  }


  /*
   * KULÜP BAŞKANI
   */

  if (
    profile.role_id === 3
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("announcements")
      .select("*")
      .eq(
        "created_by",
        profile.id
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

    if (error) {
      throw error;
    }

    return data || [];
  }


  return [];
}


/*
 * ============================================================
 * DUYURU DETAY
 * ============================================================
 */

export async function getAnnouncementById(
  announcementId
) {
  if (!announcementId) {
    throw new Error(
      "Duyuru ID bulunamadı."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .select("*")
    .eq(
      "id",
      announcementId
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/*
 * ============================================================
 * DUYURU OLUŞTUR
 * ============================================================
 */

export async function createAnnouncement({
  title,
  content,
}) {
  const profile =
    await getCurrentProfile();


  /*
   * YETKİ
   */

  if (
    profile.role_id !== 1 &&
    profile.role_id !== 3
  ) {
    throw new Error(
      "Bu işlemi gerçekleştirme yetkiniz yok."
    );
  }


  /*
   * KONTROLLER
   */

  if (
    !title ||
    !title.trim()
  ) {
    throw new Error(
      "Duyuru başlığı zorunludur."
    );
  }

  if (
    !content ||
    !content.trim()
  ) {
    throw new Error(
      "Duyuru içeriği zorunludur."
    );
  }


  /*
   * KAYIT
   */

  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .insert({
      title:
        title.trim(),

      content:
        content.trim(),

      created_by:
        profile.id,

      is_active:
        true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/*
 * ============================================================
 * DUYURU GÜNCELLE
 * ============================================================
 */

export async function updateAnnouncement(
  announcementId,
  {
    title,
    content,
    is_active,
  }
) {
  const profile =
    await getCurrentProfile();


  /*
   * DUYURUYU BUL
   */

  const {
    data: announcement,
    error:
      announcementError,
  } = await supabase
    .from("announcements")
    .select(`
      id,
      created_by
    `)
    .eq(
      "id",
      announcementId
    )
    .maybeSingle();

  if (announcementError) {
    throw announcementError;
  }

  if (!announcement) {
    throw new Error(
      "Duyuru bulunamadı."
    );
  }


  /*
   * YETKİ
   */

  const canEdit =
    profile.role_id === 1 ||
    (
      profile.role_id === 3 &&
      announcement.created_by ===
        profile.id
    );

  if (!canEdit) {
    throw new Error(
      "Bu duyuruyu düzenleme yetkiniz yok."
    );
  }


  /*
   * GÜNCELLEME VERİSİ
   */

  const updateData = {};


  if (
    title !== undefined
  ) {
    if (
      !title ||
      !title.trim()
    ) {
      throw new Error(
        "Duyuru başlığı boş olamaz."
      );
    }

    updateData.title =
      title.trim();
  }


  if (
    content !== undefined
  ) {
    if (
      !content ||
      !content.trim()
    ) {
      throw new Error(
        "Duyuru içeriği boş olamaz."
      );
    }

    updateData.content =
      content.trim();
  }


  if (
    is_active !== undefined
  ) {
    updateData.is_active =
      is_active;
  }


  /*
   * GÜNCELLE
   */

  const {
    data,
    error,
  } = await supabase
    .from("announcements")
    .update(
      updateData
    )
    .eq(
      "id",
      announcementId
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/*
 * ============================================================
 * DUYURU SİL
 * ============================================================
 */

export async function deleteAnnouncement(
  announcementId
) {
  const profile =
    await getCurrentProfile();


  /*
   * DUYURU
   */

  const {
    data: announcement,
    error:
      announcementError,
  } = await supabase
    .from("announcements")
    .select(`
      id,
      created_by
    `)
    .eq(
      "id",
      announcementId
    )
    .maybeSingle();

  if (announcementError) {
    throw announcementError;
  }

  if (!announcement) {
    throw new Error(
      "Duyuru bulunamadı."
    );
  }


  /*
   * YETKİ
   */

  const canDelete =
    profile.role_id === 1 ||
    (
      profile.role_id === 3 &&
      announcement.created_by ===
        profile.id
    );

  if (!canDelete) {
    throw new Error(
      "Bu duyuruyu silme yetkiniz yok."
    );
  }


  /*
   * SİL
   */

  const {
    error,
  } = await supabase
    .from("announcements")
    .delete()
    .eq(
      "id",
      announcementId
    );

  if (error) {
    throw error;
  }

  return true;
}
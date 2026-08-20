import { supabase } from "../config/supabase";

/*
 * ============================================================
 * GİRİŞ YAPAN KULLANICININ USERS KAYDINI GETİR
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
 * NORMAL KULLANICI BİLDİRİMLERİ
 *
 * Kullanıcı sadece kendisine gönderilen bildirimleri görür.
 * ============================================================
 */

export async function getNotifications() {
  const profile =
    await getCurrentProfile();

  const {
    data,
    error,
  } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      created_by,
      title,
      message,
      notification_type,
      is_read,
      created_at
    `)
    .eq(
      "user_id",
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


/*
 * ============================================================
 * YÖNETİLEBİLEN BİLDİRİMLER
 *
 * ADMIN:
 *     Bütün bildirimler
 *
 * KULÜP BAŞKANI:
 *     Sadece kendi oluşturduğu bildirimler
 *
 * NORMAL ÜYE:
 *     Yönetim ekranına erişemez.
 * ============================================================
 */

export async function getManagedNotifications() {
  const profile =
    await getCurrentProfile();


  /*
   * ==========================================================
   * ADMIN
   * ==========================================================
   */

  if (
    profile.role_id === 1
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .select(`
        id,
        user_id,
        created_by,
        title,
        message,
        notification_type,
        is_read,
        created_at
      `)
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
   * ==========================================================
   * KULÜP BAŞKANI
   *
   * created_by kendi users.id'si olan bildirimler
   * ==========================================================
   */

  if (
    profile.role_id === 3
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .select(`
        id,
        user_id,
        created_by,
        title,
        message,
        notification_type,
        is_read,
        created_at
      `)
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
 * BİLDİRİM DETAYI
 * ============================================================
 */

export async function getNotificationById(
  notificationId
) {
  if (!notificationId) {
    throw new Error(
      "Bildirim ID bulunamadı."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      created_by,
      title,
      message,
      notification_type,
      is_read,
      created_at
    `)
    .eq(
      "id",
      notificationId
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}


/*
 * ============================================================
 * BİLDİRİM OLUŞTUR
 *
 * userId:
 *     bildirimin gönderileceği kullanıcı
 *
 * created_by:
 *     bildirimi oluşturan kullanıcı
 * ============================================================
 */

export async function createNotification({
  title,
  message,
  notificationType = "Genel",
  userId,
}) {
  const profile =
    await getCurrentProfile();


  /*
   * Sadece Admin ve Kulüp Başkanı
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
   * Başlık kontrolü
   */

  if (
    !title ||
    !title.trim()
  ) {
    throw new Error(
      "Bildirim başlığı zorunludur."
    );
  }


  /*
   * Mesaj kontrolü
   */

  if (
    !message ||
    !message.trim()
  ) {
    throw new Error(
      "Bildirim mesajı zorunludur."
    );
  }


  /*
   * Eğer hedef kullanıcı verilmezse
   * mevcut kullanıcıya gönderilir.
   */

  const targetUserId =
    userId || profile.id;


  /*
   * BİLDİRİMİ OLUŞTUR
   */

  const {
    data,
    error,
  } = await supabase
    .from("notifications")
    .insert({
      user_id:
        targetUserId,

      created_by:
        profile.id,

      title:
        title.trim(),

      message:
        message.trim(),

      notification_type:
        notificationType?.trim() ||
        "Genel",

      is_read:
        false,
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
 * BİLDİRİM GÜNCELLE
 * ============================================================
 */

export async function updateNotification(
  notificationId,
  {
    title,
    message,
    notificationType,
  }
) {
  const profile =
    await getCurrentProfile();


  /*
   * Bildirimi bul
   */

  const {
    data: notification,
    error:
      notificationError,
  } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      created_by
    `)
    .eq(
      "id",
      notificationId
    )
    .maybeSingle();

  if (notificationError) {
    throw notificationError;
  }

  if (!notification) {
    throw new Error(
      "Bildirim bulunamadı."
    );
  }


  /*
   * ==========================================================
   * YETKİ KONTROLÜ
   *
   * Admin:
   *     Her bildirimi düzenleyebilir.
   *
   * Kulüp Başkanı:
   *     Sadece kendi oluşturduğu bildirimi düzenleyebilir.
   * ==========================================================
   */

  const canEdit =
    profile.role_id === 1 ||
    (
      profile.role_id === 3 &&
      notification.created_by ===
        profile.id
    );

  if (!canEdit) {
    throw new Error(
      "Bu bildirimi düzenleme yetkiniz yok."
    );
  }


  /*
   * Güncellenecek alanlar
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
        "Bildirim başlığı boş olamaz."
      );
    }

    updateData.title =
      title.trim();
  }


  if (
    message !== undefined
  ) {
    if (
      !message ||
      !message.trim()
    ) {
      throw new Error(
        "Bildirim mesajı boş olamaz."
      );
    }

    updateData.message =
      message.trim();
  }


  if (
    notificationType !==
    undefined
  ) {
    updateData.notification_type =
      notificationType?.trim() ||
      "Genel";
  }


  /*
   * GÜNCELLE
   */

  const {
    data,
    error,
  } = await supabase
    .from("notifications")
    .update(
      updateData
    )
    .eq(
      "id",
      notificationId
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
 * BİLDİRİM SİL
 * ============================================================
 */

export async function deleteNotification(
  notificationId
) {
  const profile =
    await getCurrentProfile();


  /*
   * Bildirimi bul
   */

  const {
    data: notification,
    error:
      notificationError,
  } = await supabase
    .from("notifications")
    .select(`
      id,
      user_id,
      created_by
    `)
    .eq(
      "id",
      notificationId
    )
    .maybeSingle();

  if (notificationError) {
    throw notificationError;
  }

  if (!notification) {
    throw new Error(
      "Bildirim bulunamadı."
    );
  }


  /*
   * Yetki
   */

  const canDelete =
    profile.role_id === 1 ||
    (
      profile.role_id === 3 &&
      notification.created_by ===
        profile.id
    );

  if (!canDelete) {
    throw new Error(
      "Bu bildirimi silme yetkiniz yok."
    );
  }


  /*
   * SİL
   */

  const {
    error,
  } = await supabase
    .from("notifications")
    .delete()
    .eq(
      "id",
      notificationId
    );

  if (error) {
    throw error;
  }

  return true;
}


/*
 * ============================================================
 * OKUNDU OLARAK İŞARETLE
 * ============================================================
 */

export async function markNotificationAsRead(
  notificationId
) {
  const profile =
    await getCurrentProfile();

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq(
      "id",
      notificationId
    )
    .eq(
      "user_id",
      profile.id
    );

  if (error) {
    throw error;
  }

  return true;
}


/*
 * ============================================================
 * OKUNMADI OLARAK İŞARETLE
 * ============================================================
 */

export async function markNotificationAsUnread(
  notificationId
) {
  const profile =
    await getCurrentProfile();

  const {
    error,
  } = await supabase
    .from("notifications")
    .update({
      is_read: false,
    })
    .eq(
      "id",
      notificationId
    )
    .eq(
      "user_id",
      profile.id
    );

  if (error) {
    throw error;
  }

  return true;
}
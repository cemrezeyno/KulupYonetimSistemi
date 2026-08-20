import { supabase } from "../config/supabase";

export async function getProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  let club = null;

  if (profile.club_id) {
    const {
      data: clubData,
      error: clubError,
    } = await supabase
      .from("club")
      .select(
        "id, club_name, description, logo_url, email, phone, address"
      )
      .eq("id", profile.club_id)
      .single();

    if (!clubError) {
      club = clubData;
    }
  }

  return {
    profile,
    authUser: user,
    email: user.email || "",
    club,
  };
}

export async function updateProfile(
  profileData
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const {
    error: updateError,
  } = await supabase
    .from("users")
    .update({
      first_name:
        profileData.first_name,

      last_name:
        profileData.last_name,

      faculty:
        profileData.faculty,

      department:
        profileData.department,

      class_year:
        profileData.class_year,
    })
    .eq("auth_user_id", user.id);

  if (updateError) {
    throw updateError;
  }

  return true;
}
export async function getJoinedEvents() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  // Auth kullanıcısının users tablosundaki kaydı
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error(
      "Kullanıcı profili bulunamadı."
    );
  }

  // Kullanıcının katıldığı etkinlikler
  const {
    data: participants,
    error: participantsError,
  } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("user_id", profile.id);

  if (participantsError) {
    throw participantsError;
  }

  if (!participants || participants.length === 0) {
    return [];
  }

  const eventIds =
    participants.map(
      (item) => item.event_id
    );

  // Etkinlik bilgilerini getir
  const {
    data: events,
    error: eventsError,
  } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .order("event_date", {
      ascending: true,
    });

  if (eventsError) {
    throw eventsError;
  }

  return events || [];
}
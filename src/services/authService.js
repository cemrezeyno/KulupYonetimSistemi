import { supabase } from "../config/supabase";

export async function signUp(userData) {

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    studentNumber,
    faculty,
    department,
    classYear,
  } = userData;

  // 1) Authentication kullanıcısı oluştur
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // 2) users tablosuna profil bilgilerini ekle
 if (!data.user) {
  throw new Error("Kullanıcı oluşturulamadı.");
}

const { error: profileError } = await supabase
  .from("users")
  .insert([
    {
      auth_user_id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      student_number: studentNumber,
      faculty,
      department,
      class_year: classYear,
      role_id: 2,
      status_id: 1,
    },
  ]);

  if (profileError) {
    throw profileError;
  }

  return data.user;
}
export async function signIn(email, password) {

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw error;
  }

  return data.user;
}
export async function signOut() {

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

}
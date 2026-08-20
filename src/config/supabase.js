import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://xfqmjvqgcocvnnjrsbdq.supabase.co";

const supabaseAnonKey =
  "sb_publishable_o2JpsnHpIMH3nOXP_kPxzg_m8xsnH2V";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
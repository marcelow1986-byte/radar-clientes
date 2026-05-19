import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ujrvncptcymootpyalpd.supabase.co";
const supabaseAnonKey = "sb_publishable_IIfj4bdD--ggfXg-UK6WkA_WTQuk5zr";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
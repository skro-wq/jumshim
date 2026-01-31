import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

if (typeof window !== "undefined") {
  console.log("Supabase URL:", supabaseUrl.substring(0, 30) + "...");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

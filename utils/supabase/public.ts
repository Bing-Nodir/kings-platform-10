import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

export function createPublicClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabasePublicConfig();

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

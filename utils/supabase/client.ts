import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabasePublicConfig();

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}

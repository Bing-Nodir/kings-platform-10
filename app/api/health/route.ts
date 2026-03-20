import { NextResponse } from "next/server";
import { getAnthropicConfig, hasConfiguredAnthropicKey } from "@/lib/server/env";
import { createClient } from "@/utils/supabase/server";
import { getSupabasePublicConfig } from "@/utils/supabase/config";

export async function GET() {
  let supabaseEnvReady = false;

  try {
    getSupabasePublicConfig();
    supabaseEnvReady = true;
  } catch {
    supabaseEnvReady = false;
  }

  const { apiKey, model } = getAnthropicConfig();
  const aiConfigured = hasConfiguredAnthropicKey(apiKey);

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  const { error: wishlistError } = await supabase
    .from("wishlist_courses")
    .select("id", { count: "exact", head: true });

  const databaseReady = !error;
  const wishlistReady = !wishlistError;
  const status =
    supabaseEnvReady && databaseReady && wishlistReady ? "ok" : "degraded";

  return NextResponse.json(
    {
      status,
      services: {
        supabaseEnv: supabaseEnvReady,
        database: databaseReady,
        wishlist: wishlistReady,
        aiMentorConfigured: aiConfigured,
      },
      model: aiConfigured ? model : null,
      checkedAt: new Date().toISOString(),
    },
    { status: status === "ok" ? 200 : 503 }
  );
}

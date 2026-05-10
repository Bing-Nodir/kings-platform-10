import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing Supabase Edge Function secrets" }, 500);
  }

  const { certificateId } = await request.json().catch(() => ({}));
  if (!certificateId || typeof certificateId !== "string") {
    return jsonResponse({ error: "certificateId is required" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: certificate, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .maybeSingle();

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  if (!certificate) {
    return jsonResponse({ error: "Certificate not found" }, 404);
  }

  // Heavy PDF rendering belongs here. The first production-safe step returns a
  // deterministic render job payload that can be swapped with PDF generation.
  return jsonResponse({
    ok: true,
    renderJob: {
      certificateId,
      userId: certificate.user_id,
      courseId: certificate.course_id,
      issuedAt: certificate.issued_at,
      status: "queued",
    },
  });
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type PaidOrder = {
  id: string;
  user_id: string | null;
  item_id: string | null;
  item_type: string | null;
  amount: number | null;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Missing Supabase Edge Function secrets" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, user_id, item_id, item_type, amount")
    .eq("status", "paid")
    .eq("item_type", "course")
    .limit(5000);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const rows = ((orders ?? []) as PaidOrder[])
    .filter((order) => order.item_id && (order.amount ?? 0) > 0)
    .map((order) => ({
      orderId: order.id,
      courseId: order.item_id,
      gross: order.amount ?? 0,
      instructorShare: Math.round((order.amount ?? 0) * 0.7),
      platformShare: Math.round((order.amount ?? 0) * 0.3),
    }));

  return jsonResponse({
    ok: true,
    calculatedAt: new Date().toISOString(),
    rows,
  });
});

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

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase
    .from("knowledge_points")
    .select("user_id, xp, source")
    .limit(100000);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  const byUser = new Map<
    string,
    {
      user_id: string;
      total_xp: number;
      completed_lessons: number;
      passed_quizzes: number;
      reviewed_assignments: number;
      rank_score: number;
      updated_at: string;
    }
  >();

  for (const row of data ?? []) {
    const userId = row.user_id as string;
    const entry =
      byUser.get(userId) ??
      {
        user_id: userId,
        total_xp: 0,
        completed_lessons: 0,
        passed_quizzes: 0,
        reviewed_assignments: 0,
        rank_score: 0,
        updated_at: new Date().toISOString(),
      };

    entry.total_xp += Number(row.xp ?? 0);
    entry.rank_score += Number(row.xp ?? 0);
    if (row.source === "lesson_complete") entry.completed_lessons += 1;
    if (row.source === "quiz_pass") entry.passed_quizzes += 1;
    if (row.source === "assignment_review") entry.reviewed_assignments += 1;
    byUser.set(userId, entry);
  }

  const snapshots = [...byUser.values()];
  if (snapshots.length > 0) {
    const { error: upsertError } = await supabase
      .from("leaderboard_snapshots")
      .upsert(snapshots, { onConflict: "user_id" });

    if (upsertError) {
      return jsonResponse({ error: upsertError.message }, 500);
    }
  }

  return jsonResponse({ ok: true, updated: snapshots.length });
});

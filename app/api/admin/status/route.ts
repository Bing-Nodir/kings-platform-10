import { NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/server/auth";
import { getBackendStatusData } from "@/lib/server/metrics";

export async function GET() {
  try {
    const { supabase } = await requireAdminContext();
    const data = await getBackendStatusData(supabase);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}

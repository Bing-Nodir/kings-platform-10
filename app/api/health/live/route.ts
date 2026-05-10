import { NextResponse } from "next/server";
import { getLivenessReport } from "@/lib/server/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getLivenessReport(), {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

import { NextResponse } from "next/server";
import { getSystemHealthReport } from "@/lib/server/health";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const report = await getSystemHealthReport();
  return NextResponse.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

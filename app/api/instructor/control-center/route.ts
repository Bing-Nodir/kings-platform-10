import { NextResponse } from "next/server";
import { requireInstructorContext } from "@/lib/server/auth";
import { getInstructorWorkspaceData } from "@/lib/server/instructor-workspace";

export async function GET() {
  try {
    const { supabase, user } = await requireInstructorContext();
    const data = await getInstructorWorkspaceData(user.id, supabase);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      profile: data.profile,
      metrics: data.metrics,
      workbench: {
        totalSubmissions: data.submissions.length,
        draftCourses: data.metrics.draftCourses,
        reviewQueue: data.metrics.reviewQueue,
        publishedCourses: data.metrics.publishedCourses,
        uploadedAssets: data.metrics.uploadedAssets,
        openQuestions: data.metrics.openQuestions,
        paidOrders: data.orders.length,
        payoutBatches: data.payouts.length,
        activeStudents: data.students.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const status = message === "Forbidden" ? 403 : 401;

    return NextResponse.json({ error: message }, { status });
  }
}

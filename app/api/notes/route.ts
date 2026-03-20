import { NextResponse } from "next/server";
import { getCourseById } from "@/lib/catalog";
import {
  getAuthenticatedContext,
  hasCourseEnrollment,
} from "@/lib/server/auth";
import {
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";

export async function GET(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = normalizeSingleLine(searchParams.get("courseId"), 120);

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  if (!getCourseById(courseId)) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("user_notes")
    .select("content")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ content: data?.content ?? "" });
}

export async function PUT(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    courseId?: string;
    content?: string;
  } | null;
  const courseId = normalizeSingleLine(body?.courseId, 120);

  if (!courseId) {
    return NextResponse.json({ error: "Missing courseId" }, { status: 400 });
  }

  if (!getCourseById(courseId)) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("user_notes").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      content: normalizeMultiline(body?.content ?? "", 20000),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

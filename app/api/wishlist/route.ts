import { NextResponse } from "next/server";
import { getCourseById } from "@/lib/catalog";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { normalizeSingleLine } from "@/lib/server/validation";

function isWishlistTableMissing(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("wishlist_courses") || message.includes("could not find");
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wishlist_courses")
    .select("course_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (isWishlistTableMissing(error)) {
    return NextResponse.json({ courseIds: [], backendReady: false });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    courseIds: (data ?? []).map((item) => item.course_id),
    backendReady: true,
  });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { courseId?: string } | null;
  const courseId = normalizeSingleLine(body?.courseId, 120);

  if (!courseId || !getCourseById(courseId)) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("wishlist_courses")
    .upsert(
      {
        user_id: user.id,
        course_id: courseId,
      },
      { onConflict: "user_id,course_id", ignoreDuplicates: true }
    );

  if (isWishlistTableMissing(error)) {
    return NextResponse.json(
      { error: "Wishlist backend hali tayyor emas." },
      { status: 503 }
    );
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { courseId?: string } | null;
  const courseId = normalizeSingleLine(body?.courseId, 120);

  if (!courseId) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("wishlist_courses")
    .delete()
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  if (isWishlistTableMissing(error)) {
    return NextResponse.json(
      { error: "Wishlist backend hali tayyor emas." },
      { status: 503 }
    );
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

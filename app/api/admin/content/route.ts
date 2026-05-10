import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SITE_CONTENT_CACHE_TAG } from "@/lib/cache-tags";
import { getSiteContent, sanitizeSiteContentPayload } from "@/lib/site-content";
import { requireAdminContext } from "@/lib/server/auth";

function getAuthErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  return NextResponse.json({ error: "Admin ruxsati kerak" }, { status: 403 });
}

export async function GET() {
  try {
    await requireAdminContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const content = await getSiteContent();
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  let context: Awaited<ReturnType<typeof requireAdminContext>>;

  try {
    context = await requireAdminContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const body = (await request.json().catch(() => null)) as {
    content?: Record<string, unknown>;
  } | null;

  const updates = sanitizeSiteContentPayload(body?.content);

  if (updates.length === 0) {
    return NextResponse.json(
      { error: "Saqlash uchun hech qanday matn yuborilmadi" },
      { status: 400 }
    );
  }

  const { error } = await context.supabase.from("site_content").upsert(
    updates.map((entry) => ({
      ...entry,
      updated_by: context.user.id,
    })),
    { onConflict: "content_key" }
  );

  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "42P01"
            ? "site_content jadvali hali yaratilmagan. Migration SQL ni ishga tushiring."
            : error.message,
      },
      { status: 500 }
    );
  }

  const pathsToRefresh = [
    "/",
    "/about",
    "/business",
    "/contact",
    "/courses",
    "/faq",
    "/mentors",
    "/offices",
    "/privacy",
    "/settings",
    "/shop",
    "/subscription",
    "/terms",
    "/admin/content",
  ];

  revalidateTag(SITE_CONTENT_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  for (const path of pathsToRefresh) {
    revalidatePath(path, "page");
  }

  return NextResponse.json({ ok: true });
}

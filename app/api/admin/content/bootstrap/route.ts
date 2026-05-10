import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SITE_DOCUMENTS_CACHE_TAG } from "@/lib/cache-tags";
import { getSiteDocumentSeedEntries } from "@/lib/content-store";
import { requireAdminContext } from "@/lib/server/auth";

function getAuthErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  return NextResponse.json({ error: "Admin ruxsati kerak" }, { status: 403 });
}

const pathsToRefresh = [
  "/",
  "/about",
  "/business",
  "/contact",
  "/courses",
  "/dashboard",
  "/faq",
  "/mentors",
  "/offices",
  "/search",
  "/shop",
  "/subscription",
  "/admin",
  "/admin/analytics",
  "/admin/courses",
  "/admin/settings",
];

export async function GET() {
  let context: Awaited<ReturnType<typeof requireAdminContext>>;

  try {
    context = await requireAdminContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const { data, error } = await context.supabase
    .from("site_documents")
    .select("kind, slug, status");

  const seeds = getSiteDocumentSeedEntries();

  if (error) {
    return NextResponse.json(
      {
        seeds: seeds.length,
        error:
          error.code === "42P01"
            ? "site_documents jadvali hali yaratilmagan. Migration SQL ni ishga tushiring."
            : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    seeds: seeds.length,
    kinds: [...new Set(seeds.map((entry) => entry.kind))],
    existingDocuments: data?.length ?? 0,
  });
}

export async function POST() {
  let context: Awaited<ReturnType<typeof requireAdminContext>>;

  try {
    context = await requireAdminContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const seeds = getSiteDocumentSeedEntries();
  const { error } = await context.supabase.from("site_documents").upsert(
    seeds.map((entry) => ({
      ...entry,
      updated_by: context.user.id,
    })),
    { onConflict: "kind,slug" }
  );

  if (error) {
    return NextResponse.json(
      {
        error:
          error.code === "42P01"
            ? "site_documents jadvali hali yaratilmagan. 20260321_site_documents_foundation.sql migration'ni SQL Editor orqali ishga tushiring."
            : error.message,
      },
      { status: 500 }
    );
  }

  revalidateTag(SITE_DOCUMENTS_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  for (const path of pathsToRefresh) {
    revalidatePath(path, "page");
  }

  return NextResponse.json({
    ok: true,
    upserted: seeds.length,
    kinds: [...new Set(seeds.map((entry) => entry.kind))],
  });
}

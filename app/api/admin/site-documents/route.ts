import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { SITE_DOCUMENTS_CACHE_TAG } from "@/lib/cache-tags";
import {
  adminEditableSiteDocumentKinds,
  getSiteDocumentEditorRecords,
} from "@/lib/content-store";
import { requireAdminContext } from "@/lib/server/auth";

const editableKinds = new Set<string>(adminEditableSiteDocumentKinds);
const pathsToRefresh = [
  "/",
  "/about",
  "/business",
  "/contact",
  "/faq",
  "/mentors",
  "/offices",
  "/subscription",
  "/search",
  "/admin",
  "/admin/content",
  "/admin/settings",
];

function getAuthErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return NextResponse.json({ error: "Tizimga kiring" }, { status: 401 });
  }

  return NextResponse.json({ error: "Admin ruxsati kerak" }, { status: 403 });
}

function isDocumentStatus(value: unknown): value is "draft" | "published" | "archived" {
  return value === "draft" || value === "published" || value === "archived";
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function fetchEditorDocuments(
  supabase: Awaited<ReturnType<typeof requireAdminContext>>["supabase"]
) {
  const { data, error } = await supabase
    .from("site_documents")
    .select("kind, slug, title, status, sort_order, payload, metadata, updated_at")
    .in("kind", [...adminEditableSiteDocumentKinds])
    .order("kind", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    return { data: null, error };
  }

  return {
    data: getSiteDocumentEditorRecords(
      data as Parameters<typeof getSiteDocumentEditorRecords>[0],
      adminEditableSiteDocumentKinds
    ),
    error: null,
  };
}

export async function GET() {
  let context: Awaited<ReturnType<typeof requireAdminContext>>;

  try {
    context = await requireAdminContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const result = await fetchEditorDocuments(context.supabase);

  if (result.error) {
    return NextResponse.json(
      {
        error:
          result.error.code === "42P01"
            ? "site_documents jadvali hali yaratilmagan. 20260321_site_documents_foundation.sql migration'ni SQL Editor orqali ishga tushiring."
            : result.error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ documents: result.data });
}

export async function PUT(request: Request) {
  let context: Awaited<ReturnType<typeof requireAdminContext>>;

  try {
    context = await requireAdminContext();
  } catch (error) {
    return getAuthErrorResponse(error);
  }

  const body = (await request.json().catch(() => null)) as {
    documents?: Array<{
      kind?: string;
      slug?: string;
      title?: string | null;
      status?: string;
      sort_order?: number;
      payload?: unknown;
      metadata?: unknown;
    }>;
  } | null;

  if (!body?.documents || body.documents.length === 0) {
    return NextResponse.json(
      { error: "Saqlash uchun hujjatlar yuborilmadi" },
      { status: 400 }
    );
  }

  const normalizedDocuments = [];

  for (const document of body.documents) {
    const kind = document.kind?.trim();
    const slug = document.slug?.trim();

    if (!kind || !editableKinds.has(kind)) {
      return NextResponse.json(
        { error: "Hujjat turi noto'g'ri yoki edit qilish uchun ruxsat yo'q" },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug bo'sh bo'lishi mumkin emas" },
        { status: 400 }
      );
    }

    if (!isDocumentStatus(document.status)) {
      return NextResponse.json(
        { error: `Status noto'g'ri: ${document.status ?? "noma'lum"}` },
        { status: 400 }
      );
    }

    if (!isJsonObject(document.payload)) {
      return NextResponse.json(
        { error: `${slug} payload obyekt bo'lishi kerak` },
        { status: 400 }
      );
    }

    normalizedDocuments.push({
      kind,
      slug,
      title:
        typeof document.title === "string" && document.title.trim()
          ? document.title.trim()
          : null,
      status: document.status,
      sort_order:
        typeof document.sort_order === "number" && Number.isFinite(document.sort_order)
          ? Math.trunc(document.sort_order)
          : 0,
      payload: document.payload,
      metadata: isJsonObject(document.metadata) ? document.metadata : {},
      updated_by: context.user.id,
    });
  }

  const { error } = await context.supabase
    .from("site_documents")
    .upsert(normalizedDocuments, { onConflict: "kind,slug" });

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

  const result = await fetchEditorDocuments(context.supabase);
  return NextResponse.json({
    ok: true,
    updated: normalizedDocuments.length,
    documents: result.data ?? [],
  });
}

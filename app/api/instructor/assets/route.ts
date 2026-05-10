import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireInstructorContext } from "@/lib/server/auth";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "@/lib/server/rate-limit";
import {
  normalizeSingleLine,
} from "@/lib/server/validation";

const allowedMimeTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "image/png",
  "image/jpeg",
]);

function getFileExtension(file: File) {
  const namePart = file.name.split(".").pop()?.toLowerCase();
  if (namePart && /^[a-z0-9]{2,8}$/.test(namePart)) {
    return namePart;
  }

  if (file.type === "video/webm") return "webm";
  if (file.type === "video/quicktime") return "mov";
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  return "mp4";
}

function buildAnalysis(file: File) {
  const sizeMb = file.size / (1024 * 1024);
  const isVideo = file.type.startsWith("video/");

  return {
    fileName: file.name,
    sizeMb: Math.round(sizeMb * 10) / 10,
    detectedType: file.type || "unknown",
    readiness: isVideo ? "video_uploaded" : "resource_uploaded",
    qualityHint:
      sizeMb > 250
        ? "Large file. Transcoding/CDN optimization tavsiya qilinadi."
        : "File size learning room uchun normal ko'rinadi.",
    nextStep: isVideo
      ? "Dars editorida shu lesson uchun videoUrl yoki asset mapping biriktiring."
      : "Resurs sifatida lesson materials bo'limiga qo'shing.",
  };
}

export async function POST(request: Request) {
  let context: Awaited<ReturnType<typeof requireInstructorContext>>;

  try {
    context = await requireInstructorContext();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === "Unauthorized"
            ? "Tizimga kiring"
            : "Instructor ruxsati kerak",
      },
      { status: 403 }
    );
  }

  const { supabase, user } = context;
  const rateLimit = checkRateLimit(
    getRateLimitKey(request, "instructor-assets", user.id),
    {
      limit: 30,
      windowMs: 60 * 60 * 1000,
    }
  );

  if (!rateLimit.allowed) {
    return rateLimitResponse(
      rateLimit,
      "Media upload juda ko'p yuborildi. Birozdan keyin qayta urinib ko'ring."
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Faqat MP4, WEBM, MOV, PDF, PNG yoki JPG fayllar qabul qilinadi" },
      { status: 400 }
    );
  }

  const maxSize = 500 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: "Fayl hajmi 500MB dan oshmasligi kerak" },
      { status: 400 }
    );
  }

  const submissionId = normalizeSingleLine(formData.get("submission_id"), 120);
  const courseId = normalizeSingleLine(formData.get("course_id"), 120);
  const moduleId = normalizeSingleLine(formData.get("module_id"), 120);
  const lessonId = normalizeSingleLine(formData.get("lesson_id"), 120);
  const title =
    normalizeSingleLine(formData.get("title"), 160) ||
    normalizeSingleLine(file.name.replace(/\.[^.]+$/, ""), 160) ||
    "Instructor asset";

  if (!courseId) {
    return NextResponse.json({ error: "course_id kerak" }, { status: 400 });
  }

  if (submissionId) {
    const { data: submission } = await supabase
      .from("course_submissions")
      .select("id, instructor_id, slug")
      .eq("id", submissionId)
      .eq("instructor_id", user.id)
      .maybeSingle();

    if (!submission) {
      return NextResponse.json(
        { error: "Submission topilmadi yoki sizga tegishli emas" },
        { status: 404 }
      );
    }
  }

  const extension = getFileExtension(file);
  const safeLesson = lessonId || `asset-${Date.now()}`;
  const storagePath = `${user.id}/${courseId}/${safeLesson}-${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("course-media")
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      {
        error:
          uploadError.message.includes("Bucket not found")
            ? "course-media storage bucket yo'q. Migrationni Supabase'da ishga tushiring."
            : uploadError.message,
      },
      { status: 500 }
    );
  }

  const { data: signed } = await supabase.storage
    .from("course-media")
    .createSignedUrl(storagePath, 60 * 60);

  const { data: asset, error: insertError } = await supabase
    .from("course_assets")
    .insert({
      instructor_id: user.id,
      submission_id: submissionId || null,
      course_id: courseId,
      module_id: moduleId || null,
      lesson_id: lessonId || null,
      title,
      asset_type: file.type.startsWith("video/") ? "video" : "resource",
      storage_bucket: "course-media",
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      status: "ready",
      analysis: buildAnalysis(file),
    })
    .select("id, title, storage_path, status, analysis")
    .single();

  if (insertError) {
    return NextResponse.json(
      {
        error:
          insertError.code === "42P01"
            ? "course_assets jadvali yo'q. Migrationni Supabase'da ishga tushiring."
            : insertError.message,
      },
      { status: 500 }
    );
  }

  revalidatePath("/instructor");
  revalidatePath("/instructor/assets");
  revalidatePath("/instructor/analytics");

  return NextResponse.json({
    ok: true,
    asset,
    signedUrl: signed?.signedUrl ?? null,
  });
}

import type {
  Course,
  CourseLesson,
  CourseModule,
  CourseResource,
  CourseReview,
  CourseSupportItem,
  CourseCertificateTemplate,
} from "@/lib/catalog";
import {
  COURSE_SUBMISSION_STATUSES,
  DEFAULT_COURSE_HERO_GRADIENT,
  type CourseSubmissionFormData,
  type CourseSubmissionStatus,
} from "@/lib/course-submissions";
import {
  clampNumber,
  isSupportedLanguage,
  normalizeMultiline,
  normalizeSingleLine,
} from "@/lib/server/validation";
import { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type DataClient = Pick<SupabaseServerClient, "from">;

export interface CourseSubmissionRecord {
  id: string;
  instructor_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  price: number;
  status: CourseSubmissionStatus;
  payload: Course;
  review_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sanitizeResource(
  value: unknown
): CourseResource | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const resource = value as Record<string, unknown>;
  const title = normalizeSingleLine(resource.title, 80);
  const type = normalizeSingleLine(resource.type, 40) || "Material";
  const href = normalizeSingleLine(resource.href, 500);

  if (!title || !href) {
    return null;
  }

  return { title, type, href };
}

function sanitizeLesson(
  value: unknown,
  moduleIndex: number,
  lessonIndex: number
): CourseLesson | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const lesson = value as Record<string, unknown>;
  const title = normalizeSingleLine(lesson.title, 120);

  if (!title) {
    return null;
  }

  const lessonId =
    slugify(normalizeSingleLine(lesson.id, 80) || title) ||
    `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`;
  const duration = normalizeSingleLine(lesson.duration, 20) || "10:00";
  const summary =
    normalizeMultiline(lesson.summary, 500) ||
    `${title} bo'yicha asosiy tushunchalar va amaliy qadamlar.`;
  const videoUrl = normalizeSingleLine(lesson.videoUrl, 500);
  const videoMimeType =
    normalizeSingleLine(lesson.videoMimeType, 120) || "video/mp4";
  const resources = Array.isArray(lesson.resources)
    ? lesson.resources
        .map((resource) => sanitizeResource(resource))
        .filter((resource): resource is CourseResource => Boolean(resource))
        .slice(0, 12)
    : [];

  return {
    id: lessonId,
    title,
    duration,
    isFree: Boolean(lesson.isFree),
    summary,
    resources,
    videoUrl: videoUrl || undefined,
    videoMimeType: videoUrl ? videoMimeType : undefined,
    uploadFilePath: undefined,
  };
}

function sanitizeModule(
  value: unknown,
  moduleIndex: number
): CourseModule | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const moduleValue = value as Record<string, unknown>;
  const title = normalizeSingleLine(moduleValue.title, 120);

  if (!title) {
    return null;
  }

  const lessons = Array.isArray(moduleValue.lessons)
    ? moduleValue.lessons
        .map((lesson, lessonIndex) =>
          sanitizeLesson(lesson, moduleIndex, lessonIndex)
        )
        .filter((lesson): lesson is CourseLesson => Boolean(lesson))
        .slice(0, 24)
    : [];

  if (lessons.length === 0) {
    return null;
  }

  return {
    id:
      slugify(normalizeSingleLine(moduleValue.id, 80) || title) ||
      `module-${moduleIndex + 1}`,
    title,
    description:
      normalizeMultiline(moduleValue.description, 400) ||
      `${title} bo'limi bo'yicha darslar va materiallar.`,
    lessons,
  };
}

function sanitizeSupportItem(value: unknown): CourseSupportItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  const title = normalizeSingleLine(item.title, 80);
  const description = normalizeMultiline(item.description, 220);

  if (!title || !description) {
    return null;
  }

  return { title, description };
}

function sanitizeReview(value: unknown): CourseReview | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const review = value as Record<string, unknown>;
  const name = normalizeSingleLine(review.name, 80);
  const quote = normalizeMultiline(review.quote, 260);

  if (!name || !quote) {
    return null;
  }

  return {
    name,
    role: normalizeSingleLine(review.role, 100) || "O'quvchi",
    rating:
      typeof review.rating === "number"
        ? clampNumber(Math.round(review.rating), 1, 5)
        : 5,
    quote,
  };
}

function sanitizeOutcomes(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .map((item) => normalizeSingleLine(item, 140))
    .filter(Boolean)
    .slice(0, 12);
}

function sanitizeCertificateTemplate(
  value: unknown,
  options?: { instructorName?: string; courseTitle?: string }
): CourseCertificateTemplate {
  const template =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    title:
      normalizeSingleLine(template.title, 140) ||
      `${options?.courseTitle ?? "Kings Education"} Certificate`,
    organizationName:
      normalizeSingleLine(template.organizationName, 160) ||
      "Kings Education",
    signatureName:
      normalizeSingleLine(template.signatureName, 120) ||
      options?.instructorName ||
      "Kings Instructor",
    signatureTitle:
      normalizeSingleLine(template.signatureTitle, 100) || "Instructor",
    certificateBody:
      normalizeMultiline(template.certificateBody, 320) ||
      "has successfully completed the course requirements and demonstrated practical learning progress.",
    accentColor:
      normalizeSingleLine(template.accentColor, 24) || "#064e3b",
    sealText: normalizeSingleLine(template.sealText, 80) || "KINGS VERIFIED",
  };
}

function mapSubmissionRow(row: {
  id: string;
  instructor_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string | null;
  price: number | null;
  status: string;
  payload: unknown;
  review_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}): CourseSubmissionRecord {
  return {
    id: row.id,
    instructor_id: row.instructor_id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    category: row.category,
    price: row.price ?? 0,
    status: COURSE_SUBMISSION_STATUSES.includes(
      row.status as CourseSubmissionStatus
    )
      ? (row.status as CourseSubmissionStatus)
      : "draft",
    payload: row.payload as Course,
    review_note: row.review_note,
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at,
    published_at: row.published_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function sanitizeCourseSubmissionInput(
  value: unknown,
  options?: { instructorName?: string }
):
  | { ok: true; data: CourseSubmissionFormData; course: Course }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") {
    return { ok: false, error: "Kurs ma'lumotlari topilmadi." };
  }

  const payload = value as Record<string, unknown>;
  const title = normalizeSingleLine(payload.title, 120);
  const description = normalizeMultiline(payload.description, 2000);

  if (!title) {
    return { ok: false, error: "Kurs nomini kiriting." };
  }

  if (!description) {
    return { ok: false, error: "Kurs tavsifini kiriting." };
  }

  const slug =
    slugify(normalizeSingleLine(payload.slug, 80) || title) ||
    `course-${Date.now()}`;
  const language = isSupportedLanguage(payload.language)
    ? payload.language
    : "uz";
  const modules = Array.isArray(payload.modules)
    ? payload.modules
        .map((moduleValue, moduleIndex) =>
          sanitizeModule(moduleValue, moduleIndex)
        )
        .filter((module): module is CourseModule => Boolean(module))
        .slice(0, 12)
    : [];

  if (modules.length === 0) {
    return {
      ok: false,
      error: "Kamida bitta modul va uning ichida kamida bitta dars bo'lishi kerak.",
    };
  }

  const supportItems = Array.isArray(payload.supportItems)
    ? payload.supportItems
        .map((item) => sanitizeSupportItem(item))
        .filter((item): item is CourseSupportItem => Boolean(item))
        .slice(0, 8)
    : [];
  const reviews = Array.isArray(payload.reviews)
    ? payload.reviews
        .map((review) => sanitizeReview(review))
        .filter((review): review is CourseReview => Boolean(review))
        .slice(0, 6)
    : [];
  const outcomes = sanitizeOutcomes(payload.outcomes);
  const price =
    typeof payload.price === "number"
      ? clampNumber(Math.round(payload.price), 0, 100_000_000)
      : clampNumber(
          Number.parseInt(normalizeSingleLine(payload.price, 12) || "0", 10) ||
            0,
          0,
          100_000_000
        );

  const formData: CourseSubmissionFormData = {
    slug,
    title,
    subtitle: normalizeSingleLine(payload.subtitle, 160),
    description,
    price,
    duration: normalizeSingleLine(payload.duration, 40) || "6 hafta",
    pace:
      normalizeSingleLine(payload.pace, 60) || "Haftasiga 3-4 soat",
    level:
      normalizeSingleLine(payload.level, 40) || "Barcha daraja",
    category:
      normalizeSingleLine(payload.category, 60) || "Business Analytics",
    language,
    heroGradient:
      normalizeSingleLine(payload.heroGradient, 120) ||
      DEFAULT_COURSE_HERO_GRADIENT,
    cardImage: normalizeSingleLine(payload.cardImage, 300),
    outcomes,
    supportItems,
    reviews,
    certificateTemplate: sanitizeCertificateTemplate(
      payload.certificateTemplate,
      {
        instructorName: options?.instructorName,
        courseTitle: title,
      }
    ),
    modules: modules.map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        isFree: lesson.isFree,
        summary: lesson.summary,
        videoUrl: lesson.videoUrl ?? "",
        videoMimeType: lesson.videoMimeType ?? "video/mp4",
        resources: lesson.resources.map((resource) => ({
          title: resource.title,
          type: resource.type,
          href: resource.href,
        })),
      })),
    })),
  };

  const course: Course = {
    id: formData.slug,
    title: formData.title,
    subtitle:
      formData.subtitle ||
      `${formData.category} bo'yicha amaliy, professional kurs`,
    description: formData.description,
    price: formData.price,
    duration: formData.duration,
    pace: formData.pace,
    level: formData.level,
    category: formData.category,
    language: formData.language,
    rating: 5,
    students: 0,
    instructor:
      options?.instructorName || normalizeSingleLine(payload.instructor, 100) ||
      "Kings Instructor",
    heroGradient: formData.heroGradient,
    cardImage: formData.cardImage || undefined,
    outcomes:
      formData.outcomes.length > 0
        ? formData.outcomes
        : [
            "Kurs yakunida amaliy portfolio natijasi paydo bo'ladi.",
            "O'quvchi real ish vazifalariga yaqin mashqlarni bajaradi.",
            "Har modul natijasi keyingi bosqich uchun tayanch bo'ladi.",
          ],
    supportItems:
      formData.supportItems.length > 0
        ? formData.supportItems
        : [
            {
              title: "Mentor feedback",
              description:
                "Har hafta ustozdan progress va keyingi qadamlar bo'yicha izoh olinadi.",
            },
            {
              title: "Praktik materiallar",
              description:
                "Har dars uchun amaliy fayl, template yoki cheklist biriktiriladi.",
            },
          ],
    reviews: formData.reviews,
    certificateTemplate: formData.certificateTemplate,
    modules,
  };

  return { ok: true, data: formData, course };
}

export async function getInstructorCourseSubmissions(
  instructorId: string,
  supabase?: DataClient
) {
  const db = supabase ?? (await createClient());
  const { data } = await db
    .from("course_submissions")
    .select(
      "id, instructor_id, slug, title, subtitle, description, category, price, status, payload, review_note, submitted_at, reviewed_at, published_at, created_at, updated_at"
    )
    .eq("instructor_id", instructorId)
    .order("updated_at", { ascending: false });

  return (data ?? []).map((row) =>
    mapSubmissionRow(row as Parameters<typeof mapSubmissionRow>[0])
  );
}

export async function getCourseSubmissionById(
  submissionId: string,
  options?: {
    instructorId?: string;
    supabase?: DataClient;
  }
) {
  const db = options?.supabase ?? (await createClient());
  let query = db
    .from("course_submissions")
    .select(
      "id, instructor_id, slug, title, subtitle, description, category, price, status, payload, review_note, submitted_at, reviewed_at, published_at, created_at, updated_at"
    )
    .eq("id", submissionId);

  if (options?.instructorId) {
    query = query.eq("instructor_id", options.instructorId);
  }

  const { data } = await query.maybeSingle();

  if (!data) {
    return null;
  }

  return mapSubmissionRow(data as Parameters<typeof mapSubmissionRow>[0]);
}

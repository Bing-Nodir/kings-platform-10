"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { SITE_DOCUMENTS_CACHE_TAG } from "@/lib/cache-tags";
import type { Course } from "@/lib/catalog";
import { getCoursesData } from "@/lib/content-store";
import { requireAdminContext } from "@/lib/server/auth";
import { safeRecordOperationalEvent } from "@/lib/server/operations";

const refreshPaths = [
  "/",
  "/admin",
  "/admin/courses",
  "/admin/analytics",
  "/courses",
  "/dashboard",
  "/search",
  "/subscription",
];

type CourseActionStatus =
  | "updated"
  | "archived"
  | "missing-backend"
  | "not-found"
  | "blocked";

function redirectWithStatus(status: CourseActionStatus, courseId?: string) {
  const params = new URLSearchParams({ course_status: status });
  if (courseId) {
    params.set("course", courseId);
  }

  redirect(`/admin/courses?${params.toString()}`);
}

function getFormValue(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() ?? "";
}

function cleanText(value: string, fallback: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return (normalized || fallback).slice(0, maxLength);
}

function cleanLongText(value: string, fallback: string, maxLength: number) {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return (normalized || fallback).slice(0, maxLength);
}

function cleanPrice(value: string, fallback: number) {
  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 0), 100_000_000);
}

function refreshCoursePages(courseId: string) {
  revalidateTag(SITE_DOCUMENTS_CACHE_TAG, "max");
  revalidatePath("/", "layout");
  for (const path of refreshPaths) {
    revalidatePath(path, "page");
  }
  revalidatePath(`/courses/${courseId}`, "page");
  revalidatePath(`/courses/${courseId}/watch`, "page");
}

async function getEditableCourse(courseId: string) {
  const courses = await getCoursesData();
  const course = courses.find((item) => item.id === courseId);

  return {
    course,
    sortOrder: Math.max(
      courses.findIndex((item) => item.id === courseId),
      0
    ),
  };
}

function buildCoursePayload(current: Course, formData: FormData): Course {
  return {
    ...current,
    title: cleanText(getFormValue(formData, "title"), current.title, 160),
    subtitle: cleanText(getFormValue(formData, "subtitle"), current.subtitle, 220),
    description: cleanLongText(
      getFormValue(formData, "description"),
      current.description,
      2400
    ),
    price: cleanPrice(getFormValue(formData, "price"), current.price),
    duration: cleanText(getFormValue(formData, "duration"), current.duration, 80),
    pace: cleanText(getFormValue(formData, "pace"), current.pace, 120),
    level: cleanText(getFormValue(formData, "level"), current.level, 80),
    category: cleanText(getFormValue(formData, "category"), current.category, 80),
    language: cleanText(getFormValue(formData, "language"), current.language, 80),
    instructor: cleanText(
      getFormValue(formData, "instructor"),
      current.instructor,
      120
    ),
  };
}

export async function updateCourseBasics(formData: FormData) {
  const courseId = getFormValue(formData, "course_id");
  if (!courseId) {
    redirectWithStatus("blocked");
  }

  let status: CourseActionStatus = "blocked";

  try {
    const { supabase, user } = await requireAdminContext();
    const { course, sortOrder } = await getEditableCourse(courseId);

    if (!course) {
      status = "not-found";
    } else {
      const payload = buildCoursePayload(course, formData);

      const { data: existingDocument } = await supabase
        .from("site_documents")
        .select("sort_order")
        .eq("kind", "course")
        .eq("slug", courseId)
        .maybeSingle();

      const { error: documentError } = await supabase
        .from("site_documents")
        .upsert(
          {
            kind: "course",
            slug: courseId,
            title: payload.title,
            status: "published",
            sort_order: existingDocument?.sort_order ?? sortOrder,
            payload,
            metadata: {
              category: payload.category,
              instructor: payload.instructor,
              managedBy: "admin_courses",
            },
            updated_by: user.id,
          },
          { onConflict: "kind,slug" }
        );

      if (documentError) {
        status = documentError.code === "42P01" ? "missing-backend" : "blocked";
      } else {
        await supabase.from("courses").upsert(
          {
            id: courseId,
            title: payload.title,
            description: payload.description,
            price: payload.price,
          },
          { onConflict: "id" }
        );

        await safeRecordOperationalEvent(
          {
            userId: user.id,
            scope: "system",
            eventType: "admin_course_updated",
            entityType: "course",
            entityId: courseId,
            title: "Admin kurs ma'lumotlarini yangiladi",
            detail: {
              title: payload.title,
              price: payload.price,
              category: payload.category,
            },
            dedupeKey: `admin-course-updated:${courseId}:${Date.now()}`,
          },
          { supabase }
        );

        refreshCoursePages(courseId);
        status = "updated";
      }
    }
  } catch {
    status = "blocked";
  }

  redirectWithStatus(status, courseId);
}

export async function archiveCourse(formData: FormData) {
  const courseId = getFormValue(formData, "course_id");
  if (!courseId) {
    redirectWithStatus("blocked");
  }

  let status: CourseActionStatus = "blocked";

  try {
    const { supabase, user } = await requireAdminContext();
    const { course, sortOrder } = await getEditableCourse(courseId);

    if (!course) {
      status = "not-found";
    } else {
      const { data: existingDocument } = await supabase
        .from("site_documents")
        .select("sort_order")
        .eq("kind", "course")
        .eq("slug", courseId)
        .maybeSingle();

      const { error: documentError } = await supabase
        .from("site_documents")
        .upsert(
          {
            kind: "course",
            slug: courseId,
            title: course.title,
            status: "published",
            sort_order: existingDocument?.sort_order ?? sortOrder,
            payload: {
              id: courseId,
              __adminArchived: true,
            },
            metadata: {
              category: course.category,
              instructor: course.instructor,
              visibility: "hidden",
              archivedBy: user.id,
              archivedAt: new Date().toISOString(),
              managedBy: "admin_courses",
            },
            updated_by: user.id,
          },
          { onConflict: "kind,slug" }
        );

      if (documentError) {
        status = documentError.code === "42P01" ? "missing-backend" : "blocked";
      } else {
        await supabase.from("courses").delete().eq("id", courseId);

        await safeRecordOperationalEvent(
          {
            userId: user.id,
            scope: "system",
            eventType: "admin_course_archived",
            severity: "warning",
            entityType: "course",
            entityId: courseId,
            title: "Admin kursni public katalogdan olib tashladi",
            detail: {
              title: course.title,
              category: course.category,
            },
            dedupeKey: `admin-course-archived:${courseId}:${Date.now()}`,
          },
          { supabase }
        );

        refreshCoursePages(courseId);
        status = "archived";
      }
    }
  } catch {
    status = "blocked";
  }

  redirectWithStatus(status, courseId);
}

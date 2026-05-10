import { getCourseByIdData } from "@/lib/content-store";
import { getCourseExperienceMeta } from "@/lib/course-experience";
import { createClient } from "@/utils/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type DataClient = Pick<SupabaseServerClient, "from" | "rpc">;

export interface IssuedCertificateView {
  id: string;
  courseId: string;
  certificateNo: string | null;
  verificationCode: string | null;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
  completedAt: string | null;
  template: {
    title: string;
    organizationName: string;
    signatureName: string;
    signatureTitle: string;
    certificateBody: string;
    accentColor: string;
    sealText: string;
  };
}

export type CertificateResolution =
  | {
      status: "issued";
      certificate: IssuedCertificateView;
    }
  | {
      status: "not_found";
    }
  | {
      status: "not_completed";
      progressPercent: number;
      courseTitle: string;
    }
  | {
      status: "backend_missing";
      message: string;
    };

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function isMissingBackendError(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "42P01" ||
    error?.code === "42703" ||
    error?.code === "42883" ||
    message.includes("does not exist") ||
    message.includes("could not find")
  );
}

export async function getOrCreateCourseCertificate(
  userId: string,
  courseId: string,
  supabase?: DataClient
): Promise<CertificateResolution> {
  const db = supabase ?? (await createClient());
  const course = await getCourseByIdData(courseId);

  if (!course) {
    return { status: "not_found" };
  }

  const { data: enrollment } = await db
    .from("enrollments")
    .select("progress_percent, completed_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  const progressPercent = enrollment?.progress_percent ?? 0;

  if (!enrollment || (!enrollment.completed_at && progressPercent < 100)) {
    return {
      status: "not_completed",
      progressPercent,
      courseTitle: course.title,
    };
  }

  const [{ data: profile }, templateResult] = await Promise.all([
    db
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .maybeSingle(),
    db
      .from("certificate_templates")
      .select(
        "title, organization_name, signature_name, signature_title, certificate_body, accent_color, seal_text"
      )
      .eq("course_id", courseId)
      .limit(1)
      .maybeSingle(),
  ]);

  if (templateResult.error && isMissingBackendError(templateResult.error)) {
    return {
      status: "backend_missing",
      message:
        "certificate_templates jadvali hali yo'q. Yangi instructor platform migrationni Supabase'da run qiling.",
    };
  }

  const meta = getCourseExperienceMeta(course);
  const templateRow = templateResult.data;
  const template = {
    title:
      templateRow?.title ??
      meta?.certificate.title ??
      `${course.title} Certificate`,
    organizationName: templateRow?.organization_name ?? "Kings Education",
    signatureName: templateRow?.signature_name ?? course.instructor,
    signatureTitle: templateRow?.signature_title ?? "Instructor",
    certificateBody:
      templateRow?.certificate_body ??
      "has successfully completed the learning track and demonstrated practical progress.",
    accentColor: templateRow?.accent_color ?? "#064e3b",
    sealText: templateRow?.seal_text ?? "KINGS VERIFIED",
  };
  const studentName =
    profile?.full_name ?? profile?.email?.split("@")[0] ?? "Kings Student";
  const { data, error } = await db.rpc("issue_course_certificate", {
    p_course_id: courseId,
    p_student_name: studentName,
    p_course_title: course.title,
    p_instructor_name: template.signatureName,
    p_template: template,
  });

  if (error) {
    if (isMissingBackendError(error)) {
      return {
        status: "backend_missing",
        message:
          "issue_course_certificate RPC hali yaratilmagan. Yangi migrationni Supabase'da run qiling.",
      };
    }

    return {
      status: "backend_missing",
      message: error.message,
    };
  }

  const certificate = asRecord(data);
  const storedTemplate = asRecord(certificate.template);

  return {
    status: "issued",
    certificate: {
      id: stringValue(certificate.id, ""),
      courseId,
      certificateNo:
        typeof certificate.certificate_no === "string"
          ? certificate.certificate_no
          : null,
      verificationCode:
        typeof certificate.verification_code === "string"
          ? certificate.verification_code
          : null,
      studentName: stringValue(certificate.student_name, studentName),
      courseTitle: stringValue(certificate.course_title, course.title),
      instructorName: stringValue(
        certificate.instructor_name,
        template.signatureName
      ),
      issuedAt: stringValue(certificate.issued_at, new Date().toISOString()),
      completedAt:
        typeof certificate.completed_at === "string"
          ? certificate.completed_at
          : enrollment.completed_at,
      template: {
        title: stringValue(storedTemplate.title, template.title),
        organizationName: stringValue(
          storedTemplate.organizationName,
          template.organizationName
        ),
        signatureName: stringValue(
          storedTemplate.signatureName,
          template.signatureName
        ),
        signatureTitle: stringValue(
          storedTemplate.signatureTitle,
          template.signatureTitle
        ),
        certificateBody: stringValue(
          storedTemplate.certificateBody,
          template.certificateBody
        ),
        accentColor: stringValue(storedTemplate.accentColor, template.accentColor),
        sealText: stringValue(storedTemplate.sealText, template.sealText),
      },
    },
  };
}

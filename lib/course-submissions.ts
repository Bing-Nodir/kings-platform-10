export const COURSE_SUBMISSION_STATUSES = [
  "draft",
  "submitted",
  "changes_requested",
  "published",
] as const;

export type CourseSubmissionStatus =
  (typeof COURSE_SUBMISSION_STATUSES)[number];

export interface CourseSubmissionResourceInput {
  title: string;
  type: string;
  href: string;
}

export interface CourseSubmissionLessonInput {
  id: string;
  title: string;
  duration: string;
  isFree: boolean;
  summary: string;
  videoUrl: string;
  videoMimeType: string;
  resources: CourseSubmissionResourceInput[];
}

export interface CourseSubmissionModuleInput {
  id: string;
  title: string;
  description: string;
  lessons: CourseSubmissionLessonInput[];
}

export interface CourseSubmissionSupportItemInput {
  title: string;
  description: string;
}

export interface CourseSubmissionReviewInput {
  name: string;
  role: string;
  rating: number;
  quote: string;
}

export interface CourseSubmissionCertificateTemplateInput {
  title: string;
  organizationName: string;
  signatureName: string;
  signatureTitle: string;
  certificateBody: string;
  accentColor: string;
  sealText: string;
}

export interface CourseSubmissionFormData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  duration: string;
  pace: string;
  level: string;
  category: string;
  language: "uz" | "ru" | "en";
  heroGradient: string;
  cardImage: string;
  outcomes: string[];
  supportItems: CourseSubmissionSupportItemInput[];
  reviews: CourseSubmissionReviewInput[];
  modules: CourseSubmissionModuleInput[];
  certificateTemplate: CourseSubmissionCertificateTemplateInput;
}

export const DEFAULT_COURSE_HERO_GRADIENT =
  "from-slate-950 via-blue-950 to-indigo-900";

export function createEmptyCourseSubmissionForm(): CourseSubmissionFormData {
  return {
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    price: 0,
    duration: "6 hafta",
    pace: "Haftasiga 3-4 soat",
    level: "Barcha daraja",
    category: "Business Analytics",
    language: "uz",
    heroGradient: DEFAULT_COURSE_HERO_GRADIENT,
    cardImage: "",
    outcomes: ["", "", ""],
    supportItems: [
      {
        title: "Mentor feedback",
        description: "Har hafta ustozdan qisqa feedback va yo'nalish.",
      },
    ],
    reviews: [],
    certificateTemplate: {
      title: "Kings Education Certificate",
      organizationName: "Kings Education",
      signatureName: "",
      signatureTitle: "Instructor",
      certificateBody:
        "has successfully completed the course requirements and demonstrated practical learning progress.",
      accentColor: "#064e3b",
      sealText: "KINGS VERIFIED",
    },
    modules: [
      {
        id: "module-1",
        title: "1-modul: Kirish",
        description: "Kursning boshlang'ich qismi va tayanch tushunchalar.",
        lessons: [
          {
            id: "lesson-1",
            title: "1-dars: Tanishtiruv",
            duration: "12:00",
            isFree: true,
            summary: "Kurs rejasi, natija va ishlash tartibi bilan tanishuv.",
            videoUrl: "",
            videoMimeType: "video/mp4",
            resources: [],
          },
        ],
      },
    ],
  };
}

export function formatCourseSubmissionStatus(
  status: CourseSubmissionStatus | string
) {
  if (status === "submitted") return "Review kutilmoqda";
  if (status === "changes_requested") return "Tuzatish so'ralgan";
  if (status === "published") return "Live";
  return "Draft";
}

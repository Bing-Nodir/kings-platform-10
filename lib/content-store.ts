import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  courses as courseSeeds,
  getCoursePreviewLessons,
  products as productSeeds,
  type Course,
  type Product,
} from "@/lib/catalog";
import {
  aboutPillars as aboutPillarSeeds,
  businessBenefits as businessBenefitSeeds,
  businessPlans as businessPlanSeeds,
  businessTestimonials as businessTestimonialSeeds,
  businessWorkflowSteps as businessWorkflowStepSeeds,
  faqEntries as faqEntrySeeds,
  homeEcosystemCards as homeEcosystemCardSeeds,
  homeStats as homeStatSeeds,
  type AboutPillar,
  type BusinessBenefit,
  type BusinessPlan,
  type BusinessTestimonial,
  type BusinessWorkflowStep,
  type FaqEntry,
  type HomeEcosystemCard,
  type HomeStat,
} from "@/lib/marketing-content";
import {
  PUBLIC_MARKETING_REVALIDATE_SECONDS,
  SITE_DOCUMENTS_CACHE_TAG,
} from "@/lib/cache-tags";
import {
  companyContact as companyContactSeed,
  companyStats as companyStatsSeed,
  mentorProfiles as mentorProfileSeeds,
  officeLocations as officeLocationSeeds,
  subscriptionPlans as subscriptionPlanSeeds,
  type MentorProfile,
  type OfficeLocation,
  type SubscriptionPlan,
} from "@/lib/site";
import { createPublicClient } from "@/utils/supabase/public";

export type SiteDocumentKind =
  | "course"
  | "product"
  | "mentor"
  | "office"
  | "subscription"
  | "company-contact"
  | "company-stat"
  | "homepage-stat"
  | "home-ecosystem-card"
  | "about-pillar"
  | "business-plan"
  | "business-benefit"
  | "business-testimonial"
  | "business-step"
  | "faq-entry";

type CompanyContact = typeof companyContactSeed;
type CompanyStat = (typeof companyStatsSeed)[number];

interface SiteDocumentRow<TPayload = unknown> {
  kind: SiteDocumentKind;
  slug: string;
  title: string | null;
  status: "draft" | "published" | "archived";
  sort_order: number | null;
  payload: TPayload;
  metadata?: Record<string, unknown>;
  updated_at?: string | null;
}

export interface SiteDocumentSeedEntry<TPayload = unknown> {
  kind: SiteDocumentKind;
  slug: string;
  title: string;
  status: "published";
  sort_order: number;
  payload: TPayload;
  metadata: Record<string, unknown>;
}

export interface SiteDocumentEditorRecord<TPayload = unknown>
  extends SiteDocumentRow<TPayload> {
  source: "database" | "seed";
}

export interface SiteDocumentOverview {
  available: boolean;
  source: "database" | "seed";
  totalPublished: number;
  byKind: Partial<Record<SiteDocumentKind, number>>;
  detail: string;
}

interface SerializedError {
  code?: string;
  message: string;
}

interface SiteDocumentQueryResult<TPayload = unknown> {
  data: SiteDocumentRow<TPayload>[] | null;
  error: SerializedError | null;
}

export const adminEditableSiteDocumentKinds = [
  "product",
  "mentor",
  "office",
  "subscription",
  "company-contact",
  "company-stat",
  "homepage-stat",
  "home-ecosystem-card",
  "about-pillar",
  "business-plan",
  "business-benefit",
  "business-testimonial",
  "business-step",
  "faq-entry",
] as const satisfies readonly SiteDocumentKind[];

export function getSiteDocumentKindLabel(kind: SiteDocumentKind) {
  const labels: Record<SiteDocumentKind, string> = {
    course: "Courses",
    product: "Products",
    mentor: "Mentors",
    office: "Offices",
    subscription: "Subscription plans",
    "company-contact": "Company contact",
    "company-stat": "Company stats",
    "homepage-stat": "Homepage stats",
    "home-ecosystem-card": "Homepage ecosystem cards",
    "about-pillar": "About pillars",
    "business-plan": "Business plans",
    "business-benefit": "Business benefits",
    "business-testimonial": "Business testimonials",
    "business-step": "Business workflow steps",
    "faq-entry": "FAQ entries",
  };

  return labels[kind];
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isMissingIncrementalCacheError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("incrementalCache missing in unstable_cache")
  );
}

function asObjectRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asStringArray(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : null;
}

function asCourse(value: unknown): Course | null {
  const payload = asObjectRecord(value);
  if (payload.__adminArchived === true || payload.__adminHidden === true) {
    return null;
  }

  return typeof payload.id === "string" &&
    typeof payload.title === "string" &&
    Array.isArray(payload.modules)
    ? (payload as unknown as Course)
    : null;
}

function asProduct(value: unknown): Product | null {
  const payload = asObjectRecord(value);
  if (
    payload.__adminArchived === true ||
    payload.__adminHidden === true ||
    payload.status === "archived" ||
    payload.status === "draft"
  ) {
    return null;
  }

  return typeof payload.id === "string" && typeof payload.name === "string"
    ? (payload as unknown as Product)
    : null;
}

function asMentorProfile(value: unknown): MentorProfile | null {
  const payload = asObjectRecord(value);
  const expertise = asStringArray(payload.expertise);
  return typeof payload.name === "string" &&
    typeof payload.role === "string" &&
    typeof payload.bio === "string" &&
    expertise
    ? ({ ...payload, expertise } as MentorProfile)
    : null;
}

function asOfficeLocation(value: unknown): OfficeLocation | null {
  const payload = asObjectRecord(value);
  return typeof payload.name === "string" &&
    typeof payload.city === "string" &&
    typeof payload.address === "string" &&
    typeof payload.hours === "string" &&
    typeof payload.phone === "string" &&
    typeof payload.description === "string" &&
    typeof payload.mapQuery === "string"
    ? (payload as unknown as OfficeLocation)
    : null;
}

function asSubscriptionPlan(value: unknown): SubscriptionPlan | null {
  const payload = asObjectRecord(value);
  const features = asStringArray(payload.features);
  return typeof payload.name === "string" &&
    typeof payload.price === "string" &&
    typeof payload.description === "string" &&
    typeof payload.accent === "string" &&
    features &&
    typeof payload.ctaLabel === "string" &&
    typeof payload.href === "string"
    ? ({ ...payload, features } as SubscriptionPlan)
    : null;
}

function asCompanyContact(value: unknown): CompanyContact | null {
  const payload = asObjectRecord(value);
  return typeof payload.email === "string" &&
    typeof payload.phoneDisplay === "string" &&
    typeof payload.phoneHref === "string"
    ? (payload as unknown as CompanyContact)
    : null;
}

function asCompanyStat(value: unknown): CompanyStat | null {
  const payload = asObjectRecord(value);
  return typeof payload.label === "string" && typeof payload.value === "string"
    ? (payload as unknown as CompanyStat)
    : null;
}

function formatCount(value: number, options?: { plus?: boolean }) {
  return `${value.toLocaleString("uz-UZ")}${options?.plus ? "+" : ""}`;
}

function asHomeStat(value: unknown): HomeStat | null {
  const payload = asObjectRecord(value);
  return typeof payload.label === "string" && typeof payload.value === "string"
    ? (payload as unknown as HomeStat)
    : null;
}

function asHomeEcosystemCard(value: unknown): HomeEcosystemCard | null {
  const payload = asObjectRecord(value);
  return typeof payload.title === "string" &&
    typeof payload.description === "string" &&
    typeof payload.href === "string" &&
    typeof payload.iconKey === "string"
    ? (payload as unknown as HomeEcosystemCard)
    : null;
}

function asAboutPillar(value: unknown): AboutPillar | null {
  const payload = asObjectRecord(value);
  return typeof payload.title === "string" &&
    typeof payload.description === "string" &&
    typeof payload.iconKey === "string" &&
    typeof payload.accentClass === "string"
    ? (payload as unknown as AboutPillar)
    : null;
}

function asBusinessPlan(value: unknown): BusinessPlan | null {
  const payload = asObjectRecord(value);
  const features = asStringArray(payload.features);
  return typeof payload.name === "string" &&
    typeof payload.price === "string" &&
    typeof payload.priceNote === "string" &&
    typeof payload.color === "string" &&
    (payload.badge === null || typeof payload.badge === "string") &&
    features &&
    typeof payload.cta === "string" &&
    typeof payload.ctaStyle === "string"
    ? ({ ...payload, features } as BusinessPlan)
    : null;
}

function asBusinessBenefit(value: unknown): BusinessBenefit | null {
  const payload = asObjectRecord(value);
  return typeof payload.title === "string" &&
    typeof payload.desc === "string" &&
    typeof payload.color === "string" &&
    typeof payload.bg === "string" &&
    typeof payload.iconKey === "string" &&
    (payload.metric === null || typeof payload.metric === "string")
    ? (payload as unknown as BusinessBenefit)
    : null;
}

function asBusinessTestimonial(value: unknown): BusinessTestimonial | null {
  const payload = asObjectRecord(value);
  return typeof payload.name === "string" &&
    typeof payload.role === "string" &&
    typeof payload.quote === "string" &&
    typeof payload.stars === "number" &&
    typeof payload.avatar === "string"
    ? (payload as unknown as BusinessTestimonial)
    : null;
}

function asBusinessWorkflowStep(value: unknown): BusinessWorkflowStep | null {
  const payload = asObjectRecord(value);
  return typeof payload.step === "string" &&
    typeof payload.title === "string" &&
    typeof payload.desc === "string" &&
    typeof payload.iconKey === "string"
    ? (payload as unknown as BusinessWorkflowStep)
    : null;
}

function asFaqEntry(value: unknown): FaqEntry | null {
  const payload = asObjectRecord(value);
  return typeof payload.category === "string" &&
    typeof payload.question === "string" &&
    typeof payload.answer === "string"
    ? (payload as unknown as FaqEntry)
    : null;
}

function buildSeedEntries(): SiteDocumentSeedEntry[] {
  return [
    ...courseSeeds.map((course, index) => ({
      kind: "course" as const,
      slug: course.id,
      title: course.title,
      status: "published" as const,
      sort_order: index,
      payload: course,
      metadata: {
        category: course.category,
        instructor: course.instructor,
      },
    })),
    ...productSeeds.map((product, index) => ({
      kind: "product" as const,
      slug: product.id,
      title: product.name,
      status: "published" as const,
      sort_order: index,
      payload: product,
      metadata: {
        category: product.category,
        inStock: product.inStock,
      },
    })),
    ...mentorProfileSeeds.map((mentor, index) => ({
      kind: "mentor" as const,
      slug: normalizeSlug(mentor.name),
      title: mentor.name,
      status: "published" as const,
      sort_order: index,
      payload: mentor,
      metadata: {
        role: mentor.role,
      },
    })),
    ...officeLocationSeeds.map((office, index) => ({
      kind: "office" as const,
      slug: normalizeSlug(office.name),
      title: office.name,
      status: "published" as const,
      sort_order: index,
      payload: office,
      metadata: {
        city: office.city,
      },
    })),
    ...subscriptionPlanSeeds.map((plan, index) => ({
      kind: "subscription" as const,
      slug: normalizeSlug(plan.name),
      title: plan.name,
      status: "published" as const,
      sort_order: index,
      payload: plan,
      metadata: {
        href: plan.href,
      },
    })),
    {
      kind: "company-contact" as const,
      slug: "default",
      title: "Company contact",
      status: "published" as const,
      sort_order: 0,
      payload: companyContactSeed,
      metadata: {},
    },
    ...companyStatsSeed.map((stat, index) => ({
      kind: "company-stat" as const,
      slug: normalizeSlug(stat.label),
      title: stat.label,
      status: "published" as const,
      sort_order: index,
      payload: stat,
      metadata: {},
    })),
    ...homeStatSeeds.map((stat, index) => ({
      kind: "homepage-stat" as const,
      slug: normalizeSlug(stat.label),
      title: stat.label,
      status: "published" as const,
      sort_order: index,
      payload: stat,
      metadata: {},
    })),
    ...homeEcosystemCardSeeds.map((card, index) => ({
      kind: "home-ecosystem-card" as const,
      slug: normalizeSlug(card.title),
      title: card.title,
      status: "published" as const,
      sort_order: index,
      payload: card,
      metadata: {
        href: card.href,
      },
    })),
    ...aboutPillarSeeds.map((pillar, index) => ({
      kind: "about-pillar" as const,
      slug: normalizeSlug(pillar.title),
      title: pillar.title,
      status: "published" as const,
      sort_order: index,
      payload: pillar,
      metadata: {},
    })),
    ...businessPlanSeeds.map((plan, index) => ({
      kind: "business-plan" as const,
      slug: normalizeSlug(plan.name),
      title: plan.name,
      status: "published" as const,
      sort_order: index,
      payload: plan,
      metadata: {
        badge: plan.badge,
      },
    })),
    ...businessBenefitSeeds.map((benefit, index) => ({
      kind: "business-benefit" as const,
      slug: normalizeSlug(benefit.title),
      title: benefit.title,
      status: "published" as const,
      sort_order: index,
      payload: benefit,
      metadata: {
        iconKey: benefit.iconKey,
      },
    })),
    ...businessTestimonialSeeds.map((testimonial, index) => ({
      kind: "business-testimonial" as const,
      slug: normalizeSlug(testimonial.name),
      title: testimonial.name,
      status: "published" as const,
      sort_order: index,
      payload: testimonial,
      metadata: {
        role: testimonial.role,
      },
    })),
    ...businessWorkflowStepSeeds.map((step, index) => ({
      kind: "business-step" as const,
      slug: `${step.step}-${normalizeSlug(step.title)}`,
      title: step.title,
      status: "published" as const,
      sort_order: index,
      payload: step,
      metadata: {
        step: step.step,
      },
    })),
    ...faqEntrySeeds.map((entry, index) => ({
      kind: "faq-entry" as const,
      slug: `${normalizeSlug(entry.category)}-${index + 1}`,
      title: entry.question,
      status: "published" as const,
      sort_order: index,
      payload: entry,
      metadata: {
        category: entry.category,
      },
    })),
  ];
}

const siteDocumentSeedEntries = buildSeedEntries();

function getSeedEntriesByKind<TPayload>(
  kind: SiteDocumentKind
): SiteDocumentSeedEntry<TPayload>[] {
  return siteDocumentSeedEntries.filter(
    (entry) => entry.kind === kind
  ) as SiteDocumentSeedEntry<TPayload>[];
}

function sortBySortOrder<T extends { sort_order: number | null; slug: string }>(
  rows: T[]
) {
  return [...rows].sort((first, second) => {
    const orderDifference = (first.sort_order ?? 0) - (second.sort_order ?? 0);
    if (orderDifference !== 0) {
      return orderDifference;
    }

    return first.slug.localeCompare(second.slug);
  });
}

async function fetchPublishedDocuments(
  kind: SiteDocumentKind
): Promise<SiteDocumentQueryResult> {
  const supabase = createPublicClient();
  const result = await supabase
    .from("site_documents")
    .select("kind, slug, title, status, sort_order, payload, metadata, updated_at")
    .eq("kind", kind)
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });

  return {
    data: result.error ? null : (result.data as SiteDocumentRow[]),
    error: result.error
      ? {
          code: result.error.code,
          message: result.error.message,
        }
      : null,
  };
}

const getPublishedDocuments = cache((kind: SiteDocumentKind) =>
  unstable_cache(async () => fetchPublishedDocuments(kind), ["site-documents", kind], {
    tags: [SITE_DOCUMENTS_CACHE_TAG, `${SITE_DOCUMENTS_CACHE_TAG}:${kind}`],
    revalidate: PUBLIC_MARKETING_REVALIDATE_SECONDS,
  })().catch((error) => {
    if (isMissingIncrementalCacheError(error)) {
      return fetchPublishedDocuments(kind);
    }

    throw error;
  })
);

const getCachedPublishedDocumentOverviewQuery = unstable_cache(
  async (): Promise<SiteDocumentQueryResult> => {
    const supabase = createPublicClient();
    const result = await supabase
      .from("site_documents")
      .select("kind, slug, status")
      .eq("status", "published");

    return {
      data: result.error ? null : (result.data as SiteDocumentRow[]),
      error: result.error
        ? {
            code: result.error.code,
            message: result.error.message,
          }
        : null,
    };
  },
  ["site-documents-overview"],
  {
    tags: [SITE_DOCUMENTS_CACHE_TAG],
    revalidate: PUBLIC_MARKETING_REVALIDATE_SECONDS,
  }
);

async function getPublishedDocumentOverviewQuery() {
  try {
    return await getCachedPublishedDocumentOverviewQuery();
  } catch (error) {
    if (isMissingIncrementalCacheError(error)) {
      const supabase = createPublicClient();
      const result = await supabase
        .from("site_documents")
        .select("kind, slug, status")
        .eq("status", "published");

      return {
        data: result.error ? null : (result.data as SiteDocumentRow[]),
        error: result.error
          ? {
              code: result.error.code,
              message: result.error.message,
            }
          : null,
      };
    }

    throw error;
  }
}

function withSeedFallback<TPayload>(
  rows: SiteDocumentRow<TPayload>[] | null,
  kind: SiteDocumentKind
) {
  if (rows && rows.length > 0) {
    const publishedRows = rows.filter((row) => row.status === "published");
    const seedRows = getSeedEntriesByKind<TPayload>(kind).map((entry) => ({
      kind: entry.kind,
      slug: entry.slug,
      title: entry.title,
      status: entry.status,
      sort_order: entry.sort_order,
      payload: entry.payload,
      metadata: entry.metadata,
      updated_at: null,
    }));
    const existingSlugs = new Set(rows.map((row) => row.slug));

    return {
      source: "database" as const,
      rows: sortBySortOrder([
        ...publishedRows,
        ...seedRows.filter((row) => !existingSlugs.has(row.slug)),
      ]),
    };
  }

  return {
    source: "seed" as const,
    rows: sortBySortOrder(
      getSeedEntriesByKind<TPayload>(kind).map((entry) => ({
        kind: entry.kind,
        slug: entry.slug,
        title: entry.title,
        status: entry.status,
        sort_order: entry.sort_order,
        payload: entry.payload,
        metadata: entry.metadata,
        updated_at: null,
      }))
    ),
  };
}

function parseDocuments<TPayload>(
  rows: SiteDocumentRow[],
  parser: (value: unknown) => TPayload | null
) {
  return rows
    .map((row) => parser(row.payload))
    .filter((row): row is TPayload => Boolean(row));
}

async function getParsedDocuments<TPayload>(
  kind: SiteDocumentKind,
  parser: (value: unknown) => TPayload | null,
  fallbackSeeds: TPayload[]
) {
  const { data, error } = await getPublishedDocuments(kind);
  const fallback = withSeedFallback<TPayload>(
    error ? null : (data as SiteDocumentRow<TPayload>[] | null),
    kind
  );
  const parsed = parseDocuments(fallback.rows, parser);

  if (parsed.length > 0 || fallback.source === "database") {
    return parsed;
  }

  return fallbackSeeds;
}

export function getSiteDocumentSeedEntries(kinds?: readonly SiteDocumentKind[]) {
  if (!kinds) {
    return [...siteDocumentSeedEntries];
  }

  const allowedKinds = new Set<SiteDocumentKind>(kinds);
  return siteDocumentSeedEntries.filter((entry) => allowedKinds.has(entry.kind));
}

export function getSiteDocumentEditorRecords(
  rows: SiteDocumentRow[] | null,
  kinds: readonly SiteDocumentKind[] = adminEditableSiteDocumentKinds
) {
  const allowedKinds = new Set<SiteDocumentKind>(kinds);
  const seedEntries = getSiteDocumentSeedEntries(kinds);
  const databaseRows = (rows ?? []).filter((row) => allowedKinds.has(row.kind));
  const rowMap = new Map<string, SiteDocumentRow>(
    databaseRows.map((row) => [`${row.kind}:${row.slug}`, row])
  );
  const seededKeys = new Set<string>();

  const merged = seedEntries.map((entry) => {
    const key = `${entry.kind}:${entry.slug}`;
    seededKeys.add(key);

    const databaseRow = rowMap.get(key);
    if (databaseRow) {
      return {
        ...databaseRow,
        source: "database" as const,
      };
    }

    return {
      kind: entry.kind,
      slug: entry.slug,
      title: entry.title,
      status: entry.status,
      sort_order: entry.sort_order,
      payload: entry.payload,
      metadata: entry.metadata,
      updated_at: null,
      source: "seed" as const,
    };
  });

  for (const row of databaseRows) {
    const key = `${row.kind}:${row.slug}`;
    if (seededKeys.has(key)) {
      continue;
    }

    merged.push({
      ...row,
      source: "database" as const,
    });
  }

  return sortBySortOrder(merged);
}

export const getCoursesData = cache(async (): Promise<Course[]> =>
  getParsedDocuments("course", asCourse, courseSeeds)
);

export async function getCourseByIdData(id: string) {
  return (await getCoursesData()).find((course) => course.id === id);
}

export const getProductsData = cache(async (): Promise<Product[]> =>
  getParsedDocuments("product", asProduct, productSeeds)
);

export async function getProductByIdData(id: string) {
  return (await getProductsData()).find((product) => product.id === id);
}

export const getMentorProfilesData = cache(async (): Promise<MentorProfile[]> =>
  getParsedDocuments("mentor", asMentorProfile, mentorProfileSeeds)
);

export const getOfficeLocationsData = cache(
  async (): Promise<OfficeLocation[]> =>
    getParsedDocuments("office", asOfficeLocation, officeLocationSeeds)
);

export const getSubscriptionPlansData = cache(
  async (): Promise<SubscriptionPlan[]> =>
    getParsedDocuments("subscription", asSubscriptionPlan, subscriptionPlanSeeds)
);

export const getCompanyContactData = cache(async (): Promise<CompanyContact> => {
  const documents = await getParsedDocuments(
    "company-contact",
    asCompanyContact,
    [companyContactSeed]
  );

  return documents[0] ?? companyContactSeed;
});

export const getCompanyStatsData = cache(async (): Promise<CompanyStat[]> =>
  getParsedDocuments("company-stat", asCompanyStat, companyStatsSeed)
);

export const getLiveCompanyStatsData = cache(async (): Promise<CompanyStat[]> => {
  const [courses, mentors, offices] = await Promise.all([
    getCoursesData(),
    getMentorProfilesData(),
    getOfficeLocationsData(),
  ]);
  const previewLessonCount = courses.reduce(
    (sum, course) => sum + getCoursePreviewLessons(course).length,
    0
  );

  return [
    {
      label: "Flagship kurslar",
      value: formatCount(courses.length, { plus: courses.length >= 8 }),
    },
    {
      label: "Core mentorlar",
      value: formatCount(mentors.length),
    },
    {
      label: "Preview darslar",
      value: formatCount(previewLessonCount, { plus: previewLessonCount >= 20 }),
    },
    {
      label: "Filiallar",
      value: formatCount(offices.length),
    },
  ];
});

export const getHomepageStatsData = cache(async (): Promise<HomeStat[]> =>
  getParsedDocuments("homepage-stat", asHomeStat, homeStatSeeds)
);

export const getHomeEcosystemCardsData = cache(
  async (): Promise<HomeEcosystemCard[]> =>
    getParsedDocuments(
      "home-ecosystem-card",
      asHomeEcosystemCard,
      homeEcosystemCardSeeds
    )
);

export const getAboutPillarsData = cache(async (): Promise<AboutPillar[]> =>
  getParsedDocuments("about-pillar", asAboutPillar, aboutPillarSeeds)
);

export const getBusinessPlansData = cache(async (): Promise<BusinessPlan[]> =>
  getParsedDocuments("business-plan", asBusinessPlan, businessPlanSeeds)
);

export const getBusinessBenefitsData = cache(
  async (): Promise<BusinessBenefit[]> =>
    getParsedDocuments(
      "business-benefit",
      asBusinessBenefit,
      businessBenefitSeeds
    )
);

export const getBusinessTestimonialsData = cache(
  async (): Promise<BusinessTestimonial[]> =>
    getParsedDocuments(
      "business-testimonial",
      asBusinessTestimonial,
      businessTestimonialSeeds
    )
);

export const getBusinessWorkflowStepsData = cache(
  async (): Promise<BusinessWorkflowStep[]> =>
    getParsedDocuments(
      "business-step",
      asBusinessWorkflowStep,
      businessWorkflowStepSeeds
    )
);

export const getFaqEntriesData = cache(async (): Promise<FaqEntry[]> =>
  getParsedDocuments("faq-entry", asFaqEntry, faqEntrySeeds)
);

export const getSiteDocumentOverview = cache(
  async (): Promise<SiteDocumentOverview> => {
    const { data, error } = await getPublishedDocumentOverviewQuery();

    if (error) {
      return {
        available: false,
        source: "seed",
        totalPublished: 0,
        byKind: {},
        detail:
          error.code === "42P01"
            ? "site_documents jadvali hali yaratilmagan."
            : error.message || "site_documents query muvaffaqiyatsiz tugadi.",
      };
    }

    const byKind: Partial<Record<SiteDocumentKind, number>> = {};
    for (const row of data ?? []) {
      const kind = row.kind as SiteDocumentKind;
      byKind[kind] = (byKind[kind] ?? 0) + 1;
    }

    return {
      available: true,
      source: (data?.length ?? 0) > 0 ? "database" : "seed",
      totalPublished: data?.length ?? 0,
      byKind,
      detail:
        (data?.length ?? 0) > 0
          ? `${data?.length ?? 0} ta published document topildi.`
          : "site_documents bo'sh, seed fallback ishlayapti.",
    };
  }
);

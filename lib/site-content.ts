import { cache } from "react";
import { normalizeMultiline, normalizeSingleLine } from "@/lib/server/validation";
import { createClient } from "@/utils/supabase/server";

export type SiteContentSection =
  | "Navbar"
  | "Home Hero"
  | "Home Courses"
  | "Home Ecosystem"
  | "Footer";

export interface SiteContentField {
  id: string;
  dbKey: string;
  label: string;
  description: string;
  section: SiteContentSection;
  multiline: boolean;
  maxLength: number;
  defaultValue: string;
}

export interface SiteContentEditorField extends SiteContentField {
  value: string;
}

export const siteContentSections: SiteContentSection[] = [
  "Navbar",
  "Home Hero",
  "Home Courses",
  "Home Ecosystem",
  "Footer",
];

export const siteContentFields = [
  {
    id: "navbarSearchPlaceholder",
    dbKey: "navbar.search_placeholder",
    label: "Navbar qidiruv placeholderi",
    description: "Desktop navbar ichidagi qidiruv maydoni matni.",
    section: "Navbar",
    multiline: false,
    maxLength: 80,
    defaultValue: "Kurs yoki mentor qidiring",
  },
  {
    id: "homeHeroBadge",
    dbKey: "home.hero.badge",
    label: "Hero badge",
    description: "Homepage hero ustidagi kichik premium badge matni.",
    section: "Home Hero",
    multiline: false,
    maxLength: 80,
    defaultValue: "Kelajak ta'limiga xush kelibsiz",
  },
  {
    id: "homeHeroLightTitlePrefix",
    dbKey: "home.hero.light_title_prefix",
    label: "Light hero title prefix",
    description: "Yorug' rejimdagi hero sarlavhasining birinchi qismi.",
    section: "Home Hero",
    multiline: false,
    maxLength: 80,
    defaultValue: "O'z kelajagingizni",
  },
  {
    id: "homeHeroLightTitleHighlight",
    dbKey: "home.hero.light_title_highlight",
    label: "Light hero title highlight",
    description: "Yorug' rejimdagi hero sarlavhasining ajratilgan qismi.",
    section: "Home Hero",
    multiline: false,
    maxLength: 80,
    defaultValue: "AI Ta'limi bilan quring",
  },
  {
    id: "homeHeroDarkTitle",
    dbKey: "home.hero.dark_title",
    label: "Dark hero title",
    description: "Qorong'i rejimdagi hero sarlavhasi.",
    section: "Home Hero",
    multiline: false,
    maxLength: 120,
    defaultValue: "Kelajak kasblarini biz bilan o'rganing",
  },
  {
    id: "homeHeroDescription",
    dbKey: "home.hero.description",
    label: "Hero description",
    description: "Homepage hero ostidagi asosiy tavsif matni.",
    section: "Home Hero",
    multiline: true,
    maxLength: 320,
    defaultValue:
      "Kings Education - eng ilg'or online kurslar, sun'iy intellekt yordamchilari va to'liq integratsiyalashgan do'konni o'zida jamlagan platforma.",
  },
  {
    id: "homeCoursesEyebrow",
    dbKey: "home.courses.eyebrow",
    label: "Courses eyebrow",
    description: "Kurslar bo'limi yuqorisidagi kichik sarlavha.",
    section: "Home Courses",
    multiline: false,
    maxLength: 60,
    defaultValue: "O'quv dasturlari",
  },
  {
    id: "homeCoursesTitle",
    dbKey: "home.courses.title",
    label: "Courses title",
    description: "Homepage kurslar blokining asosiy sarlavhasi.",
    section: "Home Courses",
    multiline: false,
    maxLength: 80,
    defaultValue: "Bizning kurslar",
  },
  {
    id: "homeCoursesDescription",
    dbKey: "home.courses.description",
    label: "Courses description",
    description: "Kurslar blokidagi izoh matni.",
    section: "Home Courses",
    multiline: true,
    maxLength: 420,
    defaultValue:
      "Python, SQL, database, AI, Power BI, data analytics, data science va ACCA IFRS yo'nalishlari modulga bo'lingan premium curriculum, preview darslar va portfolio-ready practice bilan taqdim etiladi.",
  },
  {
    id: "homeEcosystemEyebrow",
    dbKey: "home.ecosystem.eyebrow",
    label: "Ecosystem eyebrow",
    description: "Ekotizim blokidagi kichik sarlavha.",
    section: "Home Ecosystem",
    multiline: false,
    maxLength: 60,
    defaultValue: "Ecosystem",
  },
  {
    id: "homeEcosystemTitle",
    dbKey: "home.ecosystem.title",
    label: "Ecosystem title",
    description: "Ekotizim blokining asosiy sarlavhasi.",
    section: "Home Ecosystem",
    multiline: false,
    maxLength: 100,
    defaultValue: "Platformaning har bir qismi birgalikda ishlaydi",
  },
  {
    id: "homeEcosystemDescription",
    dbKey: "home.ecosystem.description",
    label: "Ecosystem description",
    description: "Ekotizim blokidagi tavsif matni.",
    section: "Home Ecosystem",
    multiline: true,
    maxLength: 320,
    defaultValue:
      "Kurslar, qidiruv, subscription, ofislar va mentorlar bo'limi bir-biriga ulangan product flow sifatida ishlaydi.",
  },
  {
    id: "footerDescription",
    dbKey: "footer.description",
    label: "Footer description",
    description: "Footer chap blokidagi qisqa brand tavsifi.",
    section: "Footer",
    multiline: true,
    maxLength: 260,
    defaultValue:
      "AI bilan integratsiyalashgan kurslar, mentor support, checkout va oflayn markazlarni bir product ekotizimiga birlashtiradigan ta'lim platformasi.",
  },
] as const satisfies readonly SiteContentField[];

export type SiteContentFieldId = (typeof siteContentFields)[number]["id"];
export type SiteContentMap = Record<SiteContentFieldId, string>;

const fieldById = Object.fromEntries(
  siteContentFields.map((field) => [field.id, field])
) as Record<SiteContentFieldId, (typeof siteContentFields)[number]>;

const fieldIdByDbKey = Object.fromEntries(
  siteContentFields.map((field) => [field.dbKey, field.id])
) as Record<string, SiteContentFieldId>;

export const defaultSiteContent = siteContentFields.reduce(
  (acc, field) => {
    acc[field.id] = field.defaultValue;
    return acc;
  },
  {} as SiteContentMap
);

function normalizeFieldValue(
  field: (typeof siteContentFields)[number],
  value: unknown
) {
  const normalized = field.multiline
    ? normalizeMultiline(value, field.maxLength)
    : normalizeSingleLine(value, field.maxLength);

  return normalized || field.defaultValue;
}

export function sanitizeSiteContentPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const updates = payload as Record<string, unknown>;

  return siteContentFields
    .filter((field) => field.id in updates)
    .map((field) => ({
      content_key: field.dbKey,
      content_value: normalizeFieldValue(field, updates[field.id]),
    }));
}

export function getSiteContentEditorFields(
  content: SiteContentMap
): SiteContentEditorField[] {
  return siteContentFields.map((field) => ({
    ...field,
    value: content[field.id],
  }));
}

export const getSiteContent = cache(async (): Promise<SiteContentMap> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("content_key, content_value");

  if (error || !data) {
    return defaultSiteContent;
  }

  const merged = { ...defaultSiteContent };

  for (const row of data) {
    const fieldId = fieldIdByDbKey[row.content_key];
    if (!fieldId) {
      continue;
    }

    merged[fieldId] =
      typeof row.content_value === "string" && row.content_value.trim()
        ? normalizeFieldValue(fieldById[fieldId], row.content_value)
        : defaultSiteContent[fieldId];
  }

  return merged;
});

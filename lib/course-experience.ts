import type { Course } from "@/lib/catalog";
import { getCoursePreviewLessons } from "@/lib/catalog";
import { getQuizByCourseId } from "@/lib/quizzes";

interface CourseCertificateMeta {
  title: string;
  description: string;
  shareable: string;
}

interface CourseExperienceMeta {
  skills: string[];
  prerequisites: string[];
  targetAudience: string[];
  certificate: CourseCertificateMeta;
}

interface CourseTrack {
  title: string;
  subtitle: string;
  bullets: string[];
}

interface CourseFaq {
  question: string;
  answer: string;
}

interface WeeklyPlanItem {
  week: string;
  focus: string;
  outcome: string;
}

interface CareerOutcome {
  title: string;
  description: string;
}

const COURSE_META: Record<string, CourseExperienceMeta> = {
  "python-analytics-automation": {
    skills: ["Python syntax", "Pandas workflows", "File automation", "Reporting scripts"],
    prerequisites: [
      "Kompyuterda fayl va papkalar bilan ishlashni bilish",
      "Excel yoki CSV bilan ishlagan bo'lish foydali",
      "Kod yozish bo'yicha oldindan tajriba shart emas",
    ],
    targetAudience: [
      "Boshlang'ich analyst va internlar",
      "Reporting va finance workflow'larini avtomatlashtirmoqchi bo'lganlar",
      "Portfolio uchun real Python case yig'moqchi bo'lganlar",
    ],
    certificate: {
      title: "Python Analytics Automation Certificate",
      description:
        "Capstone automation case, practice workflow va premium lessonlarni yakunlaganingizdan keyin beriladi.",
      shareable:
        "CV, LinkedIn va portfolio case-study bilan birga ko'rsatish uchun mos.",
    },
  },
  "sql-querying-reporting": {
    skills: ["SQL querying", "JOIN logic", "CTE structure", "Analytical validation"],
    prerequisites: [
      "Database tushunchalari bilan yuzaki tanishuv foydali",
      "Data yoki reporting savollariga qiziqish bo'lishi yetarli",
      "Murakkab matematika talab qilinmaydi",
    ],
    targetAudience: [
      "Junior analyst va reporting specialistlar",
      "SQL interview va amaliy query logicni kuchaytirmoqchi bo'lganlar",
      "BI yoki analytics yo'nalishiga o'tayotganlar",
    ],
    certificate: {
      title: "SQL Querying & Reporting Credential",
      description:
        "Portfolio-grade query case va yakuniy testdan o'tgan o'quvchilar uchun chiqariladi.",
      shareable:
        "Hiring manager'ga query thinking va validation discipline'ni ko'rsatadi.",
    },
  },
  "database-design-foundations": {
    skills: ["Schema design", "Normalization", "Keys and constraints", "Relational modeling"],
    prerequisites: [
      "Jadval va field tushunchalarini bilish foydali",
      "SQL yozish tajribasi bo'lmasa ham bo'ladi",
      "Product yoki analytics data flow'ga qiziqish yetarli",
    ],
    targetAudience: [
      "Backend, analytics va BI'ga kirayotganlar",
      "Database arxitekturasini tushunmoqchi bo'lgan juniorlar",
      "Operational va analytical schema farqini o'rganmoqchi bo'lganlar",
    ],
    certificate: {
      title: "Database Design Foundations Certificate",
      description:
        "Schema review, DDL validation va final architecture task yakunida beriladi.",
      shareable:
        "Portfolio yoki system design bo'limiga qo'shish uchun kuchli signal.",
    },
  },
  "ai-for-analysts": {
    skills: ["Prompt design", "AI verification", "Research synthesis", "Workflow automation"],
    prerequisites: [
      "Professional yozish yoki analysis ishlarida qatnashgan bo'lish foydali",
      "AI bilan basic tajriba bo'lmasa ham bo'ladi",
      "Source tekshirish va responsible use'ga tayyor bo'lish kerak",
    ],
    targetAudience: [
      "Analyst, researcher va knowledge workerlar",
      "AI'dan amaliy va xavfsiz foydalanmoqchi bo'lgan jamoalar",
      "Memo, report va research workflow'ini tezlashtirmoqchi bo'lganlar",
    ],
    certificate: {
      title: "AI for Analysts Productivity Certificate",
      description:
        "Prompt bank, verification workflow va productivity case yakunida taqdim etiladi.",
      shareable:
        "Modern analytics workflow va AI literacy signalini beradi.",
    },
  },
  "power-bi-decision-dashboards": {
    skills: ["Power BI modeling", "DAX measures", "Executive dashboards", "Insight storytelling"],
    prerequisites: [
      "Excel yoki reporting bilan tanish bo'lish foydali",
      "KPI va metric tushunchalarini bilish afzallik beradi",
      "Oldindan Power BI tajribasi talab qilinmaydi",
    ],
    targetAudience: [
      "Business analyst va BI specialistlar",
      "Dashboard portfolio tuzmoqchi bo'lganlar",
      "Rahbariyat uchun o'qilishi oson report yaratmoqchi bo'lganlar",
    ],
    certificate: {
      title: "Power BI Decision Dashboard Certificate",
      description:
        "Executive dashboard capstone va portfolio presentation'ni yakunlaganingizdan keyin beriladi.",
      shareable:
        "Dashboard project, interview va freelance profilga juda mos credential.",
    },
  },
  "data-analytics-professional": {
    skills: ["Business analytics", "KPI design", "Insight storytelling", "Executive summary"],
    prerequisites: [
      "Excel yoki data bilan basic ishlash foydali",
      "Biznes savollarini tahlil qilishga qiziqish bo'lishi kerak",
      "Oldindan code talab qilinmaydi",
    ],
    targetAudience: [
      "Data analyst bo'lishni maqsad qilganlar",
      "Reporting'dan decision analytics'ga o'tayotganlar",
      "Portfolio-ready case va prezentatsiya qilishni xohlaganlar",
    ],
    certificate: {
      title: "Data Analytics Professional Certificate",
      description:
        "Capstone analytics case, quiz natijalari va premium module completion bilan beriladi.",
      shareable:
        "CV, LinkedIn va case-based portfolio ichida kuchli credential sifatida ishlaydi.",
    },
  },
  "data-science-foundations": {
    skills: ["Statistical thinking", "Regression", "Classification", "Model evaluation"],
    prerequisites: [
      "Python yoki data analysis bo'yicha minimal tanishuv foydali",
      "Basic algebra va foiz tushunchalarini bilish kerak",
      "Model natijalarini sabr bilan tahlil qilishga tayyor bo'lish lozim",
    ],
    targetAudience: [
      "Data science'ga kirayotgan analystlar",
      "ML fundamentals'ni chalkashmasdan o'rganmoqchi bo'lganlar",
      "Model intuition va evaluation thinking qurmoqchi bo'lganlar",
    ],
    certificate: {
      title: "Data Science Foundations Certificate",
      description:
        "Mini-model case, evaluation report va final interpretation task bilan chiqariladi.",
      shareable:
        "Data science entry-level readiness va modeling basics signalini beradi.",
    },
  },
  "acca-ifrs-financial-reporting": {
    skills: ["IFRS reporting", "Financial statements", "IFRS 9 logic", "Risk-aware analysis"],
    prerequisites: [
      "Accounting yoki finance tushunchalari bilan tanish bo'lish foydali",
      "Moliyaviy hisobotlarni o'qishga qiziqish bo'lishi kerak",
      "ACCA background bo'lmasa ham kursdan foyda olsa bo'ladi",
    ],
    targetAudience: [
      "Finance, audit va risk reporting mutaxassislari",
      "IFRS reporting'ni amaliy kontekstda o'rganmoqchi bo'lganlar",
      "Professional credential bilan CV'sini kuchaytirmoqchi bo'lganlar",
    ],
    certificate: {
      title: "ACCA IFRS Reporting Certificate",
      description:
        "IFRS capstone, risk-aware reporting block va final assessment yakunlangach beriladi.",
      shareable:
        "Finance va risk reporting yo'nalishida professional signal sifatida ishlaydi.",
    },
  },
};

export function getCourseExperienceMeta(course: Course) {
  return COURSE_META[course.id];
}

export function getCourseTracks(course: Course): CourseTrack[] {
  const previewCount = getCoursePreviewLessons(course).length;
  const meta = getCourseExperienceMeta(course);

  return [
    {
      title: "Audit track",
      subtitle: "Udemy-style preview + edX audit model",
      bullets: [
        `${previewCount} ta bepul lesson va open curriculum preview`,
        "Course landing page, reviews va instructor context bilan tanishish",
        "To'lovsiz tanishuv, lekin premium quiz, mentor va certificate yopiq",
      ],
    },
    {
      title: "Certificate track",
      subtitle: "Premium access + guided mastery flow",
      bullets: [
        "Barcha video darslar, resurslar va AI Mentor ochiladi",
        getQuizByCourseId(course.id)
          ? "Quiz va mastery challenge orqali bilim mustahkamlanadi"
          : "Capstone va lesson resource flow orqali bilim mustahkamlanadi",
        meta
          ? `${meta.certificate.title} va shareable outcome beriladi`
          : "Course completion va certificate workflow beriladi",
      ],
    },
  ];
}

export function getCourseFaqs(course: Course): CourseFaq[] {
  const previewCount = getCoursePreviewLessons(course).length;
  const meta = getCourseExperienceMeta(course);

  return [
    {
      question: "Kursni boshlash uchun oldindan tajriba kerakmi?",
      answer:
        meta?.prerequisites.join(". ") ??
        "Kurslar strukturali qurilgan, shuning uchun zarur boshlang'ich qadamlar ichida tushuntiriladi.",
    },
    {
      question: "Bepul preview va premium access o'rtasidagi farq nima?",
      answer: `Audit track ichida ${previewCount} ta preview lesson ochiq bo'ladi. Premium access esa barcha lessonlar, resurslar, AI Mentor, quiz va certificate flow'ni ochadi.`,
    },
    {
      question: "Kurs yakunida qanday credential olaman?",
      answer:
        meta?.certificate.description ??
        "Kursni to'liq tamomlagan o'quvchilar uchun certificate workflow mavjud.",
    },
    {
      question: "Bu kurs kimlar uchun eng mos?",
      answer:
        meta?.targetAudience.join(". ") ??
        "Career transition, portfolio va amaliy project orqali o'sishni istagan o'quvchilar uchun mos.",
    },
  ];
}

export function getCourseWeeklyPlan(course: Course): WeeklyPlanItem[] {
  const firstModule = course.modules[0];
  const secondModule = course.modules[1] ?? course.modules[0];

  return [
    {
      week: "1-2 hafta",
      focus: `${firstModule?.title ?? "Foundation block"}`,
      outcome:
        firstModule?.lessons[0]?.summary ??
        "Asosiy concepts va lesson flow bilan mustahkam poydevor quriladi.",
    },
    {
      week: "3-4 hafta",
      focus: `${firstModule?.lessons.slice(1, 3).map((lesson) => lesson.title).join(" + ") || "Guided practice"}`,
      outcome:
        "Preview va guided practice bloklari orqali core logic ishchi holatga olib chiqiladi.",
    },
    {
      week: "5-6 hafta",
      focus: `${secondModule?.title ?? "Advanced block"}`,
      outcome:
        secondModule?.lessons[0]?.summary ??
        "Premium lessonlar orqali amaliy workflow va challenge bosqichi boshlanadi.",
    },
    {
      week: "7-8 hafta",
      focus: "Capstone, quiz va certificate track",
      outcome:
        "Portfolio-grade natija, quiz mastery va certificate-ready output shakllantiriladi.",
    },
  ];
}

const CAREER_OUTCOME_MAP: Record<string, CareerOutcome[]> = {
  Python: [
    {
      title: "Automation analyst",
      description: "Takrorlanadigan Excel, CSV va reporting jarayonlarini Python skriptlari bilan tezlashtira olasiz.",
    },
    {
      title: "Junior data engineer track",
      description: "File pipeline, transform va scheduled workflow fikrlashi bilan keyingi bosqichga tayyor bo'lasiz.",
    },
    {
      title: "Portfolio builder",
      description: "CV va interview uchun ko'rsatish mumkin bo'lgan automation case tayyorlaysiz.",
    },
  ],
  SQL: [
    {
      title: "Reporting specialist",
      description: "Biznes savollarini query logic'ga tarjima qilish va ishonchli natija chiqarish ko'nikmasi shakllanadi.",
    },
    {
      title: "BI analyst foundation",
      description: "Dashboard va metric qatlamlarining ma'lumot manbasini mustahkam qurishga tayyor bo'lasiz.",
    },
    {
      title: "Interview readiness",
      description: "JOIN, CTE va validation patternlari texnik suhbatlarda kuchli signal beradi.",
    },
  ],
  Database: [
    {
      title: "Schema thinker",
      description: "Backend, analytics va product data flow'lari uchun toza model qurish qobiliyati rivojlanadi.",
    },
    {
      title: "Operational to analytical bridge",
      description: "Transactional model va reporting model o'rtasidagi farqni amalda tushunasiz.",
    },
    {
      title: "Data architecture support",
      description: "Jamoaviy product va dashboard ishlarida aniq strukturaviy qaror bera olasiz.",
    },
  ],
  AI: [
    {
      title: "AI-enabled analyst",
      description: "Research, memo va summary vazifalarida AI'ni xavfsiz va samarali qo'llay olasiz.",
    },
    {
      title: "Knowledge workflow optimizer",
      description: "Prompt bank, verification va source discipline bilan tezroq ishlaydigan tizim yaratasiz.",
    },
    {
      title: "Modern office productivity",
      description: "AI literacy'ni kundalik knowledge work jarayoniga professional ravishda olib kirasiz.",
    },
  ],
  "Power BI": [
    {
      title: "Dashboard analyst",
      description: "Rahbariyat uchun o'qilishi oson KPI va insight dashboardlarini ishlab chiqasiz.",
    },
    {
      title: "Business reporting owner",
      description: "Metric design, DAX va executive storytelling bilan report sifatini oshirasiz.",
    },
    {
      title: "Portfolio presentation",
      description: "Freelance, ishga joylashish yoki ichki loyiha uchun tayyor dashboard case yig'asiz.",
    },
  ],
  "Data Analytics": [
    {
      title: "Decision-oriented analyst",
      description: "Savoldan insight va recommendation'gacha bo'lgan to'liq analytics oqimini boshqara olasiz.",
    },
    {
      title: "Stakeholder communicator",
      description: "Topilgan natijani executive summary va aniq recommendation ko'rinishida bera olasiz.",
    },
    {
      title: "Portfolio analyst",
      description: "Case-based portfolio bilan junior-mid analytics rollariga tayyor bo'lasiz.",
    },
  ],
  "Data Science": [
    {
      title: "Modeling foundation",
      description: "Regression, classification va evaluation logic'ini chalkashmasdan tushunasiz.",
    },
    {
      title: "Applied experimentation",
      description: "Feature engineering va model interpretation bilan real case'larni baholay olasiz.",
    },
    {
      title: "ML readiness",
      description: "Keyingi advanced machine learning yoki MLOps bosqichlariga tayyor tayanch paydo bo'ladi.",
    },
  ],
  "Finance & IFRS": [
    {
      title: "Financial reporting specialist",
      description: "Hisobotlar strukturasini va IFRS adjustment logic'ini amaliy ko'rinishda boshqara olasiz.",
    },
    {
      title: "Risk-aware finance track",
      description: "IFRS 9 va ECL bloklari bilan risk reporting yo'nalishiga o'tish osonlashadi.",
    },
    {
      title: "Professional credential path",
      description: "CV va finance interview'larda ishlaydigan signal beradigan structured output olasiz.",
    },
  ],
};

export function getCourseCareerOutcomes(course: Course) {
  return (
    CAREER_OUTCOME_MAP[course.category] ?? [
      {
        title: "Structured career growth",
        description:
          "Kurs yakunida portfolio, interview va amaliy loyiha uchun ishlaydigan signal paydo bo'ladi.",
      },
    ]
  );
}

export function getMasteryLevel(progressPercent: number) {
  if (progressPercent >= 100) {
    return {
      label: "Mastered",
      description: "Kursni to'liq yakunlagansiz va certificate track bajarilgan.",
      className:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    };
  }

  if (progressPercent >= 60) {
    return {
      label: "Proficient",
      description: "Asosiy modullar o'zlashtirilgan, endi challenge va capstone bosqichi.",
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    };
  }

  if (progressPercent >= 25) {
    return {
      label: "Familiar",
      description: "Asosiy concepts bilan ishlayapsiz, endi muntazam practice muhim.",
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    };
  }

  return {
    label: "Starting",
    description: "Learning track endi boshlandi, birinchi modullar ustida ishlang.",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
}

export interface CourseResource {
  title: string
  type: string
  href: string
}

export interface CourseVideoSource {
  label: string
  src: string
  mimeType?: string
  height?: number
}

export interface CourseCaptionTrack {
  label: string
  src: string
  srcLang: string
  default?: boolean
}

export interface CourseLesson {
  id: string
  title: string
  duration: string
  isFree: boolean
  summary: string
  resources: CourseResource[]
  videoUrl?: string
  videoMimeType?: string
  uploadFilePath?: string
  videoSources?: CourseVideoSource[]
  captionTracks?: CourseCaptionTrack[]
}

export interface CourseModule {
  id: string
  title: string
  description: string
  lessons: CourseLesson[]
}

export interface CourseReview {
  name: string
  role: string
  rating: number
  quote: string
}

export interface CourseSupportItem {
  title: string
  description: string
}

export interface CourseCertificateTemplate {
  title: string
  organizationName: string
  signatureName: string
  signatureTitle: string
  certificateBody: string
  accentColor: string
  sealText: string
}

export interface Course {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  duration: string
  pace: string
  level: string
  category: string
  language: string
  rating: number
  students: number
  instructor: string
  heroGradient: string
  cardImage?: string
  outcomes: string[]
  supportItems: CourseSupportItem[]
  reviews: CourseReview[]
  modules: CourseModule[]
  certificateTemplate?: CourseCertificateTemplate
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  rating: number
  inStock: boolean
  inventoryCount?: number | null
  isDigital?: boolean
  deliveryLabel?: string
  imageUrl?: string
  status?: "active" | "draft" | "archived" | "sold_out"
}

type LessonSeed = [string, string, string, boolean, string]

type LessonOverride = Partial<
  Pick<
    CourseLesson,
    | "resources"
    | "videoUrl"
    | "videoMimeType"
    | "uploadFilePath"
    | "videoSources"
    | "captionTracks"
  >
>

function resource(title: string, type: string): CourseResource {
  const normalizedType = type.trim().toLowerCase()
  const href =
    normalizedType === "worksheet"
      ? "/course-assets/common/practice-worksheet-template.md"
      : "/course-assets/common/lesson-notes-template.md"

  return { title, type, href }
}

function downloadableResource(title: string, type: string, href: string): CourseResource {
  return { title, type, href }
}

function lessonUploadSlot(courseId: string, lessonId: string) {
  const src = `/media/courses/${courseId}/${lessonId}.mp4`

  return {
    videoUrl: src,
    videoMimeType: "video/mp4",
    uploadFilePath: `public/media/courses/${courseId}/${lessonId}.mp4`,
    videoSources: [
      {
        label: "Source",
        src,
        mimeType: "video/mp4",
      },
    ],
  }
}

const lessonOverrides: Record<string, LessonOverride> = {
  "py-l1": {
    ...lessonUploadSlot("python-analytics-automation", "py-l1"),
    resources: [
      downloadableResource("Python environment checklist", "Guide", "/course-assets/python/python-environment-checklist.md"),
      downloadableResource("Starter script", "Python", "/course-assets/python/file-processing-starter.py"),
    ],
  },
  "py-l2": {
    ...lessonUploadSlot("python-analytics-automation", "py-l2"),
    resources: [
      downloadableResource("Customer orders JSON", "JSON", "/course-assets/python/customer-orders.json"),
      downloadableResource("File processing starter", "Python", "/course-assets/python/file-processing-starter.py"),
    ],
  },
  "py-l3": {
    ...lessonUploadSlot("python-analytics-automation", "py-l3"),
    resources: [
      downloadableResource("Reporting sample dataset", "CSV", "/course-assets/python/reporting-sample.csv"),
      downloadableResource("Import notes", "Guide", "/course-assets/python/python-environment-checklist.md"),
    ],
  },
  "py-l4": {
    ...lessonUploadSlot("python-analytics-automation", "py-l4"),
    resources: [
      downloadableResource("Cleaning workflow brief", "Guide", "/course-assets/python/batch-processing-plan.md"),
      downloadableResource("Reporting sample dataset", "CSV", "/course-assets/python/reporting-sample.csv"),
    ],
  },
  "py-l5": {
    ...lessonUploadSlot("python-analytics-automation", "py-l5"),
    resources: [
      downloadableResource("Batch processing plan", "Guide", "/course-assets/python/batch-processing-plan.md"),
      downloadableResource("Starter script", "Python", "/course-assets/python/file-processing-starter.py"),
    ],
  },
  "py-l6": {
    ...lessonUploadSlot("python-analytics-automation", "py-l6"),
    resources: [
      downloadableResource("Matplotlib charting brief", "Guide", "/course-assets/python/matplotlib-brief.md"),
      downloadableResource("Reporting sample dataset", "CSV", "/course-assets/python/reporting-sample.csv"),
    ],
  },
  "py-l7": {
    ...lessonUploadSlot("python-analytics-automation", "py-l7"),
    resources: [
      downloadableResource("Auto-report checklist", "Guide", "/course-assets/python/batch-processing-plan.md"),
      downloadableResource("Customer orders JSON", "JSON", "/course-assets/python/customer-orders.json"),
    ],
  },
  "py-l8": {
    ...lessonUploadSlot("python-analytics-automation", "py-l8"),
    resources: [
      downloadableResource("Portfolio submission brief", "Guide", "/course-assets/python/portfolio-submission-brief.md"),
      downloadableResource("Starter script", "Python", "/course-assets/python/file-processing-starter.py"),
    ],
  },
  "da-l1": {
    ...lessonUploadSlot("data-analytics-professional", "da-l1"),
    resources: [
      downloadableResource("Analysis brief template", "Guide", "/course-assets/data-analytics/analysis-brief-template.md"),
      downloadableResource("KPI tree template", "CSV", "/course-assets/data-analytics/kpi-tree-template.csv"),
    ],
  },
  "da-l2": {
    ...lessonUploadSlot("data-analytics-professional", "da-l2"),
    resources: [
      downloadableResource("Data quality checklist", "Guide", "/course-assets/data-analytics/data-quality-checklist.md"),
      downloadableResource("Customer segmentation sample", "CSV", "/course-assets/data-analytics/customer-segmentation-sample.csv"),
    ],
  },
  "da-l3": {
    ...lessonUploadSlot("data-analytics-professional", "da-l3"),
    resources: [
      downloadableResource("KPI tree template", "CSV", "/course-assets/data-analytics/kpi-tree-template.csv"),
      downloadableResource("Metric map", "Guide", "/course-assets/data-analytics/dashboard-metric-map.md"),
    ],
  },
  "da-l4": {
    ...lessonUploadSlot("data-analytics-professional", "da-l4"),
    resources: [
      downloadableResource("Segmentation sample", "CSV", "/course-assets/data-analytics/customer-segmentation-sample.csv"),
      downloadableResource("Analysis brief template", "Guide", "/course-assets/data-analytics/analysis-brief-template.md"),
    ],
  },
  "da-l5": {
    ...lessonUploadSlot("data-analytics-professional", "da-l5"),
    resources: [
      downloadableResource("Dashboard metric map", "Guide", "/course-assets/data-analytics/dashboard-metric-map.md"),
      downloadableResource("KPI tree template", "CSV", "/course-assets/data-analytics/kpi-tree-template.csv"),
    ],
  },
  "da-l6": {
    ...lessonUploadSlot("data-analytics-professional", "da-l6"),
    resources: [
      downloadableResource("Executive summary template", "Guide", "/course-assets/data-analytics/executive-summary-template.md"),
      downloadableResource("Recommendation checklist", "Guide", "/course-assets/data-analytics/recommendation-checklist.md"),
    ],
  },
  "da-l7": {
    ...lessonUploadSlot("data-analytics-professional", "da-l7"),
    resources: [
      downloadableResource("Portfolio case brief", "Guide", "/course-assets/data-analytics/portfolio-case-brief.md"),
      downloadableResource("Customer segmentation sample", "CSV", "/course-assets/data-analytics/customer-segmentation-sample.csv"),
    ],
  },
  "da-l8": {
    ...lessonUploadSlot("data-analytics-professional", "da-l8"),
    resources: [
      downloadableResource("Presentation roadmap", "Guide", "/course-assets/data-analytics/presentation-roadmap.md"),
      downloadableResource("Executive summary template", "Guide", "/course-assets/data-analytics/executive-summary-template.md"),
    ],
  },
}

function lessonsFromSeeds(seeds: LessonSeed[]) {
  return seeds.map(([id, title, duration, isFree, summary]) => {
    const override = lessonOverrides[id]

    return {
      id,
      title,
      duration,
      isFree,
      summary,
      resources:
        override?.resources ??
        [resource("Lesson notes", "PDF"), resource("Practice file", "Worksheet")],
      videoUrl: override?.videoUrl,
      videoMimeType: override?.videoMimeType,
      uploadFilePath: override?.uploadFilePath,
      videoSources: override?.videoSources,
      captionTracks: override?.captionTracks,
    }
  })
}

function moduleDefinition(
  id: string,
  title: string,
  description: string,
  seeds: LessonSeed[]
): CourseModule {
  return {
    id,
    title,
    description,
    lessons: lessonsFromSeeds(seeds),
  }
}

export const courses: Course[] = [
  {
    id: "python-analytics-automation",
    title: "Python: Analitika va Avtomatlashtirish",
    subtitle: "Python yordamida data workflow, fayl processing va reporting jarayonlarini avtomatlashtirish.",
    description:
      "Kurs Python'ni boshlang'ich sintaksisdan tortib, Excel, JSON va reporting pipeline'lariga tatbiq etishgacha olib boradi. Fokus nazariyada emas, real ish vazifalarini tezroq, toza va qayta ishlatiladigan skriptlar bilan bajarishda.",
    price: 690000,
    duration: "10 hafta",
    pace: "Haftasiga 5-7 soat",
    level: "Boshlang'ichdan o'rta",
    category: "Python",
    language: "O'zbek",
    rating: 4.9,
    students: 1840,
    instructor: "Mirshod Juraev",
    heroGradient: "from-blue-600 via-cyan-500 to-sky-400",
    outcomes: [
      "Python sintaksisi va amaliy data script'lar bilan erkin ishlaysiz",
      "Excel, CSV va JSON manbalari uchun processing flow qurasiz",
      "Pandas va Matplotlib bilan hisobotga tayyor natija chiqarasiz",
      "Portfolio uchun automation case yig'asiz",
    ],
    supportItems: [
      { title: "Structured video lessons", description: "Har modul amaliy vazifa va qayta ishlatiladigan pattern bilan yakunlanadi." },
      { title: "Practice-ready files", description: "Dataset va shablonlar dars bilan parallel ishlash uchun beriladi." },
      { title: "Mentor review", description: "Kod sifati va workflow logikasi bo'yicha yo'nalish olasiz." },
    ],
    reviews: [
      {
        name: "Dilnoza K.",
        role: "Finance intern",
        rating: 5,
        quote: "Python endi abstrakt til emas, real reporting va automation vositasi bo'lib ko'rina boshladi.",
      },
    ],
    modules: [
      moduleDefinition("py-m1", "Module 1: Python foundation", "Sintaksis, data structure va import jarayonlari.", [
        ["py-l1", "Python muhiti va sintaksis asoslari", "18:40", true, "Muhitni sozlash, o'zgaruvchi, shart operatorlari va loop'lar bilan mustahkam boshlang'ich quriladi."],
        ["py-l2", "List, dictionary va fayl oqimlari", "24:10", true, "Strukturalangan ma'lumot bilan ishlash, fayl o'qish va yozishning amaliy patternlari ko'rsatiladi."],
        ["py-l3", "Excel va JSON ma'lumotlarini o'qish", "27:35", true, "Excel va JSON manbalaridan ma'lumot olib, keyingi tahlilga tayyorlash usuli o'rgatiladi."],
        ["py-l4", "Pandas bilan cleaning pipeline", "31:15", false, "Duplicate, datatype va missing value muammolarini boshqaradigan toza pipeline yig'iladi."],
      ]),
      moduleDefinition("py-m2", "Module 2: Automation workflows", "Reporting va batch processing uchun amaliy flow.", [
        ["py-l5", "Ko'p faylli batch processing", "26:20", false, "Papka ichidagi bir nechta faylni bitta qoida bilan qayta ishlash ssenariysi ko'rsatiladi."],
        ["py-l6", "Matplotlib bilan executive chartlar", "22:55", false, "Rahbariyat o'qiy oladigan chart va annotation patternlari yig'iladi."],
        ["py-l7", "PDF va slide uchun auto-reporting", "28:10", false, "Natijalarni eksport qilish va hisobot oqimini yarim avtomatik holatga keltirish o'rgatiladi."],
        ["py-l8", "Final automation portfolio", "19:45", false, "Yakuniy loyiha documentation va portfolio formatida tugallanadi."],
      ]),
    ],
  },
  {
    id: "sql-querying-reporting",
    title: "SQL: Querying va Reporting",
    subtitle: "SELECT'dan boshlab, JOIN, CTE va management report darajasidagi query fikrlashigacha.",
    description:
      "SQL kursi ma'lumotni olish emas, to'g'ri savolni query ko'rinishida ifodalashni o'rgatadi. Siz relational fikrlash, aggregation, JOIN, CTE va reporting uchun kerak bo'ladigan query architecture bilan ishlaysiz.",
    price: 620000,
    duration: "8 hafta",
    pace: "Haftasiga 4-6 soat",
    level: "Boshlang'ich",
    category: "SQL",
    language: "O'zbek",
    rating: 4.9,
    students: 1670,
    instructor: "Mirshod Juraev",
    heroGradient: "from-indigo-600 via-blue-500 to-cyan-400",
    cardImage: "/media/courses/sql-querying-reporting/sql-querying-reporting-cover.png",
    outcomes: [
      "SELECT, WHERE, GROUP BY va JOIN operatorlarini ishonch bilan ishlatasiz",
      "Analitik savollarni SQL logikasiga to'g'ri tarjima qilasiz",
      "CTE va subquery bilan toza query structure qurasiz",
      "Portfolio uchun tayyor SQL case'ga ega bo'lasiz",
    ],
    supportItems: [
      { title: "Hands-on query practice", description: "Har mavzu mini-case va drill bilan mustahkamlanadi." },
      { title: "Business question mapping", description: "Savolni metric, dimension va filterlarga ajratish yondashuvi beriladi." },
      { title: "Interview-grade logic", description: "Query natijasini tekshirish va tushuntirish odati shakllanadi." },
    ],
    reviews: [
      {
        name: "Maftuna Y.",
        role: "Reporting specialist",
        rating: 5,
        quote: "JOIN va aggregation mavzulari birinchi marta mantiqiy va tizimli ko'rinishda ochildi.",
      },
    ],
    modules: [
      moduleDefinition("sql-m1", "Module 1: Core querying", "Asosiy operatorlar va relatsion fikrlash.", [
        ["sql-l1", "SELECT, WHERE va saralash mantiqi", "17:25", true, "Kerakli ustunni tanlash, filtrlash va natijani toza ko'rinishda olish usuli o'rgatiladi."],
        ["sql-l2", "GROUP BY va KPI hisoblash", "26:30", true, "Aggregation orqali oddiy metric va KPI'larni hisoblash amaliy ko'rsatiladi."],
        ["sql-l3", "JOIN bilan relatsion fikrlash", "29:05", true, "Jadval bog'lanishlari, cardinality va duplicate xavfini tushunish mashq qilinadi."],
        ["sql-l4", "Subquery va CTE architecture", "32:15", false, "Murakkab query'ni o'qilishi oson bo'lgan bloklarga ajratish yondashuvi beriladi."],
      ]),
      moduleDefinition("sql-m2", "Module 2: Analytical reporting", "Window functions, validation va portfolio case.", [
        ["sql-l5", "Window function va ranking", "30:40", false, "Ranking, running totals va comparison patternlari analitik misollarda ko'rsatiladi."],
        ["sql-l6", "Result validation va QA checks", "21:35", false, "So'rov natijasini tekshirish, edge case va metric consistency nazorati o'rgatiladi."],
        ["sql-l7", "Performance basics va indexing", "19:45", false, "Query sekinlashishi va optimallashtirish uchun boshlang'ich fikrlash beriladi."],
        ["sql-l8", "Final SQL portfolio case", "18:30", false, "Yakuniy case, query set va result narrative portfolio formatida yakunlanadi."],
      ]),
    ],
  },
  {
    id: "database-design-foundations",
    title: "Database Design Fundamentals",
    subtitle: "Entity, relationship va schema intizomi bilan barqaror database model qurishni o'rganing.",
    description:
      "Ko'pchilik SQL yozishni o'rganadi, ammo database dizaynni chuqur tushunmaydi. Bu kurs relation, key, normalization, schema naming va reporting'ga tayyor model qurishni amaliy case'lar asosida tushuntiradi.",
    price: 640000,
    duration: "8 hafta",
    pace: "Haftasiga 4-5 soat",
    level: "Boshlang'ichdan o'rta",
    category: "Database",
    language: "O'zbek",
    rating: 4.8,
    students: 1180,
    instructor: "Mirshod Juraev",
    heroGradient: "from-slate-800 via-slate-700 to-blue-600",
    cardImage: "/media/courses/database-design-foundations/database-design-fundamentals-cover.png",
    outcomes: [
      "ER diagram va relational schema tuzishni bilasiz",
      "Primary key, foreign key va integrity rule'larni to'g'ri qo'llaysiz",
      "Normalization va business logic orasidagi balansni tushunasiz",
      "SQLite yoki Postgres uchun ishchi schema yig'asiz",
    ],
    supportItems: [
      { title: "Architecture-first approach", description: "Har mavzu model va ma'lumot oqimidan boshlanadi." },
      { title: "Case-driven schema design", description: "Nazariy emas, product va reporting holatlariga yaqin case'lar ishlanadi." },
      { title: "Design review", description: "Naming, relation va jadval tuzilmasi bo'yicha feedback beriladi." },
    ],
    reviews: [
      {
        name: "Sabina F.",
        role: "Data ops assistant",
        rating: 5,
        quote: "Schema qanday o'ylanishi kerakligini tushunganimdan keyin SQL va BI ishlarim ham ancha soddalashdi.",
      },
    ],
    modules: [
      moduleDefinition("db-m1", "Module 1: Relational thinking", "Entity, attribute va relation tushunchalari.", [
        ["db-l1", "Entity-relationship fikrlashi", "16:55", true, "Biznes jarayonini jadval va relationlarga tarjima qilishning eng muhim asoslari beriladi."],
        ["db-l2", "Primary key, foreign key va constraints", "23:40", true, "Ma'lumotlar bog'lanishi va ishonchlilikni saqlovchi asosiy qoidalar ko'rsatiladi."],
        ["db-l3", "Normalization amaliyoti", "26:20", true, "1NF, 2NF va 3NF tushunchalari duplicate va anomaly misollarida ochiladi."],
        ["db-l4", "Transactional schema va audit fields", "28:10", false, "CRUD tizimlarida kerak bo'ladigan field va status mantiqi bilan ishlanadi."],
      ]),
      moduleDefinition("db-m2", "Module 2: Production-ready schema", "Naming, warehouse readiness va yakuniy loyiha.", [
        ["db-l5", "Naming conventions va documentation", "18:45", false, "Jamoa bilan ishlashga qulay schema naming va izohlash qoidalari beriladi."],
        ["db-l6", "Analitik modelga tayyorlash", "24:30", false, "Operational model'dan reporting layer'ga o'tishda kerak bo'ladigan o'zgarishlar tushuntiriladi."],
        ["db-l7", "DDL yozish va validation", "20:40", false, "CREATE TABLE, constraint va schema validation amaliyotda bajariladi."],
        ["db-l8", "Final architecture review", "17:30", false, "Yakuniy model relation, naming va reporting readiness bo'yicha yakunlanadi."],
      ]),
    ],
  },
  {
    id: "ai-for-analysts",
    title: "AI for Analysts & Knowledge Workers",
    subtitle: "Prompting, verification va research workflow orqali AI'dan foydali va xavfsiz foydalanish.",
    description:
      "Bu kurs generativ AI'ni shunchaki sinab ko'rish emas, balki ish unumdorligini oshirish vositasi sifatida ishlatishga qaratilgan. Siz prompt design, source evaluation, summary drafting va decision support uchun professional workflow yaratasiz.",
    price: 590000,
    duration: "6 hafta",
    pace: "Haftasiga 3-5 soat",
    level: "Barcha daraja",
    category: "AI",
    language: "O'zbek",
    rating: 4.8,
    students: 1520,
    instructor: "Nodirbek Khudoyorov",
    heroGradient: "from-fuchsia-600 via-violet-500 to-indigo-500",
    cardImage: "/images/courses/ai-for-analysts.jpg",
    outcomes: [
      "Prompt, context va output quality'ni boshqarasiz",
      "Summary, memo va research workflow'larini standartlashtirasiz",
      "AI natijalarini tekshirish va risklarni kamaytirish odatini shakllantirasiz",
      "Shaxsiy AI toolkit yaratib olasiz",
    ],
    supportItems: [
      { title: "Workflow-oriented curriculum", description: "Darslar kunlik knowledge work vazifalariga bog'lab beriladi." },
      { title: "Responsible AI mindset", description: "Verification, privacy va source discipline ichki qoidaga aylantiriladi." },
      { title: "Reusable prompt library", description: "Report, research va memo uchun tayyor framework'lar beriladi." },
    ],
    reviews: [
      {
        name: "Ozoda M.",
        role: "Strategy intern",
        rating: 5,
        quote: "AI'dan foyda olish va natijani tekshirish o'rtasidagi muvozanat juda to'g'ri qurilgan.",
      },
    ],
    modules: [
      moduleDefinition("ai-m1", "Module 1: Prompt discipline", "Prompt, context va quality control asosi.", [
        ["ai-l1", "Generativ AI qanday ishlaydi", "15:35", true, "Model javobi nimaga bog'liq ekanini va undan qayerda to'g'ri foydalanish mumkinligini tushunasiz."],
        ["ai-l2", "Prompt framework: role, context, output", "23:10", true, "Aniq vazifa qo'yish va javob formatini boshqarish uchun universal prompt structure beriladi."],
        ["ai-l3", "Verification va responsible use", "21:25", true, "AI xatolarini aniqlash, maxfiy ma'lumot va source discipline qoidalari mustahkamlanadi."],
        ["ai-l4", "Research brief va source synthesis", "27:40", false, "Bir nechta manbadan foydali summary va decision-ready brief tayyorlash workflow'i ko'rsatiladi."],
      ]),
      moduleDefinition("ai-m2", "Module 2: Workflows for reporting", "Meeting summary, memo va personal AI system.", [
        ["ai-l5", "Meeting summary va executive memo", "20:50", false, "Yig'ilish yozuvlarini qisqa, aniq va action-oriented memo'ga aylantirish usuli beriladi."],
        ["ai-l6", "Spreadsheet va report assistant workflow", "18:55", false, "Jadval, text draft va reporting vazifalarini tezlashtirishning xavfsiz patternlari ko'rsatiladi."],
        ["ai-l7", "Reusable prompt bank qurish", "17:40", false, "Takrorlanadigan vazifalar uchun shaxsiy prompt kutubxonasi va naming system tuziladi."],
        ["ai-l8", "Final productivity case", "16:50", false, "Real ish ssenariysi uchun AI workflow yig'ilib, samaradorlik mezonlari bilan yakunlanadi."],
      ]),
    ],
  },
  {
    id: "power-bi-decision-dashboards",
    title: "Power BI: Decision Dashboards",
    subtitle: "Rahbariyat o'qiy oladigan dashboard, DAX mantig'i va insight storytelling bir kursda.",
    description:
      "Power BI kursi data model, DAX, slicer logic va executive dashboard structure'ni bitta product sifatida tushuntiradi. Fokus chiroyli grafikda emas, qaror qabul qilishga xizmat qiladigan monitoring va storytelling'da.",
    price: 710000,
    duration: "9 hafta",
    pace: "Haftasiga 4-6 soat",
    level: "Boshlang'ichdan o'rta",
    category: "Power BI",
    language: "O'zbek",
    rating: 4.9,
    students: 1410,
    instructor: "Mirshod Juraev",
    heroGradient: "from-amber-500 via-orange-500 to-rose-500",
    outcomes: [
      "Power BI'da toza data model va relationship qurasiz",
      "DAX yordamida metric va KPI hisoblay olasiz",
      "Slicer, drill-down va navigation flow'ni boshqarasiz",
      "Portfolio uchun executive dashboard tayyorlaysiz",
    ],
    supportItems: [
      { title: "Executive dashboard logic", description: "Vizual ko'rinish emas, qaror uchun foydali layout markazga qo'yiladi." },
      { title: "Real KPI use-cases", description: "Monitoring, performance va risk kabi ko'rsatkichlar bilan ishlanadi." },
      { title: "Presentation-ready outputs", description: "Dashboard'ni stakeholder'ga sharhlash usuli ham o'rgatiladi." },
    ],
    reviews: [
      {
        name: "Sevara N.",
        role: "Business analyst",
        rating: 5,
        quote: "Power BI'ni tool emas, decision system sifatida ko'rishni shu kurs o'rgatdi.",
      },
    ],
    modules: [
      moduleDefinition("pbi-m1", "Module 1: Model and visuals", "Data loading, schema va layout poydevori.", [
        ["pbi-l1", "Power BI interfeysi va data loading", "17:20", true, "Ma'lumot yuklash, field panel va canvas bilan ishlash asoslari ko'rsatiladi."],
        ["pbi-l2", "Relationship va star schema", "25:45", true, "Fact, dimension va relation mantiqi bilan toza model yig'iladi."],
        ["pbi-l3", "Vizual hierarchy va layout", "21:15", true, "Rahbariyat uchun o'qilishi oson dashboard kompozitsiyasi tushuntiriladi."],
        ["pbi-l4", "DAX measure'lar bilan KPI hisoblash", "32:10", false, "Sum, ratio, variance va comparison measure'lari amaliy misollarda quriladi."],
      ]),
      moduleDefinition("pbi-m2", "Module 2: Interaction and storytelling", "Dashboard interaction va portfolio loyiha.", [
        ["pbi-l5", "Slicer, drill-down va navigation", "23:55", false, "Foydalanuvchi oqimini soddalashtiradigan interaction patternlari ko'rsatiladi."],
        ["pbi-l6", "KPI commentary va storylining", "20:35", false, "Dashboard faqat ko'rsatish emas, izohlash vositasi sifatida quriladi."],
        ["pbi-l7", "Risk va performance dashboard case", "27:25", false, "Monitoring ko'rsatkichlari asosida executive dashboard case yig'iladi."],
        ["pbi-l8", "Portfolio dashboard presentation", "16:30", false, "Yakuniy dashboard portfolio va demo formatida yakunlanadi."],
      ]),
    ],
  },
  {
    id: "data-analytics-professional",
    title: "Data Analytics Professional",
    subtitle: "Savoldan insight'gacha: KPI, analysis workflow, dashboard va executive summary bir oqimda.",
    description:
      "Kurs biznes savolini to'g'ri qo'yish, datasetni audit qilish, tahlil natijasini tushuntirish va stakeholder uchun foydali recommendation berish ko'nikmalarini birlashtiradi. Tool'lar emas, qaror uchun xizmat qiladigan analytics fikrlashi ustuvor.",
    price: 750000,
    duration: "12 hafta",
    pace: "Haftasiga 5-7 soat",
    level: "Boshlang'ichdan o'rta",
    category: "Data Analytics",
    language: "O'zbek",
    rating: 4.9,
    students: 1960,
    instructor: "Nodirbek Khudoyorov",
    heroGradient: "from-emerald-500 via-teal-500 to-cyan-500",
    cardImage: "/images/courses/data-analytics-professional.png",
    outcomes: [
      "Biznes savolini metric va analysis task'ga ajratasiz",
      "Dataset audit qilib, muammo va imkoniyatlarni topasiz",
      "Insight'ni dashboard va executive summary ko'rinishida berasiz",
      "Portfolio uchun to'liq analytics case yig'asiz",
    ],
    supportItems: [
      { title: "Business-first analytics", description: "Analytics qaror qabul qilishga xizmat qiladigan tizim sifatida o'rgatiladi." },
      { title: "Insight storytelling", description: "Natijani topish bilan birga uni tushuntirish va himoya qilish usullari beriladi." },
      { title: "Career-ready output", description: "Kurs yakunida portfolio yoki CV'da ko'rsatish mumkin bo'lgan case tayyor bo'ladi." },
    ],
    reviews: [
      {
        name: "Asal X.",
        role: "Junior analyst",
        rating: 5,
        quote: "Jadval ko'rishdan ko'ra, savol berish va insight aytish muhimligini aynan shu kurs tushuntirdi.",
      },
    ],
    modules: [
      moduleDefinition("da-m1", "Module 1: Analytics thinking", "Savol, metric va data quality poydevori.", [
        ["da-l1", "Business savolni analytics task'ga aylantirish", "18:15", true, "Rahbariyat savolini metric, dimension va tahlil maqsadiga tarjima qilish amaliyoti beriladi."],
        ["da-l2", "Dataset audit va quality checks", "24:35", true, "Missing value, duplicate va format muammolarini topish uchun audit yondashuvi o'rgatiladi."],
        ["da-l3", "Metric tree va KPI logic", "20:45", true, "Top-level maqsadni kuzatiladigan KPI'larga ajratish usuli ko'rsatiladi."],
        ["da-l4", "Segmentatsiya va taqqoslash tahlili", "28:00", false, "Mijoz, mahsulot yoki vaqt bo'yicha segmentatsiya qilib, farq va trend topish mashq qilinadi."],
      ]),
      moduleDefinition("da-m2", "Module 2: Insight communication", "Dashboard, summary va portfolio case.", [
        ["da-l5", "Dashboard uchun ko'rsatkich tanlash", "22:55", false, "Faqat qaror uchun foydali bo'lgan ko'rsatkichlarni ajratish mezonlari beriladi."],
        ["da-l6", "Insight summary va recommendation", "19:30", false, "Tahlil natijasidan qisqa, aniq va ishonchli executive summary yozish o'rgatiladi."],
        ["da-l7", "Portfolio-grade analytics case", "26:20", false, "Maqsad, data, tahlil va tavsiyani qamrab oluvchi capstone case tuziladi."],
        ["da-l8", "Presentation flow va next-step roadmap", "18:50", false, "Topilgan insight'ni himoya qilish va keyingi rivojlanish rejasini tuzish bilan kurs tugaydi."],
      ]),
    ],
  },
  {
    id: "data-science-foundations",
    title: "Data Science Foundations",
    subtitle: "Statistika, model thinking va amaliy ML pipeline'ni tushunarli formatda o'rganing.",
    description:
      "Data science ko'p hollarda murakkab formulalar to'plami sifatida ko'rinadi. Bu kurs esa uni tizimlashtiradi: muammoni formalizatsiya qilish, feature tanlash, modelni baholash va natijani biznes kontekstida talqin qilish ko'nikmalari Python bilan birga beriladi.",
    price: 820000,
    duration: "12 hafta",
    pace: "Haftasiga 6-8 soat",
    level: "O'rta",
    category: "Data Science",
    language: "O'zbek",
    rating: 4.8,
    students: 960,
    instructor: "Mirshod Juraev",
    heroGradient: "from-sky-600 via-indigo-600 to-violet-600",
    cardImage: "/images/courses/data-science.webp",
    outcomes: [
      "Statistik fikrlash va model intuition'ini shakllantirasiz",
      "Regression va classification masalalarini ajratasiz",
      "Feature engineering va evaluation mezonlarini tushunasiz",
      "Yakuniy mini-model case'ni portfolio ko'rinishida hujjatlashtirasiz",
    ],
    supportItems: [
      { title: "Math explained simply", description: "Murakkab formulalar intuitiv izoh va grafiklar bilan yengillashtiriladi." },
      { title: "Applied modeling", description: "Har model mavzusi real biznes savol bilan bog'lab beriladi." },
      { title: "Evaluation discipline", description: "Modelni tekshirish va noto'g'ri talqin qilmaslik odati quriladi." },
    ],
    reviews: [
      {
        name: "Kamola I.",
        role: "Data science trainee",
        rating: 5,
        quote: "Regression, classification va evaluation qismi chalkash emas, juda tizimli ko'rinishda berilgan.",
      },
    ],
    modules: [
      moduleDefinition("ds-m1", "Module 1: Statistical intuition", "Problem framing va asosiy statistik fikrlash.", [
        ["ds-l1", "Data science workflow va problem framing", "19:20", true, "Model qurishdan oldin biznes savolini target, feature va metric ko'rinishiga keltirish o'rgatiladi."],
        ["ds-l2", "Descriptive statistics va distribution", "25:10", true, "Mean, median, variance va distribution tushunchalari misollar orqali ochiladi."],
        ["ds-l3", "Correlation, causality va feature intuition", "23:30", true, "Bog'liqlik va sababiyatni aralashtirmaslik uchun zarur fikrlash modeli quriladi."],
        ["ds-l4", "Regression modeli bilan forecasting intuition", "31:00", false, "Continuous natija bashorat qilish uchun regression yondashuvi va xatolik manbalari ko'rib chiqiladi."],
      ]),
      moduleDefinition("ds-m2", "Module 2: Modeling and interpretation", "Classification, validation va capstone case.", [
        ["ds-l5", "Classification va threshold fikrlashi", "29:15", false, "Precision, recall va threshold trade-off'lari classification case'larida ko'rsatiladi."],
        ["ds-l6", "Train-test split va overfitting", "21:50", false, "Modelni ko'rinmagan data'da tekshirish, leakage va overfitting xavflari tushuntiriladi."],
        ["ds-l7", "Feature engineering basics", "20:35", false, "Categorical va numerical feature'larni modelga tayyorlash patternlari beriladi."],
        ["ds-l8", "Final model case va interpretation", "17:55", false, "Mini-model, natija talqini va decision memo bilan kurs yakunlanadi."],
      ]),
    ],
  },
  {
    id: "acca-ifrs-financial-reporting",
    title: "ACCA IFRS: Financial Accounting & Reporting",
    subtitle: "IFRS tamoyillari, moliyaviy hisobot strukturalari va risk-aware reporting'ni amaliy formatda o'rganing.",
    description:
      "Kurs ACCA mantiqi va IFRS asoslarini faqat imtihon nuqtai nazaridan emas, balki amaliy moliyaviy reporting vositasi sifatida tushuntiradi. Siz financial statements, adjustment, IFRS 9, 3-stage model va ECL logikasini tizimli ko'rinishda o'zlashtirasiz.",
    price: 890000,
    duration: "14 hafta",
    pace: "Haftasiga 6-8 soat",
    level: "O'rta",
    category: "Finance & IFRS",
    language: "O'zbek",
    rating: 5,
    students: 860,
    instructor: "Mirshod Juraev",
    heroGradient: "from-emerald-700 via-teal-600 to-cyan-500",
    outcomes: [
      "Financial statements tuzilmasi va reporting mantiqini tushunasiz",
      "Recognition, adjustment va disclosure masalalarini tahlil qilasiz",
      "IFRS 9, 3-stage model va ECL asoslarini amaliy ko'rinishda o'zlashtirasiz",
      "Moliyaviy va risk reporting uchun professional framework olasiz",
    ],
    supportItems: [
      { title: "Exam-to-practice bridge", description: "Standartlar real reporting va risk analysis kontekstida tushuntiriladi." },
      { title: "Structured statement analysis", description: "P&L, balance sheet va cash flow bir-biri bilan bog'lab beriladi." },
      { title: "Applied IFRS 9 block", description: "3-stage model, PD-LGD-EAD va ECL logikasi premium modul sifatida ochiladi." },
    ],
    reviews: [
      {
        name: "Umidjon S.",
        role: "Risk reporting officer",
        rating: 5,
        quote: "IFRS 9 va ECL bloki nazariy emas, real reporting mantig'i bilan berilgani uchun juda foydali bo'ldi.",
      },
    ],
    modules: [
      moduleDefinition("ifrs-m1", "Module 1: Financial reporting core", "Hisobot shakllari va adjustment poydevori.", [
        ["ifrs-l1", "Financial statements architecture", "21:45", true, "Asosiy moliyaviy hisobot shakllari va ularning o'zaro bog'lanishi bilan tanishasiz."],
        ["ifrs-l2", "Recognition, measurement va adjustment", "27:20", true, "Tranzaksiyani qachon tan olish va qayerda aks ettirish kerakligi tizimli tushuntiriladi."],
        ["ifrs-l3", "P&L, balance sheet va cash flow aloqasi", "24:55", true, "Uch asosiy hisobot o'rtasidagi oqim va tahliliy xulosa chiqarish mexanizmi ko'rsatiladi."],
        ["ifrs-l4", "Disclosure va ratio analysis", "20:40", false, "Note'lar, ratio'lar va moliyaviy holat talqini management nuqtai nazaridan ko'rib chiqiladi."],
      ]),
      moduleDefinition("ifrs-m2", "Module 2: IFRS 9 and risk-aware reporting", "ECL, 3-stage model va executive summary.", [
        ["ifrs-l5", "Management reporting va variance analysis", "22:10", false, "Rasmiy hisobotdan tashqari boshqaruv qarori uchun kerak bo'ladigan reporting oqimi yig'iladi."],
        ["ifrs-l6", "IFRS 9 va 3-stage model", "29:35", false, "Stage 1, 2 va 3 mantiqi, kredit sifati o'zgarishi va reserve logikasi ochiladi."],
        ["ifrs-l7", "PD, LGD, EAD va ECL", "31:20", false, "ECL hisoblashga olib boradigan risk komponentlari va ularning amaliy talqini beriladi."],
        ["ifrs-l8", "Final reporting case", "18:45", false, "Moliyaviy va risk ko'rsatkichlarini bitta executive summary'da birlashtirish bilan kurs yakunlanadi."],
      ]),
    ],
  },
]

export const products: Product[] = [
  {
    id: "ai-notes-pack",
    name: "AI Notes Pack",
    description: "Kurslar uchun tayyorlangan qisqa konspektlar va checklistlar to'plami.",
    price: 79000,
    category: "Resurs",
    rating: 4.8,
    inStock: true,
    inventoryCount: null,
    isDigital: true,
    deliveryLabel: "Instant digital access",
    imageUrl: "/images/courses/ai-for-analysts.jpg",
    status: "active",
  },
  {
    id: "mock-interview-kit",
    name: "Mock Interview Kit",
    description: "Texnik va soft skill intervyulari uchun savol-javob jamlanmasi.",
    price: 119000,
    category: "Career",
    rating: 4.9,
    inStock: true,
    inventoryCount: null,
    isDigital: true,
    deliveryLabel: "Interview pack PDF",
    imageUrl: "/images/courses/data-analytics-professional.png",
    status: "active",
  },
  {
    id: "student-planner",
    name: "Student Planner",
    description: "Haftalik reja, goal tracker va odatlar monitoringi uchun planner.",
    price: 49000,
    category: "Planner",
    rating: 4.6,
    inStock: true,
    inventoryCount: 42,
    isDigital: false,
    deliveryLabel: "Print-ready planner",
    status: "active",
  },
  {
    id: "premium-template-bundle",
    name: "Premium Template Bundle",
    description: "Portfolio, CV va taqdimot uchun tayyor template'lar paketi.",
    price: 149000,
    category: "Template",
    rating: 4.7,
    inStock: false,
    inventoryCount: 0,
    isDigital: true,
    deliveryLabel: "Digital bundle",
    status: "sold_out",
  },
]

export function getCourseById(id: string) {
  return courses.find((course) => course.id === id)
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id)
}

export function getCourseLessonCount(course: Course) {
  return course.modules.reduce((sum, module) => sum + module.lessons.length, 0)
}

export function getCourseResourceCount(course: Course) {
  return course.modules.reduce(
    (sum, module) => sum + module.lessons.reduce((lessonSum, lesson) => lessonSum + lesson.resources.length, 0),
    0
  )
}

export function getCoursePreviewLessons(course: Course) {
  return course.modules.flatMap((module) =>
    module.lessons.filter((lesson) => lesson.isFree)
  )
}

export function getCourseLessonById(course: Course, lessonId: string) {
  return course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === lessonId)
}

export function isCourseLessonFree(course: Course, lessonId: string) {
  return Boolean(getCourseLessonById(course, lessonId)?.isFree)
}

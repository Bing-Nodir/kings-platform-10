export interface HomeStat {
  label: string;
  value: string;
}

export interface HomeEcosystemCard {
  title: string;
  description: string;
  href: string;
  iconKey: string;
}

export interface AboutPillar {
  title: string;
  description: string;
  iconKey: string;
  accentClass: string;
}

export interface BusinessPlan {
  name: string;
  price: string;
  priceNote: string;
  color: string;
  badge: string | null;
  features: string[];
  cta: string;
  ctaStyle: string;
}

export interface BusinessBenefit {
  title: string;
  desc: string;
  color: string;
  bg: string;
  iconKey: string;
  metric: string | null;
}

export interface BusinessTestimonial {
  name: string;
  role: string;
  quote: string;
  stars: number;
  avatar: string;
}

export interface BusinessWorkflowStep {
  step: string;
  title: string;
  desc: string;
  iconKey: string;
}

export interface FaqEntry {
  category: string;
  question: string;
  answer: string;
}

export const homeStats: HomeStat[] = [
  { label: "Faol O'quvchilar", value: "10,000+" },
  { label: "Flagship Kurslar", value: "8+" },
  { label: "Core Mentorlar", value: "4" },
];

export const homeEcosystemCards: HomeEcosystemCard[] = [
  {
    title: "Biz haqimizda",
    description: "Jamoa, learning model va platforma yondashuvini ko'ring.",
    href: "/about",
    iconKey: "Sparkles",
  },
  {
    title: "Subscription",
    description:
      "Bepul preview, pro access va offline formatlar orasidan mos modelni tanlang.",
    href: "/subscription",
    iconKey: "Users2",
  },
  {
    title: "Korporativ ta'lim",
    description:
      "Jamoangizni professional darajaga yetkazing. Analytics, AI Mentor va guruh sertifikatlari.",
    href: "/business",
    iconKey: "Building2",
  },
  {
    title: "Ofislar xaritasi",
    description:
      "Kampuslar, QR attendance va oflayn workshop nuqtalarini xaritada ko'ring.",
    href: "/offices",
    iconKey: "MapPinned",
  },
  {
    title: "Reyting jadvali",
    description:
      "O'rganish vaqti, quiz natijalari va streak bo'yicha top o'quvchilarni ko'ring.",
    href: "/leaderboard",
    iconKey: "Trophy",
  },
];

export const aboutPillars: AboutPillar[] = [
  {
    title: "O'quvchi markazidagi product",
    description:
      "Kurs tanlash, to'lov qilish, darsni davom ettirish va progressni kuzatish bir xil product flow ichida ishlaydi.",
    iconKey: "Users2",
    accentClass: "text-blue-600",
  },
  {
    title: "O2O learning model",
    description:
      "Onlayn darslar va oflayn kampus touchpointlari birga ishlaydi: QR attendance, mentor uchrashuvlari va workshop formatlari bilan.",
    iconKey: "Building2",
    accentClass: "text-fuchsia-600",
  },
  {
    title: "AI + mentor support",
    description:
      "AI Mentor 24/7 yordam beradi, mentor esa roadmap, review va final natija uchun yo'naltiradi.",
    iconKey: "Sparkles",
    accentClass: "text-emerald-600",
  },
];

export const businessPlans: BusinessPlan[] = [
  {
    name: "Starter",
    price: "1.2M",
    priceNote: "/ 5 ta ish'chi / oy",
    color: "border-gray-200 dark:border-gray-700",
    badge: null,
    features: [
      "5 ta xodim uchun ruxsat",
      "Barcha kurs katalogiga kirish",
      "Progress monitoring",
      "Email qo'llab-quvvatlash",
      "Guruh sertifikatlari",
    ],
    cta: "Boshlash",
    ctaStyle:
      "border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900",
  },
  {
    name: "Business",
    price: "3.5M",
    priceNote: "/ 15 ta xodim / oy",
    color: "border-blue-500 shadow-blue-100 dark:shadow-blue-900/20",
    badge: "Eng mashhur",
    features: [
      "15 ta xodim uchun ruxsat",
      "Barcha kurslar va yangi yangilanishlar",
      "Progress va analytics dashboard",
      "Prioritet qo'llab-quvvatlash",
      "Guruh sertifikatlari",
      "AI Mentor access",
      "Korporativ hisobotlar",
    ],
    cta: "Boshlash",
    ctaStyle: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg",
  },
  {
    name: "Enterprise",
    price: "Kelishiladi",
    priceNote: "/ cheksiz xodimlar",
    color: "border-purple-200 dark:border-purple-800",
    badge: null,
    features: [
      "Cheksiz xodimlar",
      "Maxsus kurs yaratish",
      "API integratsiya",
      "Dedicated account manager",
      "Offline trening imkoniyati",
      "SLA kafolati",
      "Maxsus brending",
    ],
    cta: "Murojaat qiling",
    ctaStyle:
      "border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-950/30",
  },
];

export const businessBenefits: BusinessBenefit[] = [
  {
    title: "Real-time analytics",
    desc: "Har bir xodimning o'quv progressi, vaqti va quiz natijalarini real vaqtda kuzating.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    iconKey: "BarChart3",
    metric: null,
  },
  {
    title: "Professional kurslar",
    desc: "Python, SQL, Power BI, AI, Data Analytics, ACCA IFRS va boshqa eng so'ralgan yo'nalishlar.",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconKey: "BookOpen",
    metric: "courses_count",
  },
  {
    title: "Sertifikatlar",
    desc: "Har bir tugallangan kurs uchun rasmiy sertifikat, LinkedIn profiliga ham qo'shish mumkin.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    iconKey: "GraduationCap",
    metric: null,
  },
  {
    title: "AI Mentor 24/7",
    desc: "Har bir xodim shaxsiy AI mentor oqimi bilan murakkab savollarni tez hal qilishi mumkin.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    iconKey: "Zap",
    metric: null,
  },
  {
    title: "3 til qo'llab-quvvatlanadi",
    desc: "O'zbek, rus va ingliz tillarida, har bir xodim o'z tilida o'rganadi.",
    color: "text-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    iconKey: "Globe",
    metric: null,
  },
  {
    title: "Ma'lumotlar xavfsizligi",
    desc: "Supabase va RLS orqali ma'lumotlaringiz himoyalangan, access qatlamlari audit qilinadi.",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    iconKey: "Shield",
    metric: null,
  },
];

export const businessTestimonials: BusinessTestimonial[] = [
  {
    name: "Aziz Karimov",
    role: "CTO, TechSolutions Tashkent",
    quote:
      "Kings Education bilan 12 ta data analyst xodimimizni 3 oy ichida professional darajaga yetkazdik. ROI ajoyib bo'ldi.",
    stars: 5,
    avatar: "AK",
  },
  {
    name: "Nilufar Rashidova",
    role: "HR Director, Uzum Market",
    quote:
      "Analytics dashboard orqali har bir xodimning progressini kuzatish biznes qarorlarini ancha tezlashtirdi.",
    stars: 5,
    avatar: "NR",
  },
  {
    name: "Jasur Toshmatov",
    role: "CEO, FinTech Group",
    quote:
      "ACCA IFRS kursi bizning moliya jamoamizga katta qiymat qo'shdi. Platforma qulay, professional va amaliy.",
    stars: 5,
    avatar: "JT",
  },
];

export const businessWorkflowSteps: BusinessWorkflowStep[] = [
  {
    step: "01",
    title: "Xodimlarni qo'shing",
    desc: "Jamoa a'zolarini email orqali taklif qiling, ular darhol platformaga kiradi.",
    iconKey: "Users",
  },
  {
    step: "02",
    title: "Kurslarni belgilang",
    desc: "Har bir xodim yoki jamoa uchun tegishli kurslarni tanlang va belgilang.",
    iconKey: "BookOpen",
  },
  {
    step: "03",
    title: "Natijalarni kuzating",
    desc: "Analytics dashboardda har bir xodimning progressi va quiz natijalarini real vaqtda ko'ring.",
    iconKey: "BarChart3",
  },
];

export const faqEntries: FaqEntry[] = [
  {
    category: "Kurslar va o'qish",
    question: "Kurslar qancha vaqt davom etadi?",
    answer:
      "Kurslar yo'nalishiga qarab 12 dan 20 haftaga qadar. Har bir modulni o'z vaqtida tugatish majburiy emas, siz o'z tempingizda o'rganishingiz mumkin. Video darslar 24/7 mavjud.",
  },
  {
    category: "Kurslar va o'qish",
    question: "Bitta kursda nechta dars bo'ladi?",
    answer:
      "Har bir flagship kurs 8-12 ta moduldan va jami 60-120 ta video darsdan iborat. Har modul oxirida amaliy topshiriq va quiz mavjud.",
  },
  {
    category: "Kurslar va o'qish",
    question: "Preview darslar nima?",
    answer:
      "Har bir kursning dastlabki 3 ta darsi bepul preview sifatida ochiq. Sotib olishdan oldin kurs formatini, mentor uslubini va materiallar sifatini sinab ko'rishingiz mumkin.",
  },
  {
    category: "Kurslar va o'qish",
    question: "Kurslar o'zbek yoki rus tilida ekanmi?",
    answer:
      "Barcha asosiy kurslar o'zbek tilida olib boriladi. Materiallarda terminlar uchun inglizcha ekvivalentlar ham beriladi. Ba'zi qo'shimcha resurslar rus va ingliz tilida ham mavjud.",
  },
  {
    category: "Kurslar va o'qish",
    question: "Kursni tugatish uchun minimum talab bormi?",
    answer:
      "Rasmiy sertifikat olish uchun kurs progressi kamida 80% bo'lishi va yakuniy quizdan 70% dan yuqori ball to'planishi kerak. Lekin kursni o'zlashtirish uchun shaxsiy tempingizda o'rganishingiz mumkin.",
  },
  {
    category: "To'lov va obuna",
    question: "To'lovni qanday amalga oshiraman?",
    answer:
      "To'lov karta, Payme yoki Click orqali boshlanadi. Kurs sahifasida 'Sotib olish' tugmasini bosib, checkout sahifasidan usulni tanlaysiz. Access provider tasdig'i yoki webhook callbackdan keyin faollashadi.",
  },
  {
    category: "To'lov va obuna",
    question: "Kursni qaytarib bersa bo'ladimi?",
    answer:
      "Sotib olingan kundan 3 kun ichida texnik muammo yoki sifat bilan bog'liq asosli sabab bo'lsa, to'lov qaytarilishi ko'rib chiqiladi. Batafsil ma'lumot uchun ommaviy oferta shartlariga qarang.",
  },
  {
    category: "To'lov va obuna",
    question: "Korporativ yoki guruh narxlari bormi?",
    answer:
      "Ha. 5 va undan ortiq xodim uchun maxsus korporativ paketlar mavjud. Korporativ ta'lim sahifasiga o'ting yoki info@kings.uz ga yozing, individual offer tayyorlaymiz.",
  },
  {
    category: "To'lov va obuna",
    question: "Subscription va bir martalik to'lov farqi nima?",
    answer:
      "Hozirda har bir kurs alohida sotib olinadi. Tasdiqlangan bir martalik to'lov shu kursga uzoq muddatli access beradi. Korporativ formatlar uchun esa custom plan va alohida billing oqimi taklif etiladi.",
  },
  {
    category: "AI Mentor va platforma",
    question: "AI Mentor qanday ishlaydi?",
    answer:
      "AI Mentor Claude (Anthropic) texnologiyasi asosida ishlaydi. U kurs kontekstini biladi va savollaringizga aniq, professional javob beradi. Suhbat tarixi saqlanadi va har dars sessiyasida davom ettirishingiz mumkin.",
  },
  {
    category: "AI Mentor va platforma",
    question: "AI Mentor barcha kurslarda mavjudmi?",
    answer:
      "Ha, AI Mentor barcha sotib olingan kurslarda mavjud. Watch sahifasida mentor bo'limiga o'tib savollaringizni to'g'ridan-to'g'ri berishingiz mumkin. Bepul preview rejimida AI Mentor cheklangan.",
  },
  {
    category: "AI Mentor va platforma",
    question: "Quiz va testlar nima uchun kerak?",
    answer:
      "Har modul oxiridagi quiz bilimni mustahkamlash va zaif joylarni aniqlash uchun kerak. Natijalari profil sahifangizda saqlanadi va reyting ballingizga ta'sir qiladi. Quizdan o'tish sertifikat olish shartlaridan biri hisoblanadi.",
  },
  {
    category: "AI Mentor va platforma",
    question: "Dashboard va progress qanday kuzatiladi?",
    answer:
      "Dashboard sahifangizda o'rganish vaqti, streak, tugatilgan kurslar, quiz natijalari va sertifikatlar real vaqtga yaqin ko'rinishda aks etadi. Har bir dars ko'rilganda progress yangilanadi.",
  },
  {
    category: "Sertifikat va yutuqlar",
    question: "Sertifikat beriladi?",
    answer:
      "Ha, kursni muvaffaqiyatli tugatganingizdan so'ng siz rasmiy Kings Education sertifikatini olasiz. Sertifikat platformada ko'rinadi va email orqali ham yuborilishi mumkin. Uni LinkedIn profilingizga joylashtirish mumkin.",
  },
  {
    category: "Sertifikat va yutuqlar",
    question: "Sertifikat qanchalik ishonchli?",
    answer:
      "Kings Education sertifikatlari O'zbekistonning yetakchi moliya va texnologiya kompaniyalarida tan olinishi uchun amaliy ko'nikmalar asosida tuzilgan. Har bir sertifikat unikal ID va verification havolasiga ega.",
  },
  {
    category: "Oflayn va kampus",
    question: "Oflayn markazlarga qanday kiraman?",
    answer:
      "Dashboard sahifangizdan QR attendance pass yaratasiz. Markazga kelganda QR kodni ko'rsatasiz va davomat avtomatik qayd etiladi. Hozir Toshkent va Samarqand shahridagi ofislar faol.",
  },
  {
    category: "Oflayn va kampus",
    question: "Oflayn darslar bormi?",
    answer:
      "Ha, haftalik guruh sessiyalari va weekend bootcamp formatlari ofislarimizda o'tkaziladi. Jadvallar davriy ravishda yangilanadi. Batafsil ma'lumot uchun contact sahifasiga o'ting.",
  },
];

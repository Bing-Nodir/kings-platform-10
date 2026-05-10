export interface OfficeLocation {
  name: string;
  city: string;
  address: string;
  hours: string;
  phone: string;
  description: string;
  mapQuery: string;
}

export interface SubscriptionPlan {
  name: string;
  price: string;
  description: string;
  accent: string;
  features: string[];
  ctaLabel: string;
  href: string;
}

export interface MentorProfile {
  name: string;
  role: string;
  expertise: string[];
  bio: string;
}

export const companyContact = {
  email: "info@kings.uz",
  phoneDisplay: "+998 33 806 45 45",
  phoneHref: "tel:+998338064545",
} as const;

export const companyStats = [
  { label: "Flagship kurslar", value: "8+" },
  { label: "Core mentorlar", value: "4" },
  { label: "Preview darslar", value: "24+" },
  { label: "Filiallar", value: "3" },
];

export const officeLocations: OfficeLocation[] = [
  {
    name: "Kings Education HQ",
    city: "Toshkent",
    address: "Mirzo Ulug'bek tumani, Mustaqillik ko'chasi 75",
    hours: "Dush-Shan: 09:00-21:00 | Yak: 10:00-18:00",
    phone: "+998 33 806 45 45",
    description:
      "Asosiy kampus: mentorlar bilan uchrashuv, workshoplar va QR attendance shu yerda ishlaydi. 3 ta o'quv xona, 1 ta media studiya.",
    mapQuery: "Tashkent Mirzo Ulugbek district Mustaqillik",
  },
  {
    name: "Kings Education - Yunusobod",
    city: "Toshkent",
    address: "Yunusobod tumani, Amir Temur shoh ko'chasi 108A",
    hours: "Dush-Juma: 10:00-20:00 | Shan: 10:00-17:00",
    phone: "+998 33 123 45 67",
    description:
      "Yunusobod filiali: Data Analytics va Power BI yo'nalishlari bo'yicha haftalik guruhlar va weekend bootcamp formatlari.",
    mapQuery: "Tashkent Yunusobod Amir Temur",
  },
  {
    name: "Kings Education - Samarqand",
    city: "Samarqand",
    address: "Registon ko'chasi 14, 2-qavat",
    hours: "Dush-Shan: 09:00-20:00",
    phone: "+998 91 234 56 78",
    description:
      "Samarqand shahridagi birinchi filial: Python, SQL va Data Science bootcamplari. Oflayn guruhlar uchun maxsus narxlar.",
    mapQuery: "Samarkand Registon street",
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: "Starter",
    price: "Bepul",
    description:
      "Kurs katalogi, birinchi 3 ta preview dars va learning roadmap bilan tanishish uchun.",
    accent: "from-slate-900 to-slate-700",
    features: [
      "Barcha kurslarni ko'rish",
      "Har kursdagi 3 ta bepul preview dars",
      "Roadmap va yo'nalish tavsiyalari",
    ],
    ctaLabel: "Kurslarni ko'rish",
    href: "/courses",
  },
  {
    name: "Pro Learning",
    price: "590,000 UZS dan",
    description:
      "To'liq kurs access, AI Mentor, checkout va dashboard flow bilan.",
    accent: "from-blue-600 via-cyan-500 to-sky-500",
    features: [
      "To'liq video darslar",
      "AI Mentor va resurslar",
      "Dashboard, progress va sertifikat",
    ],
    ctaLabel: "Pro access olish",
    href: "/checkout?type=course&id=data-analytics-professional",
  },
  {
    name: "Team / Offline",
    price: "Custom",
    description:
      "Offline guruhlar, korporativ trening va kampus asosidagi learning formatlari.",
    accent: "from-fuchsia-600 via-violet-500 to-indigo-500",
    features: [
      "Offline attendance va QR kirish",
      "Custom mentor support",
      "Jamoa uchun moslashtirilgan plan",
    ],
    ctaLabel: "Bog'lanish",
    href: "/contact",
  },
];

export const mentorProfiles: MentorProfile[] = [
  {
    name: "Mirshod Juraev",
    role: "Operational Risk, IFRS va Data Systems Mentor",
    expertise: [
      "Python automation",
      "SQL va database",
      "Power BI",
      "IFRS 9 va ECL",
      "Risk analytics",
    ],
    bio: "TuronBank operatsion risk yo'nalishida ishlaydi. Python, SQL, Power BI va IFRS 9 asosidagi risk-modellarni amaliy case'lar bilan tushuntiradi. 5+ yil amaliy tajriba va 300+ o'quvchi.",
  },
  {
    name: "Nodirbek Khudoyorov",
    role: "Finance, Reporting va Strategy Mentor",
    expertise: [
      "Financial analysis",
      "Management reporting",
      "Banking va audit fundamentals",
      "Strategic communication",
      "Project leadership",
    ],
    bio: "Aspire Leaders Program ishtirokchisi va TSUE Banking and Audit yo'nalishi talabasidir. Financial analysis, reporting intizomi va qaror qabul qilishga xizmat qiladigan business thinking bo'yicha mentorlik qiladi.",
  },
  {
    name: "Dilnoza Yusupova",
    role: "Data Science va Machine Learning Mentor",
    expertise: [
      "Machine learning",
      "Scikit-learn va Pandas",
      "Data visualization",
      "Statistical analysis",
      "Feature engineering",
    ],
    bio: "INHA University data science xodimi. Scikit-learn, Pandas va real dataset'lar asosida ML modellarini qurishni amaliy loyihalar orqali o'rgatadi. Google Data Analytics sertifikati egasi.",
  },
  {
    name: "Sherzod Nazarov",
    role: "Database Architecture va Backend Mentor",
    expertise: [
      "PostgreSQL va indexing",
      "Database design",
      "Query optimization",
      "Redis va caching",
      "API architecture",
    ],
    bio: "7+ yillik backend tajribaga ega arxitektor. PostgreSQL, database normalization, query optimization va production-grade backend sistemalarni loyihalashni o'rgatadi.",
  },
];

import { User, Bell, Shield, CreditCard, Palette } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const settingsFeatures = [
  {
    Icon: User,
    name: "Shaxsiy ma'lumotlar",
    description: "Ismingiz, rasmingiz va aloqa ma'lumotlaringizni tahrirlash.",
    href: "/settings/profile",
    cta: "Tahrirlash",
    background: <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-60 dark:from-blue-900/20" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Shield,
    name: "Xavfsizlik va Parol",
    description: "Hisobingizni ikki bosqichli autentifikatsiya va yangi parol bilan himoyalang.",
    href: "/settings/security",
    cta: "Himoyalash",
    background: <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-60 dark:from-emerald-900/20" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Palette,
    name: "Tashqi ko'rinish",
    description: "Sayt mavzusi, qorong'i/yorug' rejim va interfeys tillarini sozlang.",
    href: "/settings/appearance",
    cta: "Sozlash",
    background: <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-60 dark:from-purple-900/20" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: CreditCard,
    name: "To'lovlar va Obunalar",
    description: "Karta ma'lumotlari, tranzaksiyalar tarixi va faol obunalarni boshqaring.",
    href: "/settings/billing",
    cta: "Boshqarish",
    background: <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-60 dark:from-amber-900/20" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Bell,
    name: "Xabarnomalar",
    description: "Qaysi turdagi xabarlarni email, SMS yoki platforma ichida olishni tanlang.",
    href: "/settings/notifications",
    cta: "Sozlash",
    background: <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-60 dark:from-rose-900/20" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-black">
      <Navbar />
      <main className="relative flex-1 container mx-auto px-4 py-12 md:py-20 md:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400 mb-2">
            Profilni boshqarish
          </p>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Sozlamalar
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Platformadagi shaxsiy profilingiz, xavfsizlik va obunalaringizni shu yerdan to'liq boshqaring.
          </p>
        </div>
        
        <BentoGrid className="lg:grid-rows-3 max-w-6xl mx-auto">
          {settingsFeatures.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </main>
      <Footer />
    </div>
  );
}
import Link from "next/link";
import { ChevronDown, HelpCircle, MessageSquare, Phone } from "lucide-react";
import Footer from "@/components/Footer";

const faqCategories = [
  {
    category: "Kurslar va o'qish",
    items: [
      {
        q: "Kurslar qancha vaqt davom etadi?",
        a: "Kurslar yo'nalishiga qarab 12 dan 20 haftaga qadar. Har bir modulni o'z vaqtida tugatish majburiy emas — siz o'z tempingizda o'rganishingiz mumkin. Video darslar 24/7 mavjud.",
      },
      {
        q: "Bitta kursda nechta dars bo'ladi?",
        a: "Har bir flagship kurs 8–12 ta moduldan va jami 60–120 ta video darsdan iborat. Har modul oxirida amaliy topshiriq va quiz mavjud.",
      },
      {
        q: "Preview darslar nima?",
        a: "Har bir kursning dastlabki 3 ta darsi bepul preview sifatida ochiq. Sotib olishdan oldin kurs formatini, mentor uslubini va materiallar sifatini sinab ko'rishingiz mumkin.",
      },
      {
        q: "Kurslar o'zbek yoki rus tilida ekanmi?",
        a: "Barcha asosiy kurslar o'zbek tilida olib boriladi. Materiallarda terminlar uchun inglizcha ekvivalentlar ham beriladi. Ba'zi qo'shimcha resurslar rus va ingliz tilida ham mavjud.",
      },
      {
        q: "Kursni tugatish uchun minimum talab bormi?",
        a: "Rasmiy sertifikat olish uchun kurs progressi kamida 80% bo'lishi va yakuniy quizdan 70%+ ball to'plashingiz kerak. Lekin kursni o'zlashtirish uchun shaxsiy tempingizda o'rganishingiz mumkin.",
      },
    ],
  },
  {
    category: "To'lov va obuna",
    items: [
      {
        q: "To'lovni qanday amalga oshiraman?",
        a: "To'lov Payme yoki Click orqali amalga oshiriladi. Kurs sahifasida 'Sotib olish' tugmasini bosib, checkout sahifasidan to'lov usulini tanlaysiz. Bir martalik to'lov — abadiy access.",
      },
      {
        q: "Kursni qaytarib bersa bo'ladimi?",
        a: "Sotib olingan kundan 3 kun ichida texnik muammo yoki sifat bilan bog'liq asosli sabab bo'lsa, to'lov qaytarilishi ko'rib chiqiladi. Batafsil ma'lumot uchun ommaviy oferta shartlariga qarang.",
      },
      {
        q: "Korporativ yoki guruh narxlari bormi?",
        a: "Ha. 5 va undan ortiq xodim uchun maxsus korporativ paketlar mavjud. Korporativ ta'lim sahifasiga o'ting yoki info@kings.uz ga yozing — individual offer tayyorlaymiz.",
      },
      {
        q: "Subscription va bir martalik to'lov farqi nima?",
        a: "Hozirda har bir kurs alohida sotib olinadi (one-time payment). Korsni sotib olish — shu kursga umrbod access demak. Korporativ formatlar uchun custom plan taklif etiladi.",
      },
    ],
  },
  {
    category: "AI Mentor va platforma",
    items: [
      {
        q: "AI Mentor qanday ishlaydi?",
        a: "AI Mentor Claude (Anthropic) texnologiyasi asosida ishlaydi. U kurs kontekstini biladi va sizning savollaringizga aniq, professional javob beradi. Suhbat tarixi saqlanadi — har dars sessiyasida davom ettirishingiz mumkin.",
      },
      {
        q: "AI Mentor barcha kurslarda mavjudmi?",
        a: "Ha, AI Mentor barcha sotib olingan kurslarda mavjud. Watch sahifasida 'Mentor' tabiga o'ting va to'g'ridan-to'g'ri savollaringizni bering. Bepul preview rejimida AI Mentor cheklangan.",
      },
      {
        q: "Quiz va testlar nima uchun kerak?",
        a: "Har modul oxiridagi quiz bilimni mustahkamlash va zaifliklari aniqlash uchun. Natijalari profil sahifangizda saqlanadi va reyting ballingizga ta'sir qiladi. Quizdan o'tish — sertifikat olish sharti.",
      },
      {
        q: "Dashboard va progress qanday kuzatiladi?",
        a: "Dashboard sahifangizda o'rganish vaqti, streak, tugatilgan kurslar, quiz natijalari va sertifikatlar real vaqtda ko'rsatiladi. Har bir dars ko'rilganda progress avtomatik yangilanadi.",
      },
    ],
  },
  {
    category: "Sertifikat va yutuqlar",
    items: [
      {
        q: "Sertifikat beriladi?",
        a: "Ha, kursni muvaffaqiyatli tugatganingizdan so'ng siz rasmiy Kings Education sertifikatini olasiz. Sertifikat to'g'ridan-to'g'ri platformada va email orqali yuboriladi. LinkedIn profilingizga ham joylashtirishingiz mumkin.",
      },
      {
        q: "Sertifikat qanchalik ishonchli?",
        a: "Kings Education sertifikatlari O'zbekistonning yetakchi moliya va texnologiya kompaniyalarida tan olinadi. Har bir sertifikat unikal ID va verification havolasiga ega.",
      },
    ],
  },
  {
    category: "Oflayn va kampus",
    items: [
      {
        q: "Oflayn markazlarga qanday kiraman?",
        a: "Dashboard sahifangizdan QR attendance pass yaratasiz. Markazga kelganda QR kodni ko'rsatasiz — davomat avtomatik qayd etiladi. Hozir Toshkent (2 ta filial) va Samarqand shahridagi ofislar faol.",
      },
      {
        q: "Oflayn darslar bormi?",
        a: "Ha, haftalik gruppa sessiyalari va weekend bootcamp formatlari ofislarimizda o'tkaziladi. Jadvallar har oyda yangilanib boradi. Batafsil ma'lumot uchun contact sahifasiga o'ting.",
      },
    ],
  },
];

export default function FaqPage() {
  const totalQuestions = faqCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-950">
        <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/30">
              <HelpCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Ko&apos;p so&apos;raladigan savollar
            </h1>
            <p className="mt-3 text-gray-500 dark:text-gray-400">
              {totalQuestions} ta savol va javob — kategoriyalar bo&apos;yicha
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((cat) => (
              <div key={cat.category}>
                <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                  {cat.category}
                </h2>
                <div className="space-y-2">
                  {cat.items.map((faq) => (
                    <details
                      key={faq.q}
                      className="group rounded-2xl border border-gray-100 bg-white shadow-sm transition-all open:shadow-md dark:border-gray-800 dark:bg-gray-950"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        <span>{faq.q}</span>
                        <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="border-t border-gray-50 px-6 pb-5 pt-4 text-sm leading-7 text-gray-600 dark:border-gray-800 dark:text-gray-400">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 dark:from-blue-950/30 dark:to-indigo-950/20">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Javob topa olmadingizmi?
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Jamoamiz 24 soat ichida javob beradi.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <MessageSquare className="h-4 w-4" /> Xabar yuborish
              </Link>
              <a
                href="tel:+998338064545"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                <Phone className="h-4 w-4" /> +998 33 806 45 45
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

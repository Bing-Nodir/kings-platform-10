import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Yuridik hujjat
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Maxfiylik siyosati
              </h1>
            </div>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-600 dark:prose-invert dark:text-gray-400">
            <p>So'nggi yangilanish: 2026-yil 1-mart</p>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                1. Umumiy ma'lumot
              </h2>
              <p>
                Kings Education platformasi (bundan keyin &quot;Platforma&quot;)
                foydalanuvchilarning shaxsiy ma'lumotlarini himoya qilishga
                majburdir. Ushbu siyosat Platformadan foydalanish jarayonida
                to'planadigan ma'lumotlar va ulardan foydalanish tartibi haqida
                ma'lumot beradi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                2. To'planadigan ma'lumotlar
              </h2>
              <p>Biz quyidagi ma'lumotlarni to'playmiz:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Ism va familiya</li>
                <li>Email manzil</li>
                <li>Telefon raqami (ixtiyoriy)</li>
                <li>O'quv faoliyati va progress ma'lumotlari</li>
                <li>To'lov tarixi (karta raqami saqlanmaydi)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                3. Ma'lumotlardan foydalanish
              </h2>
              <p>
                To'plangan ma'lumotlar faqat quyidagi maqsadlarda ishlatiladi:
                xizmatlarni taqdim etish, shaxsiy o'quv yo'lini shakllantirish,
                texnik yordam ko'rsatish va platforma xavfsizligini ta'minlash.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                4. Uchinchi shaxslarga uzatish
              </h2>
              <p>
                Foydalanuvchi ma'lumotlari to'lov protsessorlari (Payme, Click)
                va bulut xizmatlari (Supabase) bilan almashiladi. Bu xizmatlar
                o'zlarining maxfiylik siyosatiga rioya qiladi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                5. Bog'lanish
              </h2>
              <p>
                Savollar uchun:{" "}
                <a
                  href="mailto:privacy@kings.uz"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  privacy@kings.uz
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

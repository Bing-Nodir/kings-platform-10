import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-gray-50 dark:bg-black">
        <div className="container mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/30">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Yuridik hujjat
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Ommaviy ofera
              </h1>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            <p>So'nggi yangilanish: 2026-yil 1-mart</p>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                1. Umumiy shartlar
              </h2>
              <p>
                Ushbu ommaviy ofera Kings Education MChJ (bundan keyin
                &quot;Kompaniya&quot;) va Platforma foydalanuvchisi (bundan keyin
                &quot;Foydalanuvchi&quot;) o'rtasidagi shartnoma hisoblanadi.
                Platformadan foydalanish ushbu shartlarni qabul qilishni anglatadi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                2. Xizmatlar
              </h2>
              <p>Kompaniya quyidagi xizmatlarni taqdim etadi:</p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Online ta'lim kurslari va darsliklar</li>
                <li>AI-asosidagi shaxsiy mentor xizmati</li>
                <li>Raqamli ta'lim materiallari va templatelar</li>
                <li>Oflayn ta'lim markazlariga kirish</li>
                <li>Davomat va sertifikatlash tizimi</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                3. To'lov va narxlar
              </h2>
              <p>
                Barcha narxlar O'zbekiston so'mida ko'rsatiladi. To'lov Payme
                yoki Click orqali amalga oshiriladi. Kurs sotib olingandan so'ng
                3 kun ichida asosli sababsiz qaytarish amalga oshirilmaydi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                4. Foydalanuvchi majburiyatlari
              </h2>
              <p>
                Foydalanuvchi kurs materiallarini uchinchi shaxslarga
                tarqatmaydi, ularga to'lovni amalga oshirmaydi va intellektual
                mulkni buzuvchi harakatlardan o'zini tiyadi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                5. Nizolarni hal etish
              </h2>
              <p>
                Nizolar O'zbekiston Respublikasining amaldagi qonunchiligiga
                muvofiq hal etiladi. Bog'lanish:{" "}
                <a
                  href="mailto:legal@kings.uz"
                  className="text-purple-600 hover:underline dark:text-purple-400"
                >
                  legal@kings.uz
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

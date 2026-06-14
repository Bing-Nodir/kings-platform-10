"use client";

import { Phone } from "lucide-react";
import { CtaCard } from "@/components/ui/call-to-action-cta";

interface VintageBusinessCtaProps {
  contactEmail: string;
  phoneDisplay: string;
  phoneHref: string;
}

export default function VintageBusinessCta({
  contactEmail,
  phoneDisplay,
  phoneHref,
}: VintageBusinessCtaProps) {
  const handleEmail = (email: string) => {
    const subject = encodeURIComponent("Kings Business tariflari bo'yicha kelishuv");
    const body = encodeURIComponent(
      `Assalomu alaykum.\n\nMen instructor yoki korporativ hamkor sifatida Kings Business tariflari bo'yicha kelishmoqchiman.\nBog'lanish emailim: ${email}\n\nIltimos, narx va hamkorlik shartlari haqida ma'lumot yuboring.`
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="theme-only-vintage bg-[#080604] px-4 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <CtaCard
          buttonText="Email yuborish"
          className="border-amber-200/15 shadow-[0_34px_110px_rgba(0,0,0,0.5)]"
          description="Instructorlar va korporativ jamoalar narx, ulush, kurs hajmi va dashboard shartlarini Kings bilan bevosita kelishib olishi mumkin."
          imageSrc="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=1600"
          inputPlaceholder="Email manzilingiz"
          onButtonClick={handleEmail}
          title="Narx va hamkorlik shartlarini kelishib oling"
        />
        <div className="mt-5 flex justify-center">
          <a
            className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-100/10 px-5 py-3 text-sm font-bold text-amber-100 transition hover:bg-amber-100/15"
            href={phoneHref}
          >
            <Phone className="h-4 w-4" />
            Telefon orqali: {phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}

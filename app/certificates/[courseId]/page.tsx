import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Trophy } from "lucide-react";
import CertificateDownloadButton from "@/components/CertificateDownloadButton";
import { getOrCreateCourseCertificate } from "@/lib/server/certificates";
import { createClient } from "@/utils/supabase/server";

interface CertificatePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/certificates/${courseId}`);
  }

  const result = await getOrCreateCourseCertificate(user.id, courseId, supabase);

  if (result.status === "not_found") {
    redirect("/dashboard");
  }

  if (result.status === "not_completed") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-100 bg-white p-8 shadow-sm">
          <Trophy className="h-10 w-10 text-amber-500" />
          <h1 className="mt-5 text-3xl font-black">Sertifikat hali tayyor emas</h1>
          <p className="mt-3 text-slate-600">
            {result.courseTitle} kursi uchun progress {result.progressPercent}%.
            Sertifikat olish uchun kursni 100% yakunlang.
          </p>
          <Link
            href={`/courses/${courseId}/watch`}
            className="mt-6 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white"
          >
            Darsga qaytish
          </Link>
        </div>
      </main>
    );
  }

  if (result.status === "backend_missing") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-100 bg-white p-8 shadow-sm">
          <ShieldCheck className="h-10 w-10 text-amber-500" />
          <h1 className="mt-5 text-3xl font-black">Certificate backend kerak</h1>
          <p className="mt-3 leading-7 text-slate-600">{result.message}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white"
          >
            Dashboardga qaytish
          </Link>
        </div>
      </main>
    );
  }

  const { certificate } = result;
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-4 py-8 text-slate-950 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: landscape; margin: 12mm; }
          body { background: #ffffff !important; }
        }
      `}</style>
      <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between gap-4 print:hidden">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-emerald-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <CertificateDownloadButton />
      </div>

      <section className="mx-auto max-w-6xl rounded-[1.5rem] border border-emerald-900/20 bg-white p-8 shadow-2xl shadow-emerald-950/10 print:rounded-none print:border-0 print:p-8 print:shadow-none">
        <div
          className="rounded-[1rem] border-[10px] p-10 text-center"
          style={{ borderColor: certificate.template.accentColor }}
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-900/20 bg-emerald-50">
            <Trophy className="h-9 w-9 text-emerald-900" />
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.35em] text-slate-500">
            {certificate.template.organizationName}
          </p>
          <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-950">
            {certificate.template.title}
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-600">
            This certifies that
          </p>
          <p className="mt-4 font-serif text-6xl italic text-emerald-950">
            {certificate.studentName}
          </p>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-600">
            {certificate.template.certificateBody}
          </p>
          <h2 className="mx-auto mt-6 max-w-4xl text-3xl font-black text-slate-950">
            {certificate.courseTitle}
          </h2>

          <div className="mt-14 grid gap-8 text-left md:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Berilgan sana
              </p>
              <p className="mt-2 text-lg font-black">{issuedDate}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-900 text-center text-xs font-black uppercase tracking-[0.12em] text-emerald-950">
                {certificate.template.sealText}
              </div>
            </div>
            <div className="text-right">
              <div className="ml-auto h-px w-48 bg-slate-300" />
              <p className="mt-3 text-lg font-black">
                {certificate.instructorName}
              </p>
              <p className="text-sm text-slate-500">
                {certificate.template.signatureTitle}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Certificate No: {certificate.certificateNo ?? "Pending"}</span>
            <span>Verify: {certificate.verificationCode ?? "Pending"}</span>
          </div>
        </div>
      </section>
    </main>
  );
}

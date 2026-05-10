import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import { getSubscriptionPlansData } from "@/lib/content-store";

export const revalidate = 300;

export default async function SubscriptionPage() {
  const subscriptionPlans = await getSubscriptionPlansData();

  return (
    <>
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_40%,#f8fafc_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#020617_45%,#000000_100%)]">
        <section className="border-b border-gray-200/70 dark:border-gray-800">
          <div className="container mx-auto px-4 py-16 text-center md:px-8 md:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
              <Sparkles className="h-4 w-4" /> Subscription & access
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black tracking-tight text-gray-950 dark:text-white md:text-6xl">
              O&apos;zingizga mos access modelini tanlang
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
              Bepul ko&apos;rishdan boshlab, to&apos;liq Pro access va offline planlargacha bo&apos;lgan variantlar bir joyda.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:px-8 md:py-16">
          <div className="grid gap-6 xl:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
              >
                <div className={`bg-gradient-to-br ${plan.accent} p-8 text-white`}>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
                    {plan.name}
                  </p>
                  <p className="mt-5 text-4xl font-black">{plan.price}</p>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    {plan.description}
                  </p>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        <span className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
                  >
                    {plan.ctaLabel}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import CpuArchitecture from "@/components/ui/cpu-architecture";

export default function RoadmapSection() {
  return (
    <section className="cv-auto group relative overflow-hidden border-t border-gray-200 bg-gray-50/50 py-16 dark:border-gray-800 dark:bg-black md:py-20">
      {/* Orqa fon nur effekti */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px] transition-all duration-700 group-hover:h-[500px] group-hover:w-[750px] group-hover:bg-blue-500/20 group-hover:blur-[150px] dark:bg-purple-600/10 dark:group-hover:bg-cyan-500/20" />
      
      <div className="container relative z-10 mx-auto px-4 md:px-8">
        <div className="mb-12 text-center md:mb-14">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Kings Ekotizimi
          </h2>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            Dasturlashdan tortib oflayn markazlargacha bo&apos;lgan barcha imkoniyatlar yagona markazda
          </p>
        </div>
        <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-white/70 bg-white/50 p-3 shadow-[0_40px_120px_-70px_rgba(37,99,235,0.35)] backdrop-blur-sm transition-all duration-500 group-hover:border-blue-400/50 group-hover:shadow-[0_0_80px_-15px_rgba(37,99,235,0.4)] dark:border-white/10 dark:bg-white/[0.03] dark:group-hover:border-cyan-400/50 dark:group-hover:shadow-[0_0_100px_-20px_rgba(6,182,212,0.4)] md:p-6">
          <div className="mx-auto w-full max-w-5xl aspect-[200/105]">
            <CpuArchitecture />
          </div>
        </div>
      </div>
    </section>
  );
}

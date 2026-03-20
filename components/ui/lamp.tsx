"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ParticleEffect } from "@/components/ui/particle-effect";

interface LampDemoProps {
  stats?: { label: string; value: string }[];
  title?: string;
  description?: string;
}

export function LampDemo({
  stats,
  title = "Kelajak kasblarini biz bilan o'rganing",
  description = "Markaziy Osiyodagi birinchi AI bilan integratsiyalashgan ta'lim va oflayn-krossover (O2O) platformasi. Dasturlashdan tortib oflayn markazlargacha bo'lgan barcha imkoniyatlar yagona markazda.",
}: LampDemoProps) {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
          duration: 1.2,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-600 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1.2, ease: "easeInOut" }}
        className="mt-4 max-w-2xl text-center text-base leading-relaxed text-gray-400 md:text-lg"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2, ease: "easeInOut" }}
        className="pointer-events-auto relative z-[80] mt-8 flex flex-col gap-4 sm:flex-row"
      >
        <Link
          href="/courses"
          aria-label="Kurslar sahifasini ochish"
          className="relative z-[100] inline-flex h-14 items-center justify-center gap-2 rounded-full bg-cyan-600 px-8 text-base font-semibold text-white shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] transition-all hover:bg-cyan-500 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)] active:scale-95 cursor-pointer"
        >
          Kurslarni ko&apos;rish
        </Link>
        <Link
          href="/shop"
          aria-label="Marketplace sahifasini ochish"
          className="relative z-[100] inline-flex h-14 items-center justify-center gap-2 rounded-full border border-gray-700 bg-gray-900/50 px-8 text-base font-medium text-gray-300 backdrop-blur-sm transition-all hover:bg-gray-800 hover:text-white active:scale-95 cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          Marketplace
        </Link>
      </motion.div>

      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="pointer-events-auto relative z-50 mt-12 grid grid-cols-3 gap-4 sm:gap-8 border-t border-white/10 pt-8 text-center"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1 sm:space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </LampContainer>
  );
}

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative z-0 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black",
        className
      )}
    >
      <div className="absolute inset-0 z-10 pointer-events-none">
        <ParticleEffect />
      </div>
      <div className="pointer-events-none relative z-10 flex w-full flex-1 scale-y-125 items-center justify-center isolate">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute bottom-0 left-0 z-20 h-40 w-[100%] bg-black [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-[100%] w-40 bg-black [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 text-white [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute bottom-0 right-0 z-20 h-[100%] w-40 bg-black [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 z-20 h-40 w-[100%] bg-black [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-black blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl"></div>
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-400 blur-2xl"
        ></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-400 "
        ></motion.div>

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-black "></div>
      </div>

      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};

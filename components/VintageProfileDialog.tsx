"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { logout } from "@/app/auth/actions";
import { TiltCard } from "@/components/ui/tilt-card";

interface VintageProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string | null;
  isAdminAccount?: boolean;
}

function initialsFromEmail(email?: string | null) {
  if (!email) {
    return "K";
  }

  return email.slice(0, 1).toUpperCase();
}

export default function VintageProfileDialog({
  isOpen,
  onClose,
  email,
  isAdminAccount = false,
}: VintageProfileDialogProps) {
  const isAuthenticated = Boolean(email);
  const profileHref = isAdminAccount ? "/admin/users" : "/profile";
  const dashboardHref = isAdminAccount ? "/admin" : "/dashboard";
  const settingsHref = isAdminAccount ? "/admin/settings" : "/settings";

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/25 p-4 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[420px]"
            role="dialog"
            aria-modal="true"
            aria-label={isAuthenticated ? "Profil markazi" : "Kings hisobingiz"}
          >
            <TiltCard
              effect="gravitate"
              perspective={1400}
              scale={1.025}
              spotlight
              tiltLimit={9}
              className="group relative rounded-[2rem] border border-amber-200/20 bg-[#14100a]/95 p-6 text-amber-50 shadow-[0_34px_100px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
            >
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[2rem] border border-amber-200/35"
                initial={{ opacity: 0.65, scale: 0.985 }}
                animate={{ opacity: [0.65, 0, 0.55, 0], scale: [0.985, 1.035, 0.992, 1.055] }}
                transition={{ duration: 1.35, ease: "easeOut", times: [0, 0.45, 0.52, 1] }}
              />
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-2 rounded-[1.7rem] border border-teal-200/20"
                initial={{ opacity: 0.55, scale: 0.99 }}
                animate={{ opacity: [0.55, 0, 0.42, 0], scale: [0.99, 1.045, 0.998, 1.06] }}
                transition={{ duration: 1.45, delay: 0.12, ease: "easeOut", times: [0, 0.43, 0.52, 1] }}
              />
              <span className="pointer-events-none absolute inset-3 rounded-[1.55rem] border border-amber-200/10 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_0%,transparent_37%,rgba(255,255,255,0.12)_48%,transparent_60%,transparent_100%)]" />
              <span className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.24),transparent_34%),radial-gradient(circle_at_95%_25%,rgba(20,184,166,0.15),transparent_30%)]" />

              <button
                aria-label="Profil oynasini yopish"
                className="absolute right-4 top-4 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-amber-50/75 transition hover:bg-white/10 hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative z-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Vintage profile
                </div>

                <div className="mt-7 flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-amber-200/25 bg-gradient-to-br from-amber-200 via-stone-100 to-teal-200 text-2xl font-black text-[#171008] shadow-[0_14px_40px_rgba(245,158,11,0.22)]">
                    {initialsFromEmail(email)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">
                      {isAuthenticated ? "Profil markazi" : "Kings hisobingiz"}
                    </h2>
                    <p className="mt-1 max-w-[260px] text-sm leading-6 text-amber-50/60">
                      {isAuthenticated
                        ? "O'qish holati, sozlamalar va profil sahifangizga tezkor kirish."
                        : "Kurslar, xaridlar va shaxsiy kabinetni davom ettirish uchun tizimga kiring."}
                    </p>
                  </div>
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-amber-100/50">
                            Hisob
                          </p>
                          <p className="mt-1 break-all text-sm font-semibold text-amber-50">
                            {email}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full border border-teal-300/25 bg-teal-300/10 px-2.5 py-1 text-xs font-bold text-teal-100">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {isAdminAccount ? "Admin" : "Student"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={profileHref}
                      onClick={onClose}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-black text-[#171008] transition hover:bg-white"
                    >
                      <User className="h-4 w-4" />
                      Profil holatiga kirish
                    </Link>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Link
                        href={dashboardHref}
                        onClick={onClose}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-amber-50 transition hover:bg-white/10"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Kabinet
                      </Link>
                      <Link
                        href={settingsHref}
                        onClick={onClose}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-amber-50 transition hover:bg-white/10"
                      >
                        <Settings className="h-4 w-4" />
                        Sozlamalar
                      </Link>
                      <form action={logout} className="col-span-2">
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-400/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Chiqish
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="mt-7 grid gap-3">
                    <Link
                      href="/login"
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 py-3 text-sm font-black text-[#171008] transition hover:bg-white"
                    >
                      <LogIn className="h-4 w-4" />
                      Kirish
                    </Link>
                    <Link
                      href="/register"
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-amber-50 transition hover:bg-white/10"
                    >
                      <User className="h-4 w-4" />
                      Ro'yxatdan o'tish
                    </Link>
                  </div>
                )}
              </div>
            </TiltCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

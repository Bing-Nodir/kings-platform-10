"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { logout } from "@/app/auth/actions";
import { isPrimaryAdminEmail } from "@/lib/admin-access";
import { createClient } from "@/utils/supabase/client";

interface NavbarAuthControlsProps {
  mobile?: boolean;
}

export default function NavbarAuthControls({
  mobile = false,
}: NavbarAuthControlsProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdminAccount = isPrimaryAdminEmail(user?.email);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    void (async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (isActive) {
        setUser(currentUser);
        setLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isActive) {
        return;
      }

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  if (mobile) {
    if (loading) {
      return (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg">
          <User className="h-4 w-4 opacity-50" />
        </div>
      );
    }

    if (!user) {
      return (
        <Link
          href="/login"
          aria-label="Kirish"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
        >
          <User className="h-4 w-4" />
        </Link>
      );
    }

    return (
      <>
        <Link
          href={isAdminAccount ? "/admin" : "/profile"}
          aria-label={isAdminAccount ? "Admin panel" : "Profil"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
        >
          {isAdminAccount ? (
            <LayoutDashboard className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50/90 text-red-600 shadow-lg backdrop-blur-lg transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            aria-label="Chiqish"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/shop"
          aria-label="Marketplace"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
        >
          <ShoppingCart className="h-4 w-4" />
        </Link>
        <div className="h-10 w-28 rounded-full border border-border bg-background/80 shadow-lg backdrop-blur-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/shop"
        aria-label="Marketplace"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
      >
        <ShoppingCart className="h-4 w-4" />
      </Link>

      {user ? (
        <div className="flex items-center gap-2">
          <Link
            href={isAdminAccount ? "/admin" : "/dashboard"}
            aria-label={isAdminAccount ? "Admin panel" : "Dashboard"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          <Link
            href={isAdminAccount ? "/admin/users" : "/profile"}
            aria-label="Profil"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            href={isAdminAccount ? "/admin/settings" : "/settings"}
            aria-label="Sozlamalar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/90 px-4 py-2 text-sm font-medium text-red-600 shadow-lg backdrop-blur-lg transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden xl:inline">Chiqish</span>
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          <User className="h-4 w-4" /> Kirish
        </Link>
      )}
    </div>
  );
}

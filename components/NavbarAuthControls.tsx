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
import VintageProfileDialog from "@/components/VintageProfileDialog";
import { isPrimaryAdminEmail } from "@/lib/admin-access";
import {
  THEME_EVENT,
  getStoredThemePreference,
  resolveThemePreference,
} from "@/lib/theme";
import { createClient } from "@/utils/supabase/client";

interface NavbarAuthControlsProps {
  mobile?: boolean;
}

function isVintageThemeSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return resolveThemePreference(getStoredThemePreference()) === "vintage";
}

function useIsVintageTheme() {
  const [isVintageTheme, setIsVintageTheme] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => setIsVintageTheme(isVintageThemeSnapshot());

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(THEME_EVENT, syncTheme);
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(THEME_EVENT, syncTheme);
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, []);

  return isVintageTheme;
}

export default function NavbarAuthControls({
  mobile = false,
}: NavbarAuthControlsProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const isVintageTheme = useIsVintageTheme();
  const isAdminAccount = isPrimaryAdminEmail(user?.email);
  const profileDialog = (
    <VintageProfileDialog
      email={user?.email}
      isAdminAccount={isAdminAccount}
      isOpen={profileDialogOpen}
      onClose={() => setProfileDialogOpen(false)}
    />
  );

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
      if (isVintageTheme) {
        return (
          <>
            <button
              type="button"
              onClick={() => setProfileDialogOpen(true)}
              aria-label="Kirish"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
            >
              <User className="h-4 w-4" />
            </button>
            {profileDialog}
          </>
        );
      }

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
        {isVintageTheme ? (
          <button
            type="button"
            onClick={() => setProfileDialogOpen(true)}
            aria-label={isAdminAccount ? "Admin paneli" : "Profil"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
          >
            {isAdminAccount ? (
              <LayoutDashboard className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </button>
        ) : (
          <Link
            href={isAdminAccount ? "/admin" : "/profile"}
            aria-label={isAdminAccount ? "Admin paneli" : "Profil"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
          >
            {isAdminAccount ? (
              <LayoutDashboard className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Link>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50/90 text-red-600 shadow-lg backdrop-blur-lg transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
            aria-label="Chiqish"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
        {profileDialog}
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/shop"
          aria-label="Do'kon"
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
        aria-label="Do'kon"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
      >
        <ShoppingCart className="h-4 w-4" />
      </Link>

      {user ? (
        <div className="flex items-center gap-2">
          <Link
            href={isAdminAccount ? "/admin" : "/dashboard"}
            aria-label={isAdminAccount ? "Admin paneli" : "Boshqaruv paneli"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Link>
          {isVintageTheme ? (
            <button
              type="button"
              onClick={() => setProfileDialogOpen(true)}
              aria-label="Profil"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
            >
              <User className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={isAdminAccount ? "/admin/users" : "/profile"}
              aria-label="Profil"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
            >
              <User className="h-4 w-4" />
            </Link>
          )}
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
      ) : isVintageTheme ? (
        <button
          type="button"
          onClick={() => setProfileDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          <User className="h-4 w-4" /> Kirish
        </button>
      ) : (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          <User className="h-4 w-4" /> Kirish
        </Link>
      )}
      {profileDialog}
    </div>
  );
}

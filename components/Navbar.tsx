import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import NavbarRail from "@/components/NavbarRail";
import NavbarAuthControls from "@/components/NavbarAuthControls";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getSiteContent } from "@/lib/site-content";

export default async function Navbar() {
  const siteContent = await getSiteContent();

  const navItems = [
    { name: "Bosh sahifa", url: "/", icon: "home" as const },
    { name: "Kurslar", url: "/courses", icon: "courses" as const },
    { name: "Do'kon", url: "/shop", icon: "shop" as const },
    { name: "Biznes", url: "/business", icon: "business" as const },
    { name: "Haqimizda", url: "/about", icon: "about" as const },
    { name: "Ofislar", url: "/offices", icon: "offices" as const },
  ];

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 hidden sm:block">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 pt-5 md:px-8">
          <Link
            href="/"
            className="pointer-events-auto inline-flex shrink-0 items-center"
            aria-label="Kings Education bosh sahifasi"
          >
            <span className="text-2xl font-extrabold tracking-tighter text-black drop-shadow-sm dark:text-white">
              Kings<span className="text-blue-600">.</span>
            </span>
          </Link>

          <NavbarRail
            items={navItems}
            className="pointer-events-auto hidden lg:block lg:static lg:left-auto lg:top-auto lg:bottom-auto lg:mb-0 lg:translate-x-0 lg:transform-none lg:pt-0"
          />

          <div className="pointer-events-auto flex items-center gap-2">
            <LanguageSwitcher compact />
            <form action="/search" className="relative hidden xl:flex">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                name="q"
                aria-label="Sayt bo'ylab qidiruv"
                placeholder={siteContent.navbarSearchPlaceholder}
                className="h-10 w-64 rounded-full border border-border bg-background/80 pl-10 pr-12 text-sm outline-none transition-colors focus:border-primary backdrop-blur-lg"
              />
              <button
                type="submit"
                aria-label="Qidirish"
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:opacity-90"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            <Link
              href="/search"
              aria-label="Qidirish"
              className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </Link>

            <NavbarAuthControls />
          </div>
        </div>
      </div>

      <div className="fixed left-4 top-4 z-50 sm:hidden">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="Kings Education bosh sahifasi"
        >
          <span className="text-2xl font-extrabold tracking-tighter text-black drop-shadow-sm dark:text-white">
            Kings<span className="text-blue-600">.</span>
          </span>
        </Link>
      </div>

      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 sm:hidden">
        <LanguageSwitcher compact />
        <Link
          href="/shop"
          aria-label="Marketplace"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
        >
          <ShoppingCart className="h-4 w-4" />
        </Link>
        <Link
          href="/search"
          aria-label="Qidirish"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-lg backdrop-blur-lg transition-colors hover:text-primary"
        >
          <Search className="h-4 w-4" />
        </Link>
        <NavbarAuthControls mobile />
      </div>

      <NavbarRail items={navItems} className="sm:hidden" />

      <div className="h-20 sm:h-24" />
    </>
  );
}

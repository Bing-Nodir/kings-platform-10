import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NavbarConditional from "@/components/NavbarConditional";
import ThemeToggle from "@/components/ThemeToggle";
import ResilientBoundary from "@/components/ResilientBoundary";
import { LanguageProvider } from "@/components/LanguageProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { LAST_DARK_THEME_STORAGE_KEY, THEME_STORAGE_KEY } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Kings Education",
  description: "AI bilan boshqariladigan ta'lim platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var root=document.documentElement;var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'midnight';var resolved='midnight';if(t==='vintage'){resolved='vintage';}else if(t==='midnight'){resolved='midnight';localStorage.setItem('${LAST_DARK_THEME_STORAGE_KEY}','midnight');}else if(t==='dark'){resolved='dark';localStorage.setItem('${LAST_DARK_THEME_STORAGE_KEY}','dark');}else if(t==='light'){resolved='light';}else if(t==='system'){resolved=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}root.classList.toggle('dark',resolved!=='light');root.dataset.theme=resolved;}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <WishlistProvider>
            <NavbarConditional>
              <Navbar />
            </NavbarConditional>
            <ResilientBoundary label="Asosiy platforma moduli">
              <div className="pb-24 sm:pb-0">{children}</div>
            </ResilientBoundary>
            <ThemeToggle />
          </WishlistProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

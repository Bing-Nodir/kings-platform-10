import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NavbarConditional from "@/components/NavbarConditional";
import ThemeToggle from "@/components/ThemeToggle";
import { LanguageProvider } from "@/components/LanguageProvider";
import { WishlistProvider } from "@/components/WishlistProvider";

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
        {/* Dark mode init: prevents flash of wrong theme on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <WishlistProvider>
            <NavbarConditional>
              <Navbar />
            </NavbarConditional>
            <div className="pb-24 sm:pb-0">{children}</div>
            <ThemeToggle />
          </WishlistProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

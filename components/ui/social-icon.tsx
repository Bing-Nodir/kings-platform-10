import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Facebook, Linkedin } from "lucide-react";

// Minimal, repo ichida chizilgan belgi. Tashqi SVG nusxasiga tayanmaydi.
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="kings-google-ring" x1="4" y1="4" x2="20" y2="20">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.33" stopColor="#34A853" />
          <stop offset="0.66" stopColor="#FBBC05" />
          <stop offset="1" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" fill="none" stroke="url(#kings-google-ring)" strokeWidth="2.5" />
      <path
        d="M14.5 8.5a4.8 4.8 0 1 0 0 7"
        fill="none"
        stroke="url(#kings-google-ring)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M12.5 12h5"
        fill="none"
        stroke="#4285F4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SocialIconsGroup() {
  const items = [
    {
      href: "/search",
      label: "Qidiruv markazi",
      icon: <GoogleIcon className="h-4 w-4" />,
    },
    {
      href: "/courses",
      label: "Kurslar bo'limi",
      icon: <Github className="h-4 w-4 text-gray-900 dark:text-white" />,
    },
    {
      href: "/mentors",
      label: "Mentorlar bo'limi",
      icon: <Linkedin className="h-4 w-4 text-[#0A66C2]" />,
    },
    {
      href: "/contact",
      label: "Aloqa bo'limi",
      icon: <Facebook className="h-4 w-4 text-[#1877F2]" />,
    },
  ]

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {items.map((item) => (
        <Button
          key={item.href}
          asChild
          variant="outline"
          size="icon"
          className="rounded-full bg-white dark:bg-gray-950 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
        >
          <Link href={item.href} aria-label={item.label} title={item.label}>
            {item.icon}
          </Link>
        </Button>
      ))}
    </div>
  );
}

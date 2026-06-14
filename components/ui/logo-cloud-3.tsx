import type { ComponentProps } from "react";
import {
  siAnthropic,
  siGithub,
  siNvidia,
  siPython,
  siReact,
  siSupabase,
  siVercel,
  type SimpleIcon,
} from "simple-icons";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = ComponentProps<"div"> & {
  logos: Logo[];
};

type BrandLogo = {
  icon: SimpleIcon | null;
  label: string;
  path?: string;
  viewBox?: string;
  color: string;
};

const OPENAI_PATH =
  "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.0192 19.818a5.9847 5.9847 0 0 0 3.9977-2.9 6.0462 6.0462 0 0 0-.735-7.0969zM13.2599 22.4292a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4945zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM1.2824 9.2236a4.4849 4.4849 0 0 1 2.341-2.003l-.0047.1614v5.5181a.7948.7948 0 0 0 .3927.6813l5.8428 3.3685-1.0053 1.7434a.071.071 0 0 1-.0664.0332l-4.839-2.7914a4.504 4.504 0 0 1-2.6603-6.7065zm10.598-4.4447a4.4802 4.4802 0 0 1 2.881 1.0454l-.1419.08-4.783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369l-2.02-1.1686a.0804.0804 0 0 1-.0332-.0615v-5.568a4.4992 4.4992 0 0 1 4.4904-4.5037zm2.5904 6.3829-3.23-1.8624 3.23-1.8624 3.23 1.8624-3.23 1.8624zm-1.2215 4.4981-3.23-1.8624v-3.7245l3.23 1.8624v3.7245zm9.2962-2.3101a4.4708 4.4708 0 0 1-.5346 3.0137l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0l-5.8428 3.3685v-2.3324a.0804.0804 0 0 1 .0332-.0615l4.839-2.7914a4.4992 4.4992 0 0 1 6.1408 1.6465z";

const BRAND_LOGOS = {
  anthropic: { icon: siAnthropic, label: "Anthropic" },
  github: { icon: siGithub, label: "GitHub" },
  nvidia: { icon: siNvidia, label: "NVIDIA" },
  openai: {
    icon: null,
    label: "OpenAI",
    path: OPENAI_PATH,
    viewBox: "0 0 24 24",
    color: "#00A67E",
  },
  python: { icon: siPython, label: "Python" },
  react: { icon: siReact, label: "React" },
  supabase: { icon: siSupabase, label: "Supabase" },
  vercel: { icon: siVercel, label: "Vercel" },
} satisfies Record<string, Omit<BrandLogo, "color"> | BrandLogo>;

function brandKey(logo: Logo) {
  const source = `${logo.alt} ${logo.src}`.toLowerCase();

  if (source.includes("anthropic") || source.includes("claude")) return "anthropic";
  if (source.includes("github")) return "github";
  if (source.includes("nvidia")) return "nvidia";
  if (source.includes("openai")) return "openai";
  if (source.includes("python")) return "python";
  if (source.includes("react")) return "react";
  if (source.includes("supabase")) return "supabase";
  if (source.includes("vercel")) return "vercel";

  return null;
}

function resolveBrandLogo(logo: Logo): BrandLogo {
  const key = brandKey(logo);
  const fallbackLabel = logo.alt.replace(/\s+logo$/i, "").trim();

  if (!key) {
    return {
      color: "#2563EB",
      icon: null,
      label: fallbackLabel,
      path: "M12 2 2 22h20L12 2z",
      viewBox: "0 0 24 24",
    };
  }

  const brand = BRAND_LOGOS[key];

  if (brand.icon) {
    return {
      color: `#${brand.icon.hex}`,
      icon: brand.icon,
      label: brand.label,
      path: brand.icon.path,
      viewBox: "0 0 24 24",
    };
  }

  return {
    color: brand.color ?? "#111827",
    icon: null,
    label: brand.label,
    path: brand.path,
    viewBox: brand.viewBox ?? "0 0 24 24",
  };
}

function LogoBadge({ logo }: { logo: Logo }) {
  const brand = resolveBrandLogo(logo);

  return (
    <div
      aria-label={`${brand.label} logo`}
      className="group inline-flex h-[72px] min-w-[172px] select-none items-center justify-center gap-3 rounded-2xl border border-gray-200/85 bg-white/90 px-5 text-gray-950 shadow-sm ring-1 ring-black/[0.03] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:ring-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.09]"
      role="img"
      title={brand.label}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-current/15 bg-current/[0.08] transition-transform duration-300 group-hover:scale-110"
        style={{ color: brand.color }}
      >
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          role="presentation"
          viewBox={brand.viewBox ?? "0 0 24 24"}
        >
          <path d={brand.path} fill="currentColor" />
        </svg>
      </span>
      <span className="whitespace-nowrap text-[15px] font-black uppercase tracking-[0.13em]">
        {brand.label}
      </span>
    </div>
  );
}

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  const displayLogos = [...logos, ...logos, ...logos];

  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={24} reverse duration={38} durationOnHover={70}>
        {displayLogos.map((logo, index) => (
          <LogoBadge key={`logo-${logo.alt}-${index}`} logo={logo} />
        ))}
      </InfiniteSlider>
    </div>
  );
}

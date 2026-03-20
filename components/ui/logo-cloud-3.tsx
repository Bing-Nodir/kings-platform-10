/* eslint-disable @next/next/no-img-element */
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        "overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={80} reverse duration={80} durationOnHover={35}>
        {logos.map((logo) => (
          <img
            alt={logo.alt}
            className="h-10 w-auto select-none object-contain opacity-50 transition-all duration-300 hover:scale-110 hover:opacity-100 md:h-12 dark:brightness-0 dark:invert"
            decoding="async"
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}

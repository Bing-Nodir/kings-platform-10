import Image from "next/image";
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
        "overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]",
        className
      )}
    >
      <InfiniteSlider gap={42} reverse duration={22} durationOnHover={38}>
        {logos.map((logo) => (
          <Image
            key={`logo-${logo.alt}`}
            src={logo.src}
            alt={logo.alt}
            width={logo.width ?? 120}
            height={logo.height ?? 20}
            className="pointer-events-none h-4 w-auto select-none md:h-5 dark:brightness-0 dark:invert"
            loading="lazy"
          />
        ))}
      </InfiniteSlider>
    </div>
  );
}

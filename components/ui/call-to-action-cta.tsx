"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CtaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageSrc: string;
  title: string;
  description: string;
  inputPlaceholder?: string;
  buttonText: string;
  onButtonClick?: (email: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.16,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      damping: 12,
      stiffness: 100,
      type: "spring",
    },
  },
};

const CtaCard = React.forwardRef<HTMLDivElement, CtaCardProps>(
  (
    {
      className,
      imageSrc,
      title,
      description,
      inputPlaceholder = "Email address",
      buttonText,
      onButtonClick,
      ...props
    },
    ref
  ) => {
    const [email, setEmail] = React.useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onButtonClick?.(email);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-[1.75rem] border bg-card text-card-foreground shadow",
          className
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageSrc})` }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(245,158,11,0.28),transparent_34%),radial-gradient(circle_at_88%_70%,rgba(20,184,166,0.18),transparent_30%)]" />

        <motion.div
          animate="visible"
          className="relative z-10 grid min-h-[360px] grid-cols-1 items-center gap-8 p-6 md:grid-cols-2 md:p-10 lg:p-14"
          initial="hidden"
          variants={containerVariants}
        >
          <div className="flex flex-col items-start text-left text-white">
            <motion.h2
              className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl"
              variants={itemVariants}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mt-4 max-w-xl text-base leading-8 text-neutral-200 md:text-lg"
              variants={itemVariants}
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            className="flex w-full max-w-md flex-col items-center justify-center justify-self-start md:justify-self-end"
            variants={itemVariants}
          >
            <form
              className="flex w-full flex-col gap-3 sm:flex-row"
              onSubmit={handleSubmit}
            >
              <Input
                aria-label={inputPlaceholder}
                className="h-12 flex-grow border-white/15 bg-black/35 text-white placeholder:text-neutral-300 focus-visible:ring-amber-300/30"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={inputPlaceholder}
                required
                type="email"
                value={email}
              />
              <Button
                className="h-12 bg-white px-5 text-black hover:bg-amber-100"
                size="lg"
                type="submit"
              >
                {buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);

CtaCard.displayName = "CtaCard";

export { CtaCard };

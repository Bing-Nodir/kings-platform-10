import { CreditCard } from "lucide-react";

type PaymentBrand = "payme" | "click" | "visa" | "card";

interface PaymentLogoProps {
  brand: PaymentBrand;
  className?: string;
  compact?: boolean;
}

const logoTitle: Record<PaymentBrand, string> = {
  payme: "Payme",
  click: "Click",
  visa: "Visa",
  card: "Bank card",
};

export function PaymentLogo({ brand, className = "", compact = false }: PaymentLogoProps) {
  if (brand === "card") {
    return (
      <span
        aria-label={logoTitle.card}
        className={`inline-flex items-center gap-2 ${className}`}
      >
        <CreditCard className="h-5 w-5" />
        {!compact ? <span className="text-xs font-black">CARD</span> : null}
      </span>
    );
  }

  if (brand === "payme") {
    return (
      <svg
        aria-label={logoTitle.payme}
        className={className}
        viewBox="0 0 116 36"
        role="img"
      >
        <rect width="116" height="36" rx="10" fill="#00B5AD" />
        <path
          d="M16 12.5h11.2c4.1 0 6.8 2.4 6.8 6.1 0 3.8-2.7 6.2-6.8 6.2h-5.1v5H16V12.5Zm10.5 7.7c1.3 0 2.1-.6 2.1-1.6s-.8-1.6-2.1-1.6h-4.4v3.2h4.4Z"
          fill="white"
        />
        <text
          x="38"
          y="24.8"
          fill="white"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="17"
          fontWeight="800"
          letterSpacing="-0.2"
        >
          payme
        </text>
      </svg>
    );
  }

  if (brand === "click") {
    return (
      <svg
        aria-label={logoTitle.click}
        className={className}
        viewBox="0 0 116 36"
        role="img"
      >
        <rect width="116" height="36" rx="10" fill="#F7FAFF" />
        <path
          d="M25.5 10.5 19 17l6.5 6.5"
          fill="none"
          stroke="#00A0E3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        <circle cx="30.5" cy="25.5" r="3.5" fill="#F58220" />
        <text
          x="39"
          y="24.6"
          fill="#1A5FD0"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="17"
          fontWeight="900"
          letterSpacing="0.2"
        >
          CLICK
        </text>
      </svg>
    );
  }

  return (
    <svg
      aria-label={logoTitle.visa}
      className={className}
      viewBox="0 0 116 36"
      role="img"
    >
      <rect width="116" height="36" rx="10" fill="white" />
      <text
        x="58"
        y="25.5"
        fill="#1A1F71"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="21"
        fontStyle="italic"
        fontWeight="900"
        letterSpacing="-1.2"
        textAnchor="middle"
      >
        VISA
      </text>
      <path d="M87 10.5h10l-2 4.3H85l2-4.3Z" fill="#F7B600" />
    </svg>
  );
}

export function PaymentLogoBadge({
  brand,
  className = "",
}: {
  brand: Exclude<PaymentBrand, "card">;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-2.5 shadow-sm shadow-gray-200/70 transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:shadow-none ${className}`}
    >
      <PaymentLogo brand={brand} className="h-7 w-[88px]" />
    </span>
  );
}

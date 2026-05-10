"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface SandboxPaymentConfirmButtonProps {
  orderId: string;
  paymentIntentId: string;
}

export default function SandboxPaymentConfirmButton({
  orderId,
  paymentIntentId,
}: SandboxPaymentConfirmButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleConfirm() {
    setError("");

    try {
      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentIntentId }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Payment confirmation muvaffaqiyatsiz.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : "Payment confirmation muvaffaqiyatsiz."
      );
    }
  }

  return (
    <div className="w-full space-y-3">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {isPending ? "Tasdiqlanmoqda..." : "Sandbox tasdiqlash"}
      </button>
      {error ? (
        <p className="text-center text-xs text-red-500 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

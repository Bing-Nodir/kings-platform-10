"use client";

import { createOrder } from "@/app/checkout/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar, CreditCard, Lock } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

interface GlassCheckoutCardProps {
  amount: number;
  itemId: string;
  itemType: "course" | "product";
  itemTitle: string;
  className?: string;
}

function SubmitButton({ amount }: { amount: number }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-8 h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:bg-blue-700 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Tasdiqlanmoqda..." : `${amount.toLocaleString()} UZS To'lash`}
    </Button>
  );
}

export function GlassCheckoutCard({
  amount,
  itemId,
  itemType,
  itemTitle,
  className,
}: GlassCheckoutCardProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full max-w-[420px]", className)}
    >
      <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-white/40 p-1 backdrop-blur-xl transition-all duration-500 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 dark:bg-black/40">
        <div className="rounded-[1.3rem] bg-white/60 p-6 dark:bg-gray-950/60">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">
              To&apos;lov ma&apos;lumotlari
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Xaridingizni xavfsiz amalga oshiring
            </p>
          </div>

          <form action={createOrder}>
            <input type="hidden" name="id" value={itemId} />
            <input type="hidden" name="type" value={itemType} />
            <input type="hidden" name="payment_method" value={paymentMethod} />

            <div className="mb-5 rounded-2xl border border-border/50 bg-background/50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Buyurtma
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {itemTitle}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              {["card", "payme", "click"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-xl border border-border/50 bg-background/50 text-sm font-semibold uppercase tracking-wider transition-all hover:bg-background/80",
                    paymentMethod === method &&
                      "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {method === "card" && <CreditCard className="h-5 w-5" />}
                  {method === "payme" && <span>Payme</span>}
                  {method === "click" && <span>Click</span>}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-xs font-semibold uppercase text-gray-500"
                >
                  To&apos;lovchi ismi
                </Label>
                <Input
                  id="fullName"
                  name="full_name"
                  placeholder="Ism familiya"
                  required
                  className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold uppercase text-gray-500"
                >
                  Telefon raqami
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+998 90 123 45 67"
                  required
                  className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              {paymentMethod === "card" ? (
                <>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cardNumber"
                      className="text-xs font-semibold uppercase text-gray-500"
                    >
                      Karta raqami
                    </Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="0000 0000 0000 0000"
                        className="h-12 rounded-xl border-border/50 bg-background/50 pl-11 backdrop-blur-sm focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                      <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="expiry"
                        className="text-xs font-semibold uppercase text-gray-500"
                      >
                        Amal qilish
                      </Label>
                      <div className="relative">
                        <Input
                          id="expiry"
                          placeholder="AA/YY"
                          className="h-12 rounded-xl border-border/50 bg-background/50 pl-11 backdrop-blur-sm focus:border-blue-500/50 focus:ring-blue-500/20"
                        />
                        <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="cvc"
                        className="text-xs font-semibold uppercase text-gray-500"
                      >
                        CVC / Kod
                      </Label>
                      <div className="relative">
                        <Input
                          id="cvc"
                          placeholder="123"
                          type="password"
                          className="h-12 rounded-xl border-border/50 bg-background/50 pl-11 backdrop-blur-sm focus:border-blue-500/50 focus:ring-blue-500/20"
                        />
                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
                  {paymentMethod === "payme"
                    ? "Payme orqali davom etish uchun buyurtma tasdiqlang. Access avtomatik ochiladi."
                    : "Click orqali davom etish uchun buyurtma tasdiqlang. Access avtomatik ochiladi."}
                </div>
              )}
            </div>

            <SubmitButton amount={amount} />

            <p className="mt-5 flex items-center justify-center text-xs font-medium text-muted-foreground">
              <Lock className="mr-1.5 h-3.5 w-3.5 text-green-500" />
              To&apos;lovlar 100% xavfsiz va shifrlangan
            </p>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}

"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MissionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  description: string;
  inputPlaceholder?: string;
  primaryButtonText: string;
  onPrimaryClick: (inputValue: string) => void;
  secondaryButtonText: string;
  onSecondaryClick: () => void;
  badgeText?: string;
  badgeIcon?: React.ReactNode;
}

export const MissionSuccessDialog: React.FC<MissionSuccessDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  description,
  inputPlaceholder = "Enter a value",
  primaryButtonText,
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
  badgeText,
  badgeIcon,
}) => {
  const [inputValue, setInputValue] = React.useState("");

  const handlePrimaryClick = () => {
    onPrimaryClick(inputValue);
    setInputValue("");
    onClose();
  };

  const handleSecondaryClick = () => {
    onSecondaryClick();
    setInputValue("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-amber-200/20 bg-[#15110b] shadow-[0_34px_100px_rgba(0,0,0,0.55)]"
            exit={{ opacity: 0, scale: 0.92, y: 18 }}
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(245,158,11,0.22),transparent_34%),radial-gradient(circle_at_90%_58%,rgba(20,184,166,0.15),transparent_32%)]" />
            <div className="relative p-7 text-center text-amber-50">
              {badgeText ? (
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1 text-xs font-bold text-amber-100">
                  {badgeIcon}
                  <span>{badgeText}</span>
                </div>
              ) : null}

              <Button
                aria-label="Dialogni yopish"
                className="absolute right-4 top-4 h-8 w-8 rounded-full text-amber-50/75 hover:bg-white/10 hover:text-white"
                onClick={onClose}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="mx-auto mb-4 mt-6 flex h-44 w-44 items-center justify-center rounded-full border border-amber-200/15 bg-black/20">
                <div
                  aria-hidden="true"
                  className="h-36 w-36 bg-contain bg-center bg-no-repeat drop-shadow-[0_10px_24px_rgba(245,158,11,0.28)]"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              </div>

              <h2 className="mb-2 flex items-center justify-center gap-2 text-2xl font-black">
                <Zap className="h-5 w-5 text-amber-300" />
                {title}
              </h2>

              <p className="mb-6 text-sm leading-6 text-stone-300">
                {description}
              </p>

              <div className="flex flex-col gap-3">
                <Input
                  className="border-amber-200/15 bg-black/25 text-center text-amber-50 placeholder:text-stone-500 focus-visible:ring-amber-300/30"
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder={inputPlaceholder}
                  type="text"
                  value={inputValue}
                />
                <Button
                  className="w-full bg-amber-100 text-[#171008] hover:bg-white"
                  onClick={handlePrimaryClick}
                  size="lg"
                  type="button"
                >
                  {primaryButtonText}
                </Button>
                <Button
                  className="text-stone-400 hover:text-amber-100"
                  onClick={handleSecondaryClick}
                  type="button"
                  variant="link"
                >
                  {secondaryButtonText}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

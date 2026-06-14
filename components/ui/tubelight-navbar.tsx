"use client"

import React, { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)
  const [manualActiveTab, setManualActiveTab] = useState(items[0]?.name ?? "")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const handleChange = () => {
      setIsMobile(mediaQuery.matches)
    }

    handleChange()
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const activeTab =
    items.find((item) => {
      if (item.url.startsWith("#")) {
        return false
      }

      if (item.url === "/") {
        return pathname === "/"
      }

      return pathname === item.url || pathname.startsWith(`${item.url}/`)
    })?.name ??
    manualActiveTab

  return (
    <div
      className={cn(
        "fixed bottom-0 left-1/2 z-50 mb-6 -translate-x-1/2 sm:top-0 sm:mb-0 sm:pt-6",
        isMobile && "w-[calc(100%-1.5rem)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center rounded-full border border-border bg-background/75 px-1 py-1 shadow-lg backdrop-blur-lg",
          isMobile ? "justify-between gap-1" : "gap-3",
        )}
      >
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => {
                if (item.url.startsWith("#")) {
                  setManualActiveTab(item.name)
                }
              }}
              className={cn(
                "relative cursor-pointer rounded-full px-6 py-2 text-sm font-semibold transition-colors",
                "text-foreground/80 hover:text-primary",
                isMobile && "flex min-w-0 flex-1 justify-center px-2 text-center",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 -z-10 w-full rounded-full bg-primary/5"
                  initial={false}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.12, ease: "linear" }
                      : {
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }
                  }
                >
                  <div className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full bg-primary">
                    <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md" />
                    <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

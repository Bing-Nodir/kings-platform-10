const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9][0-9\s()-]{7,19}$/

export const VALID_LANGUAGES = ["uz", "ru", "en"] as const
export const VALID_PAYMENT_METHODS = ["card", "payme", "click"] as const

export type SupportedLanguage = (typeof VALID_LANGUAGES)[number]
export type PaymentMethod = (typeof VALID_PAYMENT_METHODS)[number]

export interface ChatHistoryMessage {
  role: "user" | "assistant"
  content: string
}

export function normalizeSingleLine(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return ""
  }

  return value.replace(/\s+/g, " ").trim().slice(0, maxLength)
}

export function normalizeMultiline(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return ""
  }

  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength)
}

export function isValidEmail(email: string) {
  return emailPattern.test(email)
}

export function isValidPhone(phone: string) {
  return phonePattern.test(phone)
}

export function sanitizeRedirectPath(value: unknown, fallback = "/dashboard") {
  const path = typeof value === "string" ? value.trim() : ""

  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\\") ||
    path.length > 300
  ) {
    return fallback
  }

  return path
}

export function coercePaymentMethod(value: unknown): PaymentMethod | null {
  return VALID_PAYMENT_METHODS.includes(value as PaymentMethod)
    ? (value as PaymentMethod)
    : null
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return VALID_LANGUAGES.includes(value as SupportedLanguage)
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

export function sanitizeChatHistory(
  messages: unknown,
  options?: { maxMessages?: number; maxContentLength?: number }
) {
  const maxMessages = options?.maxMessages ?? 40
  const maxContentLength = options?.maxContentLength ?? 4000

  if (!Array.isArray(messages)) {
    return [] as ChatHistoryMessage[]
  }

  const sanitized: ChatHistoryMessage[] = []

  for (const entry of messages.slice(-maxMessages)) {
    if (!entry || typeof entry !== "object") {
      continue
    }

    const role = "role" in entry ? entry.role : undefined
    const content = "content" in entry ? entry.content : undefined

    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string"
    ) {
      const normalized = normalizeMultiline(content, maxContentLength)

      if (normalized) {
        sanitized.push({ role, content: normalized })
      }
    }
  }

  return sanitized
}

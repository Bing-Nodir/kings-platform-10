const FALLBACK_PRIMARY_ADMIN_EMAIL = "nodirkhudayarov@gmail.com";

function parseAdminEmails(value?: string | null) {
  return (value ?? "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

const configuredAdminEmails = [
  ...parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS),
  ...parseAdminEmails(process.env.ADMIN_EMAILS),
  ...parseAdminEmails(process.env.NEXT_PUBLIC_PRIMARY_ADMIN_EMAIL),
  ...parseAdminEmails(process.env.PRIMARY_ADMIN_EMAIL),
  FALLBACK_PRIMARY_ADMIN_EMAIL,
];

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

export const ADMIN_EMAILS = Array.from(new Set(configuredAdminEmails));
export const PRIMARY_ADMIN_EMAIL = ADMIN_EMAILS[0] ?? FALLBACK_PRIMARY_ADMIN_EMAIL;

export function isPrimaryAdminEmail(email?: string | null) {
  return ADMIN_EMAILS.includes(normalizeEmail(email));
}

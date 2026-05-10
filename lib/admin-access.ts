export const PRIMARY_ADMIN_EMAIL = "nodirkhudayarov@gmail.com";

export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

export function isPrimaryAdminEmail(email?: string | null) {
  return normalizeEmail(email) === PRIMARY_ADMIN_EMAIL;
}

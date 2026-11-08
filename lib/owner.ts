export const OWNER_EMAIL = "mge3696@gmail.com";

export function isOwnerEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase() === OWNER_EMAIL;
}

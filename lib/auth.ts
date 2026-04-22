export const ADMIN_EMAILS = [
  "felipeitallo59@gmail.com",
  "marketing@cppem.com.br",
] as const;

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email);
}

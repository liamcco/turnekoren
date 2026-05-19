export const AUTH_COOKIE = "admin_session";
export const ADMIN_LOGIN_PATH = "/admin-login";
export const ADMIN_PATH = "/admin";
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const LOGIN_ERROR_PARAM = "invalid_password";

export function getSafeAdminRedirectPath(from: string | null): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return ADMIN_PATH;
  }

  try {
    const url = new URL(from, "http://localhost");
    return url.pathname.startsWith(ADMIN_PATH) ? `${url.pathname}${url.search}` : ADMIN_PATH;
  } catch {
    return ADMIN_PATH;
  }
}

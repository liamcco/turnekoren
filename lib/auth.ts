export const ADMIN_AUTH_COOKIE = "admin_session";
export const INTERNAL_AUTH_COOKIE = "internal_session";
export const LOGIN_PATH = "/login";
export const ADMIN_PATH = "/admin";
export const INTERNAL_PATH = "/internal";
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const LOGIN_ERROR_PARAM = "invalid_password";
export const LOGIN_TYPE_PARAM = "type";

export type LoginType = "admin" | "internal";

export interface LoginConfig {
  type: LoginType;
  authCookie: string;
  defaultPath: string;
  passwordEnvVar: string;
  placeholder: string;
  subtitle: string;
}

export const loginConfigs: Record<LoginType, LoginConfig> = {
  admin: {
    type: "admin",
    authCookie: ADMIN_AUTH_COOKIE,
    defaultPath: ADMIN_PATH,
    passwordEnvVar: "ADMIN_PASSWORD",
    placeholder: "Enter admin password",
    subtitle: "Admin access only",
  },
  internal: {
    type: "internal",
    authCookie: INTERNAL_AUTH_COOKIE,
    defaultPath: INTERNAL_PATH,
    passwordEnvVar: "INTERNAL_PASSWORD",
    placeholder: "Enter internal password",
    subtitle: "Internal access only",
  },
};

export function getLoginConfig(type: string | null): LoginConfig {
  return type === "internal" ? loginConfigs.internal : loginConfigs.admin;
}

function isPathWithin(pathname: string, basePath: string): boolean {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function getSafeRedirectPath(from: string | null, fallbackPath: string): string {
  if (!from || !from.startsWith("/") || from.startsWith("//")) {
    return fallbackPath;
  }

  try {
    const url = new URL(from, "http://localhost");
    return isPathWithin(url.pathname, fallbackPath) ? `${url.pathname}${url.search}` : fallbackPath;
  } catch {
    return fallbackPath;
  }
}

export function getSafeAdminRedirectPath(from: string | null): string {
  return getSafeRedirectPath(from, ADMIN_PATH);
}

export function getSafeInternalRedirectPath(from: string | null): string {
  return getSafeRedirectPath(from, INTERNAL_PATH);
}

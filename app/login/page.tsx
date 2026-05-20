import { PasswordLoginPage } from "../(components)/password-login-page";
import { getLoginConfig, getSafeRedirectPath, LOGIN_TYPE_PARAM } from "@/lib/auth";

interface LoginPageProps {
  searchParams: Promise<{ from?: string; error?: string; type?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { from, error, type } = await searchParams;
  const config = getLoginConfig(type);
  const safeFrom = getSafeRedirectPath(from ?? config.defaultPath, config.defaultPath);
  const loginActionUrl = `/api/login?${LOGIN_TYPE_PARAM}=${config.type}&from=${encodeURIComponent(safeFrom)}`;

  return (
    <PasswordLoginPage
      actionUrl={loginActionUrl}
      error={error}
      placeholder={config.placeholder}
      subtitle={config.subtitle}
    />
  );
}

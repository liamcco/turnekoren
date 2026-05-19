import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_PATH,
  INTERNAL_PATH,
  LOGIN_CONFIGS,
  LOGIN_PATH,
  LOGIN_TYPE_PARAM,
} from "@/lib/auth";
import { isValidSessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const config = pathname.startsWith(INTERNAL_PATH)
    ? LOGIN_CONFIGS.internal
    : pathname.startsWith(ADMIN_PATH)
      ? LOGIN_CONFIGS.admin
      : null;

  if (!config) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(config.authCookie);

  if (!(await isValidSessionToken(authCookie?.value, config.type))) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set(LOGIN_TYPE_PARAM, config.type);
    loginUrl.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/internal/:path*"],
};

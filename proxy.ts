import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_PATH,
  INTERNAL_AUTH_COOKIE,
  INTERNAL_PATH,
  LOGIN_PATH,
  LOGIN_TYPE_PARAM,
} from "@/lib/auth";
import { isValidAdminSessionToken, isValidInternalSessionToken } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(ADMIN_PATH)) {
    const authCookie = request.cookies.get(ADMIN_AUTH_COOKIE);

    if (!(await isValidAdminSessionToken(authCookie?.value))) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set(LOGIN_TYPE_PARAM, "admin");
      loginUrl.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith(INTERNAL_PATH)) {
    const authCookie = request.cookies.get(INTERNAL_AUTH_COOKIE);

    if (!(await isValidInternalSessionToken(authCookie?.value))) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set(LOGIN_TYPE_PARAM, "internal");
      loginUrl.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/internal/:path*"],
};

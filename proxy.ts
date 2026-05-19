import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, ADMIN_PATH, ADMIN_LOGIN_PATH } from "@/lib/auth";
import { isValidAdminSessionToken } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(ADMIN_PATH)) {
    const authCookie = request.cookies.get(AUTH_COOKIE);

    if (!(await isValidAdminSessionToken(authCookie?.value))) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("from", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

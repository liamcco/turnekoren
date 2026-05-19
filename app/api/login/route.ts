import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createSessionToken } from "@/lib/session";
import {
  COOKIE_MAX_AGE_SECONDS,
  LOGIN_ERROR_PARAM,
  LOGIN_PATH,
  LOGIN_TYPE_PARAM,
  getLoginConfig,
  getSafeRedirectPath,
} from "@/lib/auth";

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still do a comparison to avoid leaking length via timing
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  const config = getLoginConfig(request.nextUrl.searchParams.get(LOGIN_TYPE_PARAM));
  const formData = await request.formData();
  const password = formData.get("password");
  const from = getSafeRedirectPath(
    request.nextUrl.searchParams.get("from") ?? config.defaultPath,
    config.defaultPath,
  );
  const expectedPassword = process.env[config.passwordEnvVar];

  const isValid =
    typeof password === "string" &&
    typeof expectedPassword === "string" &&
    safeCompare(password, expectedPassword);

  if (!isValid) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set(LOGIN_TYPE_PARAM, config.type);
    loginUrl.searchParams.set("from", from);
    loginUrl.searchParams.set("error", LOGIN_ERROR_PARAM);
    return NextResponse.redirect(loginUrl);
  }

  const token = await createSessionToken(config.type);
  const response = NextResponse.redirect(new URL(from, request.url));
  response.cookies.set(config.authCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
}

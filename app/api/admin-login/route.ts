import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { AUTH_COOKIE, ADMIN_LOGIN_PATH, ADMIN_PATH } from "@/lib/auth";

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
  const formData = await request.formData();
  const password = formData.get("password");
  const from = request.nextUrl.searchParams.get("from") ?? ADMIN_PATH;

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const isValid = typeof password === "string" && safeCompare(password, adminPassword);

  if (!isValid) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    loginUrl.searchParams.set("from", from);
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(from, request.url));
  response.cookies.set(AUTH_COOKIE, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}

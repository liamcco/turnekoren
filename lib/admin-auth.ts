import { NextRequest, NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { isValidSessionToken } from "@/lib/session";

export async function isAdminRequest(request: NextRequest) {
  return isValidSessionToken(request.cookies.get(ADMIN_AUTH_COOKIE)?.value, "admin");
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}

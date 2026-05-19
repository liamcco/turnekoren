import { jwtVerify, SignJWT } from "jose";
import { COOKIE_MAX_AGE_SECONDS } from "@/lib/auth";

const ADMIN_SESSION_ALG = "HS256";
const ADMIN_SESSION_ISSUER = "turnekor";
const ADMIN_SESSION_AUDIENCE = "turnekor-admin";
const ADMIN_SESSION_SUBJECT = "admin";

function getAdminSessionSecret(): Uint8Array {
  const secret = process.env.ADMIN_AUTH_SECRET ?? process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error("ADMIN_AUTH_SECRET or ADMIN_PASSWORD must be set for admin sessions.");
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ADMIN_SESSION_ALG })
    .setIssuer(ADMIN_SESSION_ISSUER)
    .setAudience(ADMIN_SESSION_AUDIENCE)
    .setSubject(ADMIN_SESSION_SUBJECT)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE_SECONDS}s`)
    .sign(getAdminSessionSecret());
}

export async function isValidAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getAdminSessionSecret(), {
      issuer: ADMIN_SESSION_ISSUER,
      audience: ADMIN_SESSION_AUDIENCE,
      subject: ADMIN_SESSION_SUBJECT,
      algorithms: [ADMIN_SESSION_ALG],
    });

    return payload.role === "admin";
  } catch {
    return false;
  }
}

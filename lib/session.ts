import { jwtVerify, SignJWT } from "jose";
import { COOKIE_MAX_AGE_SECONDS, LoginType } from "@/lib/auth";

const JWT_ALGORITHM = "HS256";
const JWT_ISSUER = "turnekor";
const JWT_AUDIENCE = "turnekor-auth";

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET must be set for protected sessions.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(type: LoginType): Promise<string> {
  return new SignJWT({ type })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setSubject(type)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function isValidSessionToken(
  token: string | undefined,
  type: LoginType,
): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      subject: type,
      algorithms: [JWT_ALGORITHM],
    });

    return payload.type === type;
  } catch {
    return false;
  }
}

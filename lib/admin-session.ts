import { jwtVerify, SignJWT } from "jose";
import { COOKIE_MAX_AGE_SECONDS, LoginType } from "@/lib/auth";

const SESSION_ALG = "HS256";
const SESSION_ISSUER = "turnekor";

interface SessionConfig {
  role: LoginType;
  audience: string;
  subject: string;
  secretEnvVar: string;
  fallbackSecretEnvVar: string;
}

const adminSessionConfig: SessionConfig = {
  role: "admin",
  audience: "turnekor-admin",
  subject: "admin",
  secretEnvVar: "ADMIN_AUTH_SECRET",
  fallbackSecretEnvVar: "ADMIN_PASSWORD",
};

const internalSessionConfig: SessionConfig = {
  role: "internal",
  audience: "turnekor-internal",
  subject: "internal",
  secretEnvVar: "INTERNAL_AUTH_SECRET",
  fallbackSecretEnvVar: "INTERNAL_PASSWORD",
};

const sessionConfigs: Record<LoginType, SessionConfig> = {
  admin: adminSessionConfig,
  internal: internalSessionConfig,
};

function getSessionSecret(config: SessionConfig): Uint8Array {
  const secret = process.env[config.secretEnvVar] ?? process.env[config.fallbackSecretEnvVar];

  if (!secret) {
    throw new Error(
      `${config.secretEnvVar} or ${config.fallbackSecretEnvVar} must be set for ${config.role} sessions.`,
    );
  }

  return new TextEncoder().encode(secret);
}

async function createSessionToken(config: SessionConfig): Promise<string> {
  return new SignJWT({ role: config.role })
    .setProtectedHeader({ alg: SESSION_ALG })
    .setIssuer(SESSION_ISSUER)
    .setAudience(config.audience)
    .setSubject(config.subject)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret(config));
}

async function isValidSessionToken(token: string | undefined, config: SessionConfig): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionSecret(config), {
      issuer: SESSION_ISSUER,
      audience: config.audience,
      subject: config.subject,
      algorithms: [SESSION_ALG],
    });

    return payload.role === config.role;
  } catch {
    return false;
  }
}

export async function createAdminSessionToken(): Promise<string> {
  return createSessionToken(adminSessionConfig);
}

export async function isValidAdminSessionToken(token: string | undefined): Promise<boolean> {
  return isValidSessionToken(token, adminSessionConfig);
}

export async function createInternalSessionToken(): Promise<string> {
  return createSessionToken(internalSessionConfig);
}

export async function isValidInternalSessionToken(token: string | undefined): Promise<boolean> {
  return isValidSessionToken(token, internalSessionConfig);
}

export async function createSessionTokenForType(type: LoginType): Promise<string> {
  return createSessionToken(sessionConfigs[type]);
}

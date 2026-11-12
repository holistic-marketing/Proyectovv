import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env/env.server";

/** Vida del token: alcanza para pedir el código y escribirlo (incluye reenvíos). */
const TOKEN_TTL_MS = 15 * 60 * 1000;

type TokenPayload = { e: string; x: number };

function signingKey(): string | null {
  const base = serverEnv.encryptionKey || serverEnv.internalJobSecret;
  return base ? `otp-lookup:v1:${base}` : null;
}

function sign(data: string, key: string): string {
  return createHmac("sha256", key).update(data).digest("base64url");
}

/**
 * Token opaco para «¿No sabes tu correo?»: el navegador nunca recibe el correo completo
 * del cliente, solo este token, que el servidor canjea por el correo al pedir/verificar el OTP.
 * null si no hay clave de firma configurada.
 */
export function createOtpLookupToken(email: string): string | null {
  const key = signingKey();
  if (!key) return null;
  const payload: TokenPayload = { e: email.trim().toLowerCase(), x: Date.now() + TOKEN_TTL_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, key)}`;
}

/** Correo dentro del token si la firma es válida y no venció; si no, null. */
export function readOtpLookupToken(token: unknown): string | null {
  const key = signingKey();
  if (!key || typeof token !== "string" || token.length > 1024) return null;
  const [data, signature, ...rest] = token.split(".");
  if (!data || !signature || rest.length > 0) return null;

  const expected = Buffer.from(sign(data, key));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as Partial<TokenPayload>;
    if (typeof payload.e !== "string" || !payload.e.includes("@")) return null;
    if (typeof payload.x !== "number" || payload.x < Date.now()) return null;
    return payload.e;
  } catch {
    return null;
  }
}

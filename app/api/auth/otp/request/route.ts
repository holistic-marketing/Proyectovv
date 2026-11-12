import { NextResponse } from "next/server";
import { requestHecomClientOtp } from "@/lib/auth/hecom-otp.server";
import { HECOM_OTP_COOLDOWN_SECONDS } from "@/lib/auth/hecom-otp-email";
import { logHecomOtp, maskEmail } from "@/lib/auth/hecom-otp-log.server";
import { readOtpLookupToken } from "@/lib/auth/otp-lookup-token.server";

export async function POST(request: Request) {
  let body: { email?: string; lookupToken?: string };
  try {
    body = (await request.json()) as { email?: string; lookupToken?: string };
  } catch {
    logHecomOtp("warn", "api_request_bad_json", {});
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // «¿No sabes tu correo?»: llega un token firmado en vez del correo, que nunca vuelve al navegador.
  const fromLookup = typeof body.lookupToken === "string" && body.lookupToken.length > 0;
  const lookupEmail = fromLookup ? readOtpLookupToken(body.lookupToken) : null;
  if (fromLookup && !lookupEmail) {
    return NextResponse.json(
      { error: "La búsqueda venció. Vuelve a buscar tu nombre o escribe tu correo." },
      { status: 400 },
    );
  }
  const email = lookupEmail ?? body.email ?? "";

  const emailMasked = maskEmail(email);
  logHecomOtp("info", "api_request_hit", { email: emailMasked, fromLookup });

  const result = await requestHecomClientOtp({ email });
  if (!result.ok) {
    logHecomOtp("error", "api_request_fail", {
      email: emailMasked,
      status: result.status,
      error: result.error,
    });
    return NextResponse.json(
      { error: result.error, retryAfterSec: result.retryAfterSec },
      { status: result.status },
    );
  }

  logHecomOtp("info", "api_request_ok", {
    email: emailMasked,
    sent: result.sent ?? result.allowed,
    allowed: result.allowed,
  });

  return NextResponse.json({
    ok: true,
    message: result.message,
    // Con token no se devuelve el correo: solo la versión enmascarada.
    ...(fromLookup ? { emailMasked } : { email: result.email }),
    sent: result.sent ?? result.allowed,
    // Sin ficha Hecom no hay código: el login lo manda a registrarse.
    notRegistered: !result.allowed,
    retryAfterSec: result.retryAfterSec ?? HECOM_OTP_COOLDOWN_SECONDS,
    ...(process.env.NODE_ENV !== "production"
      ? { allowed: result.allowed, clienteIds: result.clienteIds }
      : {}),
  });
}

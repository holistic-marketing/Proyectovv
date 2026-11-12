import { NextResponse } from "next/server";
import { verifyHecomOtpCode } from "@/lib/auth/verify-hecom-otp.server";
import { logHecomOtp, maskEmail } from "@/lib/auth/hecom-otp-log.server";
import { isHecomOtpLoginEnabled } from "@/lib/auth/hecom-otp.server";
import { readOtpLookupToken } from "@/lib/auth/otp-lookup-token.server";

export async function POST(request: Request) {
  if (!isHecomOtpLoginEnabled()) {
    return NextResponse.json(
      { error: "OTP Hecom deshabilitado." },
      { status: 403 },
    );
  }

  let body: { email?: string; token?: string; lookupToken?: string };
  try {
    body = (await request.json()) as { email?: string; token?: string; lookupToken?: string };
  } catch {
    logHecomOtp("warn", "api_verify_bad_json", {});
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  // Login desde «¿No sabes tu correo?»: el correo viaja dentro del token firmado.
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
  logHecomOtp("info", "api_verify_hit", { email: emailMasked, fromLookup });

  const result = await verifyHecomOtpCode({
    email,
    token: body.token ?? "",
  });

  if (!result.ok) {
    logHecomOtp("error", "api_verify_fail", {
      email: emailMasked,
      status: result.status,
      error: result.error,
    });
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  const response = NextResponse.json({
    ok: true,
    email: result.email,
    nextPath: result.nextPath,
    accountReady: result.accountReady,
    needsPicker: result.needsPicker,
    isStaff: result.isStaff,
  });

  for (const { name, value, options } of result.cookies) {
    response.cookies.set(name, value, options);
  }

  logHecomOtp("info", "api_verify_ok", {
    email: emailMasked,
    nextPath: result.nextPath,
    isStaff: result.isStaff,
  });

  return response;
}

import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkLoginEnabled } from "@/lib/auth/clerk";
import { resolveHecomClientesForEmail } from "@/lib/auth/hecom-otp.server";
import { logHecomOtp, maskEmail } from "@/lib/auth/hecom-otp-log.server";
import { isStaffUser } from "@/lib/auth/staff.server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Límite por IP (confirmar si un correo existe permite enumerarlos): 20 consultas por minuto.
 * Sin pausa entre intentos, para que corregir un correo mal escrito nunca dé 429.
 */
const PRECHECK_WINDOW_SECONDS = 60;
const PRECHECK_MAX_PER_WINDOW = 20;
const NOT_REGISTERED = "Este correo no está registrado. Crea tu cuenta.";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  return request.headers.get("x-real-ip")?.trim().slice(0, 64) || "unknown";
}

/**
 * Ventana fija por IP en hecom_otp_rate_limits (misma tabla que lookup-email):
 * `last_sent_at` = inicio de la ventana, `send_count` = consultas dentro de ella.
 */
async function assertRateLimit(key: string): Promise<{ ok: boolean; retryAfterSec?: number }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("hecom_otp_rate_limits")
    .select("last_sent_at, send_count")
    .eq("email", key)
    .maybeSingle<{ last_sent_at: string; send_count: number }>();

  const now = Date.now();
  const windowStart = data?.last_sent_at ? Date.parse(data.last_sent_at) : 0;
  const elapsed = (now - windowStart) / 1000;
  const inWindow = Boolean(data) && elapsed < PRECHECK_WINDOW_SECONDS;

  if (inWindow && (data?.send_count ?? 0) >= PRECHECK_MAX_PER_WINDOW) {
    return { ok: false, retryAfterSec: Math.ceil(PRECHECK_WINDOW_SECONDS - elapsed) };
  }
  await admin.from("hecom_otp_rate_limits").upsert(
    inWindow
      ? { email: key, last_sent_at: data!.last_sent_at, send_count: (data?.send_count ?? 0) + 1 }
      : { email: key, last_sent_at: new Date(now).toISOString(), send_count: 1 },
    { onConflict: "email" },
  );
  return { ok: true };
}

/** ¿Ya tiene cuenta en Supabase? `profiles` refleja `auth.users` (trigger handle_new_user). */
async function existsInSupabase(email: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle<{ id: string }>();
  return Boolean(data?.id);
}

/**
 * Antes de que Clerk envíe el código de /sign-in: solo correos ya registrados
 * (staff, cliente en Hecom o usuario existente). Si aún no está en Clerk, se crea
 * para que el código pueda enviarse. El puente /auth/clerk/complete vuelve a filtrar.
 */
export async function POST(request: Request) {
  if (!clerkLoginEnabled()) {
    return NextResponse.json({ error: "El acceso con código no está disponible." }, { status: 403 });
  }

  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Escribe un correo válido, por ejemplo nombre@ejemplo.com." },
      { status: 400 },
    );
  }

  const rate = await assertRateLimit(`clerk-precheck:${clientIp(request)}`);
  if (!rate.ok) {
    return NextResponse.json(
      { error: `Espera ${rate.retryAfterSec}s antes de intentar de nuevo.`, retryAfterSec: rate.retryAfterSec },
      { status: 429 },
    );
  }

  let allowed = await isStaffUser(email);
  if (!allowed) {
    try {
      allowed = (await resolveHecomClientesForEmail(email)).length > 0;
    } catch (error) {
      logHecomOtp("error", "clerk_precheck_hecom_failed", {
        email: maskEmail(email),
        error: error instanceof Error ? error.message : String(error),
      });
      return NextResponse.json(
        { error: "No pudimos validar tu correo en este momento. Inténtalo en unos minutos." },
        { status: 503 },
      );
    }
  }
  if (!allowed) allowed = await existsInSupabase(email);

  if (!allowed) {
    logHecomOtp("info", "clerk_precheck_not_registered", { email: maskEmail(email) });
    return NextResponse.json({ error: NOT_REGISTERED }, { status: 403 });
  }

  try {
    const client = await clerkClient();
    const existing = await client.users.getUserList({ emailAddress: [email], limit: 1 });
    if (existing.data.length === 0) {
      await client.users.createUser({ emailAddress: [email], skipPasswordRequirement: true });
      logHecomOtp("info", "clerk_precheck_user_created", { email: maskEmail(email) });
    }
  } catch (error) {
    logHecomOtp("error", "clerk_precheck_clerk_failed", {
      email: maskEmail(email),
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "No pudimos preparar tu acceso. Inténtalo de nuevo." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

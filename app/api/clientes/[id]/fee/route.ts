import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session.server";
import { isHecomOtpStaffEmail } from "@/lib/auth/hecom-otp.server";
import { isPaymentsSuperAdminEmail } from "@/lib/payments/funding-roles.server";
import {
  applyFeeChange,
  listFeeChanges,
  parseFeePercent,
  previewFeeChange,
  type FeeChangeScope,
} from "@/lib/hecom/cliente-fee.server";
import { isRecord } from "@/lib/records";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Solo gerencia (correo staff), nunca un cliente. */
async function requireStaff() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  const email = String(session.email ?? "");
  if (!isHecomOtpStaffEmail(email) && !isPaymentsSuperAdminEmail(email)) {
    return { error: NextResponse.json({ error: "Solo gerencia." }, { status: 403 }) };
  }
  return { session, email };
}

function clienteIdOf(id: string): string {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("Cliente inválido.");
  return id;
}

function scopeOf(raw: unknown): FeeChangeScope {
  if (raw === "month" || raw === "from_today") return raw;
  throw new Error("Elige «Un mes» o «Desde hoy».");
}

function fail(error: unknown, status = 400) {
  return NextResponse.json({ error: error instanceof Error ? error.message : "Error." }, { status });
}

/**
 * GET → historial de cambios de %.
 * GET ?scope=month&month=2026-09&fee=7 | ?scope=from_today&fee=6 → vista previa (no cambia nada).
 */
export async function GET(request: Request, context: RouteContext) {
  const auth = await requireStaff();
  if ("error" in auth) return auth.error;
  try {
    const clienteId = clienteIdOf((await context.params).id);
    const url = new URL(request.url);
    if (!url.searchParams.get("scope")) return NextResponse.json({ history: await listFeeChanges(clienteId) });
    const preview = await previewFeeChange({
      clienteId,
      scope: scopeOf(url.searchParams.get("scope")),
      feePercent: parseFeePercent(url.searchParams.get("fee")),
      month: url.searchParams.get("month") ?? undefined,
    });
    return NextResponse.json({ preview });
  } catch (error) {
    return fail(error);
  }
}

/** POST { scope, fee, month? } → aplica el cambio en Hecom y lo deja en el historial. */
export async function POST(request: Request, context: RouteContext) {
  const auth = await requireStaff();
  if ("error" in auth) return auth.error;
  try {
    const clienteId = clienteIdOf((await context.params).id);
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) throw new Error("JSON inválido.");
    const result = await applyFeeChange({
      clienteId,
      scope: scopeOf(body.scope),
      feePercent: parseFeePercent(body.fee),
      month: typeof body.month === "string" ? body.month : undefined,
      actor: { userId: auth.session.id, email: auth.email },
    });
    return NextResponse.json(result);
  } catch (error) {
    return fail(error);
  }
}

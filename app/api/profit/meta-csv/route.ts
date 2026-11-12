import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session.server";
import { hasPermission } from "@/lib/auth/permissions";
import { getSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { callRealProfitApi } from "@/lib/realprofit/install-link.server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Plan B de Meta: el cliente sube el CSV exportado de Ads Manager.
 * Sirve para cualquiera (sin ser admin del Business, cuentas personales, sin App Review).
 * POST { csv, apply? } — apply=false devuelve la vista previa.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (!hasPermission(session.permissions, "adAccounts:read")) {
    return NextResponse.json({ error: "Permiso denegado." }, { status: 403 });
  }
  const selected = await getSelectedHecomCliente(session.id);
  if (!selected) {
    return NextResponse.json({ error: "Selecciona un cliente primero." }, { status: 400 });
  }
  const body = (await request.json().catch(() => ({}))) as { csv?: string; apply?: boolean };

  const res = await callRealProfitApi<Record<string, unknown>>("/api/holistic/meta-csv", selected.id, {
    csv: body.csv ?? "",
    apply: Boolean(body.apply),
    name: selected.name,
  });
  return NextResponse.json(
    res.ok ? res.data : { ...res.data, error: res.data.error ?? "No se pudo leer el archivo." },
    { status: res.ok ? 200 : res.status },
  );
}

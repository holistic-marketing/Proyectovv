import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session.server";
import { hasPermission } from "@/lib/auth/permissions";
import { getSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { callRealProfitApi } from "@/lib/realprofit/install-link.server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Meta en modo socio: el cliente pega el ID de su cuenta publicitaria.
 * Real Profit la valida; si ya la compartió con nuestro Business se la asigna sola,
 * y si no, le manda una solicitud de acceso para aprobar en Meta (202 pending).
 * No exige Shopify: la tienda «solo ads» se crea solo cuando la cuenta ya se ve.
 * POST { adAccountId }
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
  const body = (await request.json().catch(() => ({}))) as { adAccountId?: string };

  const res = await callRealProfitApi<{
    message?: string;
    accountName?: string;
    pending?: boolean;
    requestsUrl?: string;
  }>("/api/holistic/meta-partner", selected.id, {
    adAccountId: body.adAccountId ?? "",
    name: selected.name,
  });
  if (res.status === 202) {
    return NextResponse.json({ pending: true, ...res.data }, { status: 202 });
  }
  return NextResponse.json(
    res.ok ? { ok: true, ...res.data } : { error: res.data.error ?? "No se pudo conectar Meta." },
    { status: res.ok ? 200 : res.status },
  );
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session.server";
import { hasPermission } from "@/lib/auth/permissions";
import { getSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { buildRealProfitMetaOAuthUrl } from "@/lib/realprofit/install-link.server";

export const runtime = "nodejs";

/**
 * «Conectar con Facebook»: manda al cliente al diálogo de Facebook vía Real Profit
 * y lo trae de vuelta a /profit con ?meta=ok|error&meta_msg=.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", origin));
  }
  const back = new URL("/profit", origin);
  const fail = (msg: string) => {
    back.searchParams.set("meta", "error");
    back.searchParams.set("meta_msg", msg);
    return NextResponse.redirect(back);
  };
  if (!hasPermission(session.permissions, "adAccounts:read")) return fail("Permiso denegado.");
  const selected = await getSelectedHecomCliente(session.id);
  if (!selected) return fail("Selecciona un cliente primero.");

  const url = buildRealProfitMetaOAuthUrl(selected.id, selected.name, back.toString());
  if (!url) return fail("Falta HOLISTIC_LINK_SECRET en el servidor.");
  return NextResponse.redirect(url);
}

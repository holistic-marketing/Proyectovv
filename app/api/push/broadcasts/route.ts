import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session.server";
import { resolvePaymentsFundingCapabilities } from "@/lib/payments/funding-roles.server";
import {
  countBroadcastAudience,
  listBroadcasts,
  parseBroadcastInput,
  sendBroadcast,
  type BroadcastAudience,
} from "@/lib/push/broadcast.server";

async function requireTeam() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "No autenticado." }, { status: 401 }) };
  const caps = await resolvePaymentsFundingCapabilities({ email: session.email, role: session.role });
  if (!caps.isStaff && !caps.isSuperAdmin) {
    return { error: NextResponse.json({ error: "Permiso denegado." }, { status: 403 }) };
  }
  return { session };
}

/** GET → historial; GET ?audience=clientes → a cuántos llegaría. */
export async function GET(request: Request) {
  const auth = await requireTeam();
  if ("error" in auth) return auth.error;
  const audience = new URL(request.url).searchParams.get("audience");
  try {
    if (audience === "clientes" || audience === "todos" || audience === "prueba") {
      const count = await countBroadcastAudience(audience as BroadcastAudience, auth.session.id);
      return NextResponse.json({ ok: true, count });
    }
    return NextResponse.json({ ok: true, history: await listBroadcasts() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo leer." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireTeam();
  if ("error" in auth) return auth.error;
  let input;
  try {
    input = parseBroadcastInput(await request.json().catch(() => null));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Datos inválidos." },
      { status: 400 },
    );
  }
  try {
    const result = await sendBroadcast(input, { id: auth.session.id, email: auth.session.email });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar." },
      { status: 500 },
    );
  }
}

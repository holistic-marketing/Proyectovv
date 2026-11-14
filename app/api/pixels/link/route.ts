import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards.server";
import { getSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { linkStoredPixelToAdvertisers } from "@/lib/pixels/tiktok-pixels.server";
import { TikTokPixelApiError } from "@/lib/integrations/tiktok/pixel.server";

export const runtime = "nodejs";

/** Vincula un píxel existente a más cuentas ads del cliente seleccionado. */
export async function POST(request: Request) {
  const session = await requirePermission("adAccounts:create");
  if (!session.organizationId) {
    return NextResponse.json({ error: "Organización no disponible." }, { status: 400 });
  }

  const selected = await getSelectedHecomCliente(session.id);
  if (!selected) {
    return NextResponse.json({ error: "Selecciona un cliente primero." }, { status: 400 });
  }

  let body: { pixelRowId?: unknown; advertiserIds?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const pixelRowId = typeof body.pixelRowId === "string" ? body.pixelRowId.trim() : "";
  const advertiserIds = Array.isArray(body.advertiserIds)
    ? body.advertiserIds.filter((id): id is string => typeof id === "string")
    : [];
  if (!pixelRowId || advertiserIds.length === 0) {
    return NextResponse.json(
      { error: "Elige el píxel y al menos una cuenta." },
      { status: 400 },
    );
  }

  try {
    const result = await linkStoredPixelToAdvertisers({
      organizationId: session.organizationId,
      hecomClienteId: selected.id,
      pixelRowId,
      advertiserIds,
      userId: session.id,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo vincular el píxel.";
    const status = error instanceof TikTokPixelApiError ? 502 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

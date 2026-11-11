import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCobranaCharge } from "@/lib/payments/cobrana/client.server";

/**
 * Si el cliente vuelve a pedir una recarga Yape del MISMO monto mientras su
 * recibo anterior sigue pendiente, se le devuelve ese mismo recibo en vez de
 * crear uno nuevo y cancelar el viejo.
 *
 * Por qué: el banco (BBVA, BCP, Yape…) puede tener abierto el recibo viejo
 * mientras el cliente paga. Si lo cancelamos en ese momento, el dinero sale de
 * su cuenta pero Cobrana no lo asocia a nada (Jorge David Zerda, 10/11/2026:
 * recibo cancelado 21:48:06, pagado en BBVA 21:49, S/ 375.98).
 *
 * Solo se reutiliza si Cobrana confirma que el cargo sigue «pending» y por el
 * mismo monto; ante cualquier duda se crea uno nuevo como siempre.
 */
const REUSE_WINDOW_MS = 24 * 60 * 60 * 1000;

export type ReusableCobranaIntent = {
  id: string;
  status: string;
  amountCents: number;
  checkoutUrl: string | null;
  metadata: Record<string, unknown>;
};

export async function findReusableCobranaIntent(input: {
  organizationId: string;
  hecomClienteId: string | null;
  documentNumber: string | null;
  amountCents: number;
  currency: string;
  creditCents: number;
}): Promise<ReusableCobranaIntent | null> {
  const documentNumber = input.documentNumber?.trim();
  if (!documentNumber && !input.hecomClienteId) return null;

  let query = createAdminClient()
    .from("payment_intents")
    .select("id,status,amount_cents,currency,checkout_url,metadata,created_at")
    .eq("provider", "cobrana")
    .eq("organization_id", input.organizationId)
    .in("status", ["requires_payment", "created"])
    .eq("amount_cents", input.amountCents)
    .eq("currency", input.currency)
    .gte("created_at", new Date(Date.now() - REUSE_WINDOW_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(5);
  query = documentNumber
    ? query.eq("metadata->>customer_document_number", documentNumber)
    : query.eq("metadata->>hecom_cliente_id", input.hecomClienteId as string);

  const { data, error } = await query;
  if (error || !data) return null;

  for (const row of data) {
    const metadata = (row.metadata ?? {}) as Record<string, unknown>;
    const chargeId = String(metadata.cobrana_charge_id ?? "").trim();
    // Mismo cobro y mismo saldo a acreditar; recargas de deuda nunca se mezclan.
    if (!chargeId || metadata.skip_wallet_credit === true) continue;
    if (Number(metadata.credit_amount_cents) !== input.creditCents) continue;
    try {
      const charge = await getCobranaCharge(chargeId);
      const status = String(charge.status ?? "").toLowerCase();
      const chargeCents = Math.round(Number(charge.amount) * 100);
      if (status !== "pending" || chargeCents !== input.amountCents) continue;
    } catch {
      // Cobrana no respondió: mejor crear un recibo nuevo que adivinar.
      return null;
    }
    return {
      id: String(row.id),
      status: String(row.status),
      amountCents: Number(row.amount_cents),
      checkoutUrl: row.checkout_url ? String(row.checkout_url) : null,
      metadata,
    };
  }
  return null;
}

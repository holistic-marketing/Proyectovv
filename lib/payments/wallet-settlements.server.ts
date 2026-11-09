import "server-only";
import { cache } from "react";
import { getSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { resolveOrganizationIdForHecomCliente } from "@/lib/hecom/resolve-cliente-organization.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { HISTORICAL_SETTLEMENT_TYPE, mapWalletSettlements } from "./wallet-settlements";

export const getSelectedClientWalletSettlements = cache(async (userId: string) => {
  // The cookie is validated against the current session by this existing resolver.
  const selected = await getSelectedHecomCliente(userId);
  if (!selected) return [];
  const organizationId = await resolveOrganizationIdForHecomCliente(selected.id);
  if (!organizationId) throw new Error("No se pudo confirmar la cartera del cliente.");
  const { data, error } = await createAdminClient().from("ledger_journals")
    .select("id,organization_id,journal_type,amount_cents,currency,status,description,created_at,metadata")
    .eq("organization_id", organizationId)
    .eq("metadata->>hecom_cliente_id", selected.id)
    .eq("journal_type", HISTORICAL_SETTLEMENT_TYPE)
    .in("status", ["posted", "reversed"])
    .order("created_at", { ascending: false }).order("id", { ascending: false }).limit(50)
    .abortSignal(AbortSignal.timeout(15_000));
  if (error || !data) throw new Error("No se pudieron consultar los abonos por acuerdo.");
  return mapWalletSettlements(data, selected.id, organizationId);
});

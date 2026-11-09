export const HISTORICAL_SETTLEMENT_TYPE = "historical_balance_settlement";

export interface WalletSettlement {
  id: string;
  createdAt: string;
  amountCents: number;
  currency: string;
  description: string;
  status: "posted" | "reversed";
}

/** An agreement credit is not a new customer payment. Scope is checked again on returned rows. */
export function mapWalletSettlements(rows: unknown[], clientId: string, organizationId: string): WalletSettlement[] {
  const seen = new Set<string>();
  return rows.map((value) => {
    if (!value || typeof value !== "object") throw new Error("Movimiento de cartera inválido.");
    const row = value as Record<string, unknown>;
    const meta = row.metadata as Record<string, unknown> | null;
    const amount = typeof row.amount_cents === "number" ? row.amount_cents : Number(row.amount_cents);
    if (row.organization_id !== organizationId || meta?.hecom_cliente_id !== clientId ||
      row.journal_type !== HISTORICAL_SETTLEMENT_TYPE || typeof row.id !== "string" || seen.has(row.id) ||
      !Number.isSafeInteger(amount) || amount <= 0 || typeof row.currency !== "string" || !/^[A-Z]{3}$/.test(row.currency) ||
      typeof row.created_at !== "string" || !Number.isFinite(Date.parse(row.created_at)) ||
      (row.status !== "posted" && row.status !== "reversed")) {
      throw new Error("No se pudo verificar el movimiento de la cartera seleccionada.");
    }
    seen.add(row.id);
    return { id: row.id, createdAt: row.created_at, amountCents: amount, currency: row.currency,
      description: typeof row.description === "string" && row.description.trim() ? row.description : "Abono por acuerdo de saldo histórico a favor.", status: row.status };
  });
}

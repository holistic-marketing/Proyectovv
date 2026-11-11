import "server-only";
import { createHecomAdminClient } from "@/lib/hecom/supabase.server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Gerencia cambia el % (fee) de un cliente sin tocar código:
 *  - "month": todas las filas de gasto de ese mes (`gastos.mes`) pasan al nuevo %.
 *    Es lo que define el cobro de ese mes. El cron diario solo escribe "ayer",
 *    así que un mes pasado no vuelve al % viejo.
 *  - "from_today": el % del cliente y de todas sus cuentas TikTok. Lo ya gastado
 *    no cambia; el gasto que entre desde hoy (y las recargas prepago) usan el nuevo %.
 */

export type FeeChangeScope = "month" | "from_today";

export const FEE_MIN = 0;
export const FEE_MAX = 50;
const LIMA_TZ = "America/Lima";

export function currentMonthLima(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: LIMA_TZ, year: "numeric", month: "2-digit" }).format(now);
}

export function parseFeePercent(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(",", "."));
  if (!Number.isFinite(n) || n < FEE_MIN || n > FEE_MAX) {
    throw new Error(`El % tiene que estar entre ${FEE_MIN} y ${FEE_MAX}.`);
  }
  return Math.round(n * 100) / 100;
}

export function parseMonth(raw: unknown): string {
  const m = String(raw ?? "").trim();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)) throw new Error("Elige un mes válido.");
  if (m > currentMonthLima()) throw new Error("No se puede cambiar un mes que aún no empieza. Usa «Desde hoy».");
  return m;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

type GastoRow = { id: string; gasto: number | null; fee: number | null };

async function monthRows(clienteId: string, month: string): Promise<GastoRow[]> {
  const hecom = createHecomAdminClient();
  const rows: GastoRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await hecom
      .from("gastos")
      .select("id,gasto,fee")
      .eq("client_id", clienteId)
      .eq("mes", month)
      .order("id")
      .range(from, from + 999);
    if (error) throw new Error("No se pudo leer los gastos del mes en Hecom.");
    rows.push(...((data ?? []) as GastoRow[]));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

function feeOf(rows: GastoRow[], pct: (r: GastoRow) => number): number {
  return round2(rows.reduce((acc, r) => acc + Math.max(0, Number(r.gasto) || 0) * (pct(r) / 100), 0));
}

async function clienteFees(clienteId: string) {
  const hecom = createHecomAdminClient();
  const [cli, cuentas] = await Promise.all([
    hecom.from("clientes").select("id,name,tiktok_default_fee").eq("id", clienteId).maybeSingle(),
    hecom.from("cliente_tiktok_cuentas").select("advertiser_id,fee").eq("client_id", clienteId),
  ]);
  if (cli.error || !cli.data) throw new Error("No encontré al cliente en Hecom.");
  if (cuentas.error) throw new Error("No se pudo leer las cuentas del cliente en Hecom.");
  const accountFees = (cuentas.data ?? []).map((c) => (c.fee == null ? null : Number(c.fee)));
  return {
    name: String(cli.data.name ?? ""),
    defaultFee: cli.data.tiktok_default_fee == null ? null : Number(cli.data.tiktok_default_fee),
    accountFees,
    accounts: accountFees.length,
  };
}

export type FeeChangePreview =
  | {
      scope: "month";
      month: string;
      feePercent: number;
      rows: number;
      spend: number;
      /** % que hoy tienen las filas del mes (puede haber más de uno). */
      currentFees: number[];
      feeBefore: number;
      feeAfter: number;
      /** Diferencia que se suma (o resta) a lo que el cliente debe de ese mes. */
      delta: number;
      pastMonth: boolean;
      currentMonth: boolean;
      clienteDefaultFee: number | null;
    }
  | {
      scope: "from_today";
      feePercent: number;
      clienteDefaultFee: number | null;
      currentFees: number[];
      accounts: number;
    };

function distinct(values: Array<number | null>): number[] {
  return [...new Set(values.filter((v): v is number => v != null && Number.isFinite(v)).map(round2))].sort((a, b) => a - b);
}

export async function previewFeeChange(input: {
  clienteId: string;
  scope: FeeChangeScope;
  feePercent: number;
  month?: string;
}): Promise<FeeChangePreview> {
  const fees = await clienteFees(input.clienteId);
  if (input.scope === "from_today") {
    return {
      scope: "from_today",
      feePercent: input.feePercent,
      clienteDefaultFee: fees.defaultFee,
      currentFees: distinct([fees.defaultFee, ...fees.accountFees]),
      accounts: fees.accounts,
    };
  }
  const month = parseMonth(input.month);
  const rows = await monthRows(input.clienteId, month);
  // Igual que la deuda de Hecom (credito-deuda-core): fila sin % = 0 %.
  const feeBefore = feeOf(rows, (r) => Number(r.fee) || 0);
  const feeAfter = feeOf(rows, () => input.feePercent);
  const now = currentMonthLima();
  return {
    scope: "month",
    month,
    feePercent: input.feePercent,
    rows: rows.length,
    spend: round2(rows.reduce((acc, r) => acc + Math.max(0, Number(r.gasto) || 0), 0)),
    currentFees: distinct(rows.map((r) => (r.fee == null ? null : Number(r.fee)))),
    feeBefore,
    feeAfter,
    delta: round2(feeAfter - feeBefore),
    pastMonth: month < now,
    currentMonth: month === now,
    clienteDefaultFee: fees.defaultFee,
  };
}

export async function applyFeeChange(input: {
  clienteId: string;
  scope: FeeChangeScope;
  feePercent: number;
  month?: string;
  actor: { userId: string; email: string };
}): Promise<{ preview: FeeChangePreview; updated: number }> {
  const preview = await previewFeeChange(input);
  const hecom = createHecomAdminClient();
  let updated = 0;

  if (preview.scope === "month") {
    const { data, error } = await hecom
      .from("gastos")
      .update({ fee: preview.feePercent })
      .eq("client_id", input.clienteId)
      .eq("mes", preview.month)
      .select("id");
    if (error) throw new Error("Hecom no guardó el cambio del mes. No se cambió nada.");
    updated = data?.length ?? 0;
  } else {
    const cli = await hecom.from("clientes").update({ tiktok_default_fee: preview.feePercent }).eq("id", input.clienteId);
    if (cli.error) throw new Error("Hecom no guardó el % del cliente. No se cambió nada.");
    const cuentas = await hecom
      .from("cliente_tiktok_cuentas")
      .update({ fee: preview.feePercent })
      .eq("client_id", input.clienteId)
      .select("advertiser_id");
    if (cuentas.error) {
      // Deja todo como estaba para no quedar a medias (cliente nuevo %, cuentas viejo %).
      await hecom.from("clientes").update({ tiktok_default_fee: preview.clienteDefaultFee }).eq("id", input.clienteId);
      throw new Error("Hecom no guardó el % de las cuentas. No se cambió nada.");
    }
    updated = cuentas.data?.length ?? 0;
  }

  await createAdminClient()
    .from("audit_logs")
    .insert({
      actor_user_id: input.actor.userId,
      action: "hecom.fee_change",
      entity_type: "hecom_cliente",
      entity_id: input.clienteId,
      metadata: { by: input.actor.email, updated, ...preview },
    })
    .then(
      () => undefined,
      () => undefined,
    );

  return { preview, updated };
}

export type FeeChangeLog = {
  at: string;
  by: string;
  scope: FeeChangeScope;
  month: string | null;
  feePercent: number;
  from: number[];
  delta: number | null;
};

export async function listFeeChanges(clienteId: string, limit = 15): Promise<FeeChangeLog[]> {
  const { data } = await createAdminClient()
    .from("audit_logs")
    .select("created_at,metadata")
    .eq("action", "hecom.fee_change")
    .eq("entity_type", "hecom_cliente")
    .eq("entity_id", clienteId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => {
    const m = (row.metadata ?? {}) as Record<string, unknown>;
    return {
      at: String(row.created_at),
      by: String(m.by ?? "—"),
      scope: m.scope === "month" ? "month" : "from_today",
      month: typeof m.month === "string" ? m.month : null,
      feePercent: Number(m.feePercent ?? 0),
      from: Array.isArray(m.currentFees) ? (m.currentFees as unknown[]).map(Number) : [],
      delta: typeof m.delta === "number" ? m.delta : null,
    };
  });
}

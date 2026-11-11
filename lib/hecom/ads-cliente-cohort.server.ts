import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE = 1000;

/** Ids de cliente Hecom de una tabla, paginando con conteo exacto para no perder filas. */
async function collectClienteIds(table: "hecom_cliente_user_links" | "payment_intents"): Promise<string[]> {
  const admin = createAdminClient();
  const ids: string[] = [];
  let total: number | null = null;
  for (let offset = 0; total === null || offset < total; offset += PAGE) {
    let query = admin.from(table).select(
      table === "payment_intents" ? "id,hecom_cliente_id:metadata->>hecom_cliente_id" : "user_id,hecom_cliente_id",
      { count: "exact" },
    );
    if (table === "payment_intents") query = query.eq("status", "succeeded").order("id");
    else query = query.order("hecom_cliente_id").order("user_id");
    const { data, error, count } = await query.range(offset, offset + PAGE - 1);
    if (error || count === null || !Array.isArray(data)) throw new Error("No se pudo comprobar el catálogo de AdsHolistic.");
    if (total !== null && total !== count) throw new Error("El catálogo cambió durante la consulta. Vuelve a intentar.");
    total = count;
    if (data.length !== Math.min(PAGE, Math.max(0, total - offset))) {
      throw new Error("La consulta de clientes de AdsHolistic está incompleta.");
    }
    for (const row of data as unknown as { hecom_cliente_id: unknown }[]) {
      const id = String(row.hecom_cliente_id ?? "").trim();
      if (id) ids.push(id);
    }
  }
  return ids;
}

/** Operational membership, not proof of a credit contract or an unpaid balance. */
export async function listAdsHolisticClienteIds(): Promise<Set<string>> {
  // Las dos tablas son independientes: se consultan a la vez.
  const [linked, paid] = await Promise.all([
    collectClienteIds("hecom_cliente_user_links"),
    collectClienteIds("payment_intents"),
  ]);
  return new Set([...linked, ...paid]);
}

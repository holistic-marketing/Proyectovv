import { getSelectedClientWalletSettlements } from "@/lib/payments/wallet-settlements.server";

export async function WalletAgreementMovements({ userId }: { userId: string }) {
  let rows;
  try {
    rows = await getSelectedClientWalletSettlements(userId);
  } catch {
    return <section aria-label="Abonos por acuerdo" role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">No se pudieron consultar los abonos por acuerdo de esta cartera. Vuelve a cargar para intentarlo.</section>;
  }
  if (!rows.length) return null;
  return (
    <section id="abonos-por-acuerdo" aria-label="Abonos por acuerdo" className="overflow-hidden rounded-2xl border border-[var(--auth-border)] bg-white">
      <header className="border-b border-[var(--auth-divider)] px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-[var(--auth-text)]">Movimientos de cartera · abonos por acuerdo</h2>
        <p className="mt-1 text-sm text-[var(--auth-text-muted)]">Acuerdos sobre saldos históricos a favor. No son nuevos pagos bancarios ni nuevos cobros en Hecom.</p>
      </header>
      <ul className="divide-y divide-[var(--auth-divider)]">
        {rows.map((row) => (
          <li key={row.id} className="px-5 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-semibold text-[var(--auth-text)]">Abono por acuerdo de saldo a favor</p>
                <p className="mt-1 text-xs text-[var(--auth-text-muted)]">{new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short" }).format(new Date(row.createdAt))} · Hora de Lima</p></div>
              <div className="text-right"><p className="font-semibold tabular-nums text-[var(--auth-text)]">{new Intl.NumberFormat("es-PE", { style: "currency", currency: row.currency }).format(row.amountCents / 100)}</p><p className="text-xs text-[var(--auth-text-muted)]">{row.status === "posted" ? "Acreditado en cartera" : "Anulado · no disponible por este abono"}</p></div>
            </div>
            <p className="mt-3 break-words text-sm leading-6 text-[var(--auth-text)]">{row.description}</p>
            <p className="mt-2 break-all text-xs text-[var(--auth-text-muted)]">Referencia del movimiento: {row.id}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

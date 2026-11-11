"use client";

import { useCallback, useEffect, useState } from "react";

type Scope = "month" | "from_today";
type Preview =
  | {
      scope: "month";
      month: string;
      feePercent: number;
      rows: number;
      spend: number;
      currentFees: number[];
      feeBefore: number;
      feeAfter: number;
      delta: number;
      pastMonth: boolean;
      currentMonth: boolean;
      clienteDefaultFee: number | null;
    }
  | { scope: "from_today"; feePercent: number; clienteDefaultFee: number | null; currentFees: number[]; accounts: number };
type Log = { at: string; by: string; scope: Scope; month: string | null; feePercent: number; from: number[]; delta: number | null };

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1] ?? m} ${y}`;
}

function limaMonth(offset = 0): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const pcts = (list: number[]) => (list.length ? list.map((p) => `${p}%`).join(" / ") : "sin %");

const field =
  "h-10 w-full rounded-xl bg-[#faf8f5] px-3 text-[14px] ring-1 ring-[#e8e1d8] focus:outline-none focus:ring-2 focus:ring-[#ff781f]";
const primary =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[#ff781f] px-4 text-[13px] font-semibold text-white transition hover:bg-[#e85a1c] disabled:opacity-50";
const ghost =
  "inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-[13px] font-semibold text-[#5c564e] ring-1 ring-[#e8e1d8] hover:bg-[#faf8f5] disabled:opacity-50";

/** Solo gerencia: cambiar el % del cliente para un mes o desde hoy, con vista previa e historial. */
export function ClienteFeeCard({ clienteId, currentFee }: { clienteId: string; currentFee: number | null }) {
  const api = `/api/clientes/${clienteId}/fee`;
  const [fee, setFee] = useState<number | null>(currentFee);
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<Scope>("month");
  const [month, setMonth] = useState(() => limaMonth(-1));
  const [pct, setPct] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [history, setHistory] = useState<Log[] | null>(null);

  const loadHistory = useCallback(() => {
    fetch(api, { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((j: { history?: Log[] }) => setHistory(j.history ?? []))
      .catch(() => setHistory([]));
  }, [api]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function reset() {
    setPreview(null);
    setError(null);
  }

  async function check() {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const q = new URLSearchParams({ scope, fee: pct.replace(",", ".") });
      if (scope === "month") q.set("month", month);
      const res = await fetch(`${api}?${q}`, { credentials: "include", cache: "no-store" });
      const j = (await res.json().catch(() => ({}))) as { preview?: Preview; error?: string };
      if (!res.ok || !j.preview) throw new Error(j.error || "No se pudo calcular.");
      setPreview(j.preview);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo calcular.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!preview) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(api, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: preview.scope, fee: preview.feePercent, month: preview.scope === "month" ? preview.month : undefined }),
      });
      const j = (await res.json().catch(() => ({}))) as { updated?: number; error?: string };
      if (!res.ok) throw new Error(j.error || "No se guardó.");
      setDone(
        preview.scope === "month"
          ? `Listo: ${monthLabel(preview.month)} quedó en ${preview.feePercent}% (${j.updated ?? 0} filas de gasto).`
          : `Listo: desde hoy se cobra ${preview.feePercent}% (cliente y ${j.updated ?? 0} cuenta(s)).`,
      );
      if (preview.scope === "from_today") setFee(preview.feePercent);
      setPreview(null);
      setOpen(false);
      setPct("");
      loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se guardó.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#1c1917]">Comisión (%)</h2>
          <p className="text-[13px] text-[#6f675f]">
            Hoy se le cobra <strong className="text-[#1c1917]">{fee != null ? `${fee}%` : "10% (sin % propio)"}</strong> sobre su gasto.
          </p>
        </div>
        {open ? null : (
          <button
            type="button"
            className={primary}
            onClick={() => {
              setOpen(true);
              setDone(null);
            }}
          >
            Cambiar %
          </button>
        )}
      </div>

      {done ? <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[13px] text-emerald-900 ring-1 ring-emerald-200">{done}</p> : null}

      {open ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Desde cuándo">
            {(
              [
                ["month", "Un mes", "Cambia el cobro de ese mes"],
                ["from_today", "Desde hoy", "Lo de antes no cambia"],
              ] as const
            ).map(([value, title, hint]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={scope === value}
                onClick={() => {
                  setScope(value);
                  reset();
                }}
                className={`rounded-xl px-3 py-2 text-left ring-1 transition ${
                  scope === value ? "bg-[#fff4ec] ring-2 ring-[#ff781f]" : "bg-white ring-[#e8e1d8] hover:ring-[#d6cbbf]"
                }`}
              >
                <span className="block text-[13px] font-semibold text-[#1c1917]">{title}</span>
                <span className="block text-[11px] text-[#6f675f]">{hint}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {scope === "month" ? (
              <label className="block">
                <span className="text-[12px] font-semibold text-[#5c564e]">Mes</span>
                <input
                  type="month"
                  value={month}
                  max={limaMonth(0)}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    reset();
                  }}
                  className={`${field} mt-1`}
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-[12px] font-semibold text-[#5c564e]">Nuevo %</span>
              <input
                inputMode="decimal"
                value={pct}
                placeholder="ej. 7"
                onChange={(e) => {
                  setPct(e.target.value.replace(/[^\d.,]/g, ""));
                  reset();
                }}
                className={`${field} mt-1`}
              />
            </label>
          </div>

          {preview ? (
            <div className="space-y-2 rounded-xl bg-[#faf8f5] px-3 py-3 text-[13px] text-[#1c1917] ring-1 ring-[#e8e1d8]">
              {preview.scope === "month" ? (
                <>
                  <p>
                    <strong>{monthLabel(preview.month)}</strong>: gasto {usd(preview.spend)} en {preview.rows} filas, hoy a {pcts(preview.currentFees)}.
                  </p>
                  <p>
                    Comisión del mes: {usd(preview.feeBefore)} → <strong>{usd(preview.feeAfter)}</strong> ({preview.feePercent}%).{" "}
                    {preview.delta === 0 ? "Sin cambio." : preview.delta > 0 ? `Le suma ${usd(preview.delta)}.` : `Le baja ${usd(-preview.delta)}.`}
                  </p>
                  {preview.rows === 0 ? <p className="text-amber-800">Ese mes no tiene gasto registrado: no hay nada que cambiar.</p> : null}
                  {preview.pastMonth && preview.delta !== 0 ? (
                    <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-amber-900 ring-1 ring-amber-200">
                      Ojo: si este mes ya se le cobró o ya lo pagó, su deuda cambia en {usd(Math.abs(preview.delta))}
                      {preview.delta > 0 ? " (le quedará debiendo eso)" : " (le quedará saldo a favor)"}.
                    </p>
                  ) : null}
                  {preview.currentMonth ? (
                    <p className="text-[12px] text-[#6f675f]">
                      Este mes sigue en curso: los días que falten entran con su % actual ({preview.clienteDefaultFee ?? 10}%). Si quieres que siga
                      así, cambia también «Desde hoy».
                    </p>
                  ) : null}
                </>
              ) : (
                <p>
                  Pasa de {pcts(preview.currentFees)} a <strong>{preview.feePercent}%</strong> en el cliente y sus {preview.accounts} cuenta(s). Lo
                  gastado hasta ayer no cambia; el gasto de hoy en adelante y sus recargas usan {preview.feePercent}%.
                </p>
              )}
            </div>
          ) : null}

          {error ? <p className="rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-950 ring-1 ring-amber-200">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            {preview && !(preview.scope === "month" && preview.rows === 0) ? (
              <button type="button" className={primary} disabled={busy} onClick={() => void save()}>
                {busy ? "Guardando…" : `Confirmar ${preview.feePercent}%`}
              </button>
            ) : (
              <button type="button" className={primary} disabled={busy || !pct} onClick={() => void check()}>
                {busy ? "Calculando…" : "Ver cómo queda"}
              </button>
            )}
            <button
              type="button"
              className={ghost}
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setPct("");
                reset();
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {history && history.length ? (
        <div className="mt-4 border-t border-[#f1ebe3] pt-3">
          <p className="text-[12px] font-semibold text-[#5c564e]">Historial</p>
          <ul className="mt-1 space-y-1 text-[12px] text-[#6f675f]">
            {history.map((h) => (
              <li key={h.at}>
                {new Date(h.at).toLocaleString("es-PE", { timeZone: "America/Lima", dateStyle: "short", timeStyle: "short" })} ·{" "}
                <strong className="text-[#1c1917]">
                  {h.scope === "month" && h.month ? monthLabel(h.month) : "Desde hoy"}: {pcts(h.from)} → {h.feePercent}%
                </strong>
                {h.delta ? ` (${h.delta > 0 ? "+" : "−"}${usd(Math.abs(h.delta))})` : ""} · {h.by}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

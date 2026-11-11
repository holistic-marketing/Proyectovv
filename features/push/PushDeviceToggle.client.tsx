"use client";

import { useEffect, useState } from "react";
import { disablePush, enablePush, readPushState, unblockSteps, type PushState } from "@/features/push/push-client";

/** Fila en la campanita: avisos de este dispositivo, con interruptor. */
export function PushDeviceToggle() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void readPushState().then((s) => {
      if (!cancelled) setState(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === null || state === "unsupported") return null;

  const on = state === "on";
  const hint =
    state === "on"
      ? "Te llegan aunque no tengas la app abierta."
      : state === "denied"
        ? "Están bloqueados en este navegador."
        : state === "ios-install"
          ? "En iPhone, agrega la app a tu inicio para recibirlos."
          : "Actívalos para enterarte al instante.";

  async function toggle() {
    if (state === "denied") {
      setShowSteps((v) => !v);
      return;
    }
    if (state === "ios-install") return;
    setBusy(true);
    try {
      setState(on ? await disablePush() : await enablePush());
    } catch (error) {
      console.error("[push] no se pudo cambiar", error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-[var(--border-subtle)] px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-[#141210]">Avisos en este dispositivo</p>
          <p className="text-[11.5px] text-[#6b645c]">{hint}</p>
        </div>
        {state === "denied" ? (
          <button
            type="button"
            onClick={() => void toggle()}
            className="shrink-0 rounded-lg px-2 py-1 text-[11.5px] font-semibold text-[var(--brand-primary-deep)] hover:bg-[var(--brand-primary)]/10"
          >
            {showSteps ? "Ocultar" : "Cómo activar"}
          </button>
        ) : state === "ios-install" ? null : (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Avisos en este dispositivo"
            disabled={busy}
            onClick={() => void toggle()}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
              on ? "bg-[var(--brand-primary)]" : "bg-[#d9d1c7]"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                on ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        )}
      </div>
      {state === "denied" && showSteps ? (
        <ol className="mt-2 list-decimal space-y-0.5 rounded-xl bg-[var(--surface-soft)] py-2 pl-7 pr-3 text-[11.5px] text-[#3f3a35]">
          {unblockSteps().map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

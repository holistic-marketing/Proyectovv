"use client";

import { useEffect, useState } from "react";
import { enablePush, readPushState, resyncPushIfGranted } from "@/features/push/push-client";

/** "Ahora no" no es "nunca": se vuelve a ofrecer pasada una semana. */
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const PUSH_SNOOZE_KEY = "holistic-push-snooze-until";
const INSTALL_SNOOZE_KEY = "holistic-install-snooze-until";
/** Que el cliente vea primero su panel; la invitación entra después. */
const SHOW_DELAY_MS = 500;

// Safari en modo privado (y bloqueos de cookies) puede lanzar al tocar localStorage.
function snoozed(key: string): boolean {
  try {
    return Number(window.localStorage.getItem(key) ?? 0) > Date.now();
  } catch {
    return false;
  }
}

function snooze(key: string) {
  try {
    window.localStorage.setItem(key, String(Date.now() + SNOOZE_MS));
  } catch {
    // Sin almacenamiento: se oculta solo por esta visita.
  }
}

type Mode = "hidden" | "push" | "install" | "done";

function BellMark() {
  return (
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fbefe6] text-[var(--brand-primary)]">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--brand-primary)] ring-2 ring-white" />
    </span>
  );
}

/** Así se ve un aviso en el celular: ayuda a entender qué se está activando. */
function SamplePush() {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-[#f6f3ef] px-2.5 py-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" className="h-7 w-7 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[12px] font-semibold text-[#1c1917]">Recarga acreditada</p>
          <span className="shrink-0 text-[10.5px] text-[#9a9187]">ahora</span>
        </div>
        <p className="truncate text-[11.5px] text-[#6b645c]">Ya tienes $100 de saldo para pautar.</p>
      </div>
    </div>
  );
}

export function HomeScreenAppBanner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void resyncPushIfGranted();
    const timer = window.setTimeout(() => {
      void readPushState().then((state) => {
        if (cancelled) return;
        if (state === "off" && !snoozed(PUSH_SNOOZE_KEY)) setMode("push");
        else if (state === "ios-install" && !snoozed(INSTALL_SNOOZE_KEY)) setMode("install");
      });
    }, SHOW_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (mode !== "done") return;
    const timer = window.setTimeout(() => setMode("hidden"), 3500);
    return () => window.clearTimeout(timer);
  }, [mode]);

  async function activate() {
    setBusy(true);
    setError(null);
    try {
      const state = await enablePush();
      if (state === "on") setMode("done");
      else {
        // Lo rechazó en el diálogo del navegador: no insistir esta semana.
        snooze(PUSH_SNOOZE_KEY);
        setMode("hidden");
      }
    } catch (err) {
      console.error("[push] no se pudo activar", err);
      setError("No se pudo activar. Intenta de nuevo en un momento.");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-label="Avisos de Ads Holistic"
      className="pointer-events-none fixed right-3 top-[calc(4rem+env(safe-area-inset-top))] z-30 w-[min(20rem,calc(100vw-1.5rem))] sm:right-5 sm:top-[calc(4.5rem+env(safe-area-inset-top))] lg:right-6"
    >
      <div className="push-invite pointer-events-auto rounded-2xl border border-[#ece4da] bg-white p-4 shadow-[0_18px_44px_-20px_rgb(28_25_23_/_0.5)]">
        {mode === "done" ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#1c1917]">Avisos activados</p>
              <p className="text-[12.5px] text-[#6b645c]">Te avisamos al instante, aunque no tengas la app abierta.</p>
            </div>
          </div>
        ) : mode === "push" ? (
          <>
            <div className="flex items-start gap-3">
              <BellMark />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-tight text-[#1c1917]">Entérate al instante</p>
                <p className="mt-1 text-[12.5px] leading-snug text-[#6b645c]">
                  Te avisamos cuando se acredita tu recarga y te contamos las novedades de Ads Holistic.
                </p>
              </div>
            </div>
            <SamplePush />
            {error ? <p className="mt-2 text-[12px] text-amber-800">{error}</p> : null}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void activate()}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-3 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-primary-deep)] disabled:opacity-60"
              >
                {busy ? "Activando…" : "Activar avisos"}
              </button>
              <button
                type="button"
                disabled={busy}
                className="inline-flex h-9 items-center rounded-xl px-3 text-[13px] font-semibold text-[#6b645c] transition hover:bg-[#f6f3ef] disabled:opacity-60"
                onClick={() => {
                  snooze(PUSH_SNOOZE_KEY);
                  setMode("hidden");
                }}
              >
                Ahora no
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold leading-tight text-[#1c1917]">Ten Ads Holistic como app</p>
                <p className="mt-1 text-[12.5px] leading-snug text-[#6b645c]">
                  En iPhone los avisos solo llegan si la abres desde tu pantalla de inicio. Además no se te cierra la sesión.
                </p>
              </div>
            </div>
            <ol className="mt-3 space-y-1.5 rounded-xl bg-[#f6f3ef] px-3 py-2.5 text-[12.5px] text-[#3f3a35]">
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[var(--brand-primary)]">1</span>
                <span className="flex items-center gap-1">
                  Toca
                  <svg className="h-4 w-4 text-[#007aff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-label="Compartir">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                  </svg>
                  Compartir en Safari
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[var(--brand-primary)]">2</span>
                «Agregar a inicio»
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[var(--brand-primary)]">3</span>
                Ábrela desde el ícono y activa los avisos
              </li>
            </ol>
            <button
              type="button"
              className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl text-[13px] font-semibold text-[#6b645c] ring-1 ring-[#ece4da] transition hover:bg-[#f6f3ef]"
              onClick={() => {
                snooze(INSTALL_SNOOZE_KEY);
                setMode("hidden");
              }}
            >
              Entendido
            </button>
          </>
        )}
      </div>
    </div>
  );
}

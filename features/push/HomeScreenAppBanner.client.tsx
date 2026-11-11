"use client";

import { useEffect, useState } from "react";
import { enablePush, readPushState, resyncPushIfGranted } from "@/features/push/push-client";

/** "Ahora no" no es "nunca": se vuelve a ofrecer pasada una semana. */
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
const PUSH_SNOOZE_KEY = "holistic-push-snooze-until";
const INSTALL_SNOOZE_KEY = "holistic-install-snooze-until";
/** Que el cliente vea primero su panel; la invitación entra después. */
const SHOW_DELAY_MS = 500;
const LEAVE_MS = 220;

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

const ICON_TILE =
  "push-icon-pop relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-white";

function BellMark() {
  return (
    <span
      className={`${ICON_TILE} bg-gradient-to-b from-[var(--brand-primary)] to-[var(--brand-primary-deep)] shadow-[0_8px_18px_-8px_rgb(184_95_46_/_0.85)]`}
    >
      <svg className="push-bell-ring h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
    </span>
  );
}

/** Así se ve un aviso: ayuda a entender qué se está activando. */
function SamplePush() {
  return (
    <div className="mt-3.5 flex items-start gap-2.5 rounded-2xl border border-[#efe8df] bg-gradient-to-b from-[#fbf8f5] to-[#f4efe8] px-3 py-2.5 shadow-[0_1px_0_rgb(255_255_255)_inset]">
      <span className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="h-8 w-8 rounded-[9px]" />
        <span className="absolute -bottom-1 -right-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-[#f8f4ef]">
          <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.4} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[12.5px] font-semibold text-[#1c1917]">Recarga acreditada</p>
          <span className="shrink-0 text-[10.5px] text-[#9a9187]">ahora</span>
        </div>
        <p className="truncate text-[12px] text-[#6b645c]">Ya tienes $100 de saldo para pautar.</p>
      </div>
    </div>
  );
}

const PRIMARY_BTN =
  "inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-[var(--brand-primary)] to-[var(--brand-primary-deep)] px-4 text-[13.5px] font-semibold text-white shadow-[0_8px_18px_-8px_rgb(184_95_46_/_0.85)] transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60";
const GHOST_BTN =
  "inline-flex h-10 items-center justify-center rounded-full px-4 text-[13.5px] font-semibold text-[#6b645c] transition hover:bg-[#f3eee8] active:scale-[0.98] disabled:opacity-60";

export function HomeScreenAppBanner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Sale con animación y después se desmonta. */
  function hide() {
    setLeaving(true);
    window.setTimeout(() => {
      setMode("hidden");
      setLeaving(false);
    }, LEAVE_MS);
  }

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
    const timer = window.setTimeout(() => {
      setLeaving(true);
      window.setTimeout(() => {
        setMode("hidden");
        setLeaving(false);
      }, LEAVE_MS);
    }, 3500);
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
        hide();
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
      // Celular: hoja abajo, a mano del pulgar. PC: arriba a la derecha, junto a la campanita.
      className="push-stage pointer-events-none fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-[60] sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-[calc(4.5rem+env(safe-area-inset-top))] sm:w-[22rem] lg:right-6"
    >
      <div
        data-leaving={leaving ? "true" : undefined}
        className="push-sheet pointer-events-auto relative overflow-hidden rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_1px_0_rgb(255_255_255)_inset,0_2px_8px_-2px_rgb(28_25_23_/_0.12),0_30px_70px_-24px_rgb(28_25_23_/_0.6)] ring-1 ring-[#1c1917]/[0.06] backdrop-blur-xl sm:p-[18px]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-primary)]/50 to-transparent"
        />
        {mode === "done" ? (
          <div className="flex items-center gap-3">
            <span
              className={`${ICON_TILE} bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_8px_18px_-8px_rgb(5_150_105_/_0.8)]`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1c1917]">Avisos activados</p>
              <p className="text-[12.5px] leading-snug text-[#6b645c]">
                Te avisamos al instante, aunque no tengas la app abierta.
              </p>
            </div>
          </div>
        ) : mode === "push" ? (
          <>
            <div className="flex items-start gap-3">
              <BellMark />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[#1c1917]">
                  Entérate al instante
                </p>
                <p className="mt-1 text-[12.5px] leading-snug text-[#6b645c]">
                  Te avisamos cuando se acredita tu recarga y te contamos las novedades de Ads Holistic.
                </p>
              </div>
            </div>
            <SamplePush />
            {error ? <p className="mt-2 text-[12px] text-amber-800">{error}</p> : null}
            <div className="mt-3.5 flex items-center gap-2">
              <button type="button" disabled={busy} onClick={() => void activate()} className={`${PRIMARY_BTN} flex-1`}>
                {busy ? "Activando…" : "Activar avisos"}
              </button>
              <button
                type="button"
                disabled={busy}
                className={GHOST_BTN}
                onClick={() => {
                  snooze(PUSH_SNOOZE_KEY);
                  hide();
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
              <img
                src="/icon-192.png"
                alt=""
                className="push-icon-pop h-11 w-11 shrink-0 rounded-[13px] shadow-[0_8px_18px_-8px_rgb(184_95_46_/_0.8)]"
              />
              <div className="min-w-0">
                <p className="text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[#1c1917]">
                  Ten Ads Holistic como app
                </p>
                <p className="mt-1 text-[12.5px] leading-snug text-[#6b645c]">
                  En iPhone los avisos solo llegan si la abres desde tu pantalla de inicio. Además no se te cierra la sesión.
                </p>
              </div>
            </div>
            <ol className="mt-3.5 space-y-2 rounded-2xl border border-[#efe8df] bg-gradient-to-b from-[#fbf8f5] to-[#f4efe8] px-3 py-3 text-[12.5px] text-[#3f3a35]">
              {[
                <span key="1" className="flex items-center gap-1">
                  Toca
                  <svg className="h-4 w-4 text-[#007aff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-label="Compartir">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                  </svg>
                  Compartir en Safari
                </span>,
                "«Agregar a inicio»",
                "Ábrela desde el ícono y activa los avisos",
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[var(--brand-primary)] to-[var(--brand-primary-deep)] text-[10.5px] font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <button
              type="button"
              className={`${GHOST_BTN} mt-3 w-full ring-1 ring-[#ece4da]`}
              onClick={() => {
                snooze(INSTALL_SNOOZE_KEY);
                hide();
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

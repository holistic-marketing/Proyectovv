"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Toast = { id: number; title: string; body: string; url: string; actionLabel: string };

/** Avisa a la campanita que hay algo nuevo (recarga su lista y el punto rojo). */
export const NOTIFICATIONS_REFRESH_EVENT = "holistic-notifications-refresh";

const VISIBLE_MS = 9000;
const MAX_TOASTS = 3;

function kindOf(title: string): "ok" | "bad" | "promo" {
  if (/rechaz|fall|vencid|deuda/i.test(title)) return "bad";
  if (/acredit|aprob|listo|activad/i.test(title)) return "ok";
  return "promo";
}

function KindIcon({ kind }: { kind: "ok" | "bad" | "promo" }) {
  if (kind === "ok") {
    return (
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  if (kind === "bad") {
    return (
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
  );
}

/**
 * Cuando llega un push con la app abierta, lo mostramos también dentro de la
 * página con nuestro diseño. Así el cliente lo ve aunque Windows o el celular
 * escondan las notificaciones de Chrome.
 */
export function InAppPushToasts() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    let seq = 0;
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; payload?: Partial<Toast> } | null;
      if (!data || data.type !== "holistic-push" || !data.payload) return;
      const p = data.payload;
      seq += 1;
      const toast: Toast = {
        id: Date.now() + seq,
        title: String(p.title ?? "Ads Holistic"),
        body: String(p.body ?? ""),
        url: typeof p.url === "string" && p.url.startsWith("/") ? p.url : "/overview",
        actionLabel: String(p.actionLabel ?? ""),
      };
      setToasts((list) => [toast, ...list].slice(0, MAX_TOASTS));
      window.dispatchEvent(new Event(NOTIFICATIONS_REFRESH_EVENT));
      window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== toast.id)), VISIBLE_MS);
    }
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-3 top-[calc(4rem+env(safe-area-inset-top))] z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-2 sm:right-5 lg:right-6"
    >
      {toasts.map((t) => {
        const kind = kindOf(t.title);
        return (
          <div
            key={t.id}
            className="push-invite pointer-events-auto overflow-hidden rounded-2xl border border-[#ece4da] bg-white shadow-[0_18px_44px_-18px_rgb(28_25_23_/_0.55)]"
          >
            <div className="flex items-start gap-3 p-3.5">
              <KindIcon kind={kind} />
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  setToasts((list) => list.filter((x) => x.id !== t.id));
                  router.push(t.url);
                }}
              >
                <p className="text-[14px] font-semibold leading-tight text-[#1c1917]">{t.title}</p>
                {t.body ? <p className="mt-1 line-clamp-3 text-[12.5px] leading-snug text-[#5c564e]">{t.body}</p> : null}
                {t.actionLabel ? (
                  <span className="mt-2 inline-flex h-8 items-center rounded-lg bg-[var(--brand-primary)] px-3 text-[12.5px] font-semibold text-white">
                    {t.actionLabel}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
                className="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#9a9187] hover:bg-[#f6f3ef] hover:text-[#1c1917]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-0.5 bg-[#f1ebe3]">
              <div className="push-toast-timer h-full bg-[var(--brand-primary)]" style={{ animationDuration: `${VISIBLE_MS}ms` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

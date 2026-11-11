"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Toast = { id: number; title: string; body: string; url: string; actionLabel: string };
type Kind = "ok" | "bad" | "promo";

/** Avisa a la campanita que hay algo nuevo (recarga su lista y el punto rojo). */
export const NOTIFICATIONS_REFRESH_EVENT = "holistic-notifications-refresh";

const VISIBLE_MS = 9000;
const LEAVE_MS = 240;
const MAX_TOASTS = 3;
/** Cuánto hay que deslizar hacia arriba para descartarlo con el dedo. */
const SWIPE_CLOSE_PX = 36;

function kindOf(title: string): Kind {
  if (/rechaz|fall|vencid|deuda/i.test(title)) return "bad";
  if (/acredit|aprob|listo|activad/i.test(title)) return "ok";
  return "promo";
}

/** Sello pequeño sobre el logo: verde si salió bien, rojo si hay que revisar. */
function KindSeal({ kind }: { kind: Kind }) {
  if (kind === "promo") return null;
  const ok = kind === "ok";
  return (
    <span
      className={`absolute -bottom-1 -right-1 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-white ring-2 ring-white ${
        ok ? "bg-emerald-500" : "bg-red-500"
      }`}
    >
      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.2} aria-hidden>
        {ok ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v7m0 4.5h.01" />
        )}
      </svg>
    </span>
  );
}

function ToastCard({
  toast,
  onDismiss,
  onOpen,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
  onOpen: (toast: Toast) => void;
}) {
  const kind = kindOf(toast.title);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const tiltRef = useRef<HTMLDivElement>(null);
  const remaining = useRef(VISIBLE_MS);
  const drag = useRef<{ y0: number; dy: number; moved: boolean } | null>(null);

  const close = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => onDismiss(toast.id), LEAVE_MS);
  }, [onDismiss, toast.id]);

  // El tiempo se congela mientras el mouse está encima: nadie pierde un aviso por estar leyéndolo.
  useEffect(() => {
    if (paused || leaving) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(close, Math.max(remaining.current, 0));
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, leaving, close]);

  function setVar(name: string, value: string) {
    tiltRef.current?.style.setProperty(name, value);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const el = tiltRef.current;
    if (!el) return;
    if (e.pointerType === "mouse") {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setVar("--rx", `${(-y * 9).toFixed(2)}deg`);
      setVar("--ry", `${(x * 11).toFixed(2)}deg`);
      setVar("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
      setVar("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
      return;
    }
    if (!drag.current) return;
    const dy = Math.min(0, e.clientY - drag.current.y0);
    drag.current.dy = dy;
    if (dy < -4) drag.current.moved = true;
    setVar("--dy", `${dy}px`);
  }

  function resetTilt() {
    setVar("--rx", "0deg");
    setVar("--ry", "0deg");
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse") return;
    drag.current = { y0: e.clientY, dy: 0, moved: false };
    tiltRef.current?.setAttribute("data-dragging", "true");
    setPaused(true);
  }

  function onPointerUp() {
    const d = drag.current;
    tiltRef.current?.removeAttribute("data-dragging");
    if (!d) return;
    if (d.dy < -SWIPE_CLOSE_PX) {
      close();
    } else {
      setVar("--dy", "0px");
      setPaused(false);
    }
    // Dejamos el dato un instante para que el click que sigue al deslizar no abra el aviso.
    window.setTimeout(() => {
      drag.current = null;
    }, 0);
  }

  return (
    <div className="push-drop pointer-events-auto" data-leaving={leaving ? "true" : undefined}>
      <div
        ref={tiltRef}
        className="push-tilt relative touch-none select-none"
        onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          resetTilt();
          setPaused(false);
        }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="relative overflow-hidden rounded-[22px] border border-white/70 bg-white/[0.92] shadow-[0_1px_0_rgb(255_255_255)_inset,0_2px_6px_-2px_rgb(28_25_23_/_0.12),0_24px_56px_-22px_rgb(28_25_23_/_0.55)] ring-1 ring-[#1c1917]/[0.06] backdrop-blur-xl">
          <span aria-hidden className="push-sheen pointer-events-none absolute inset-0" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand-primary)]/45 to-transparent"
          />

          <div className="relative flex items-start gap-3 px-4 pb-3.5 pt-3.5">
            <span className="push-icon-pop relative mt-0.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192.png"
                alt=""
                className="h-11 w-11 rounded-[13px] shadow-[0_6px_14px_-6px_rgb(184_95_46_/_0.7)]"
              />
              <KindSeal kind={kind} />
            </span>

            <button
              type="button"
              className="min-w-0 flex-1 text-left outline-none"
              onClick={() => {
                if (drag.current?.moved) return;
                onOpen(toast);
              }}
            >
              <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9a9187]">
                Ads Holistic
                <span aria-hidden className="h-[3px] w-[3px] rounded-full bg-[#c9c0b5]" />
                <span className="font-medium normal-case tracking-normal">ahora</span>
              </span>
              <span className="mt-0.5 block text-[14.5px] font-semibold leading-snug tracking-[-0.01em] text-[#1c1917]">
                {toast.title}
              </span>
              {toast.body ? (
                <span className="mt-0.5 line-clamp-3 block text-[13px] leading-[1.4] text-[#5c564e]">{toast.body}</span>
              ) : null}
              {toast.actionLabel ? (
                <span className="mt-2.5 inline-flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-b from-[var(--brand-primary)] to-[var(--brand-primary-deep)] pl-3.5 pr-3 text-[12.5px] font-semibold text-white shadow-[0_6px_14px_-6px_rgb(184_95_46_/_0.8)]">
                  {toast.actionLabel}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              ) : null}
            </button>

            <button
              type="button"
              aria-label="Cerrar"
              onClick={close}
              className="-mr-1.5 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#a39a90] transition hover:bg-[#f3eee8] hover:text-[#1c1917]"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative h-[3px] bg-[#f3eee8]">
            <div
              className="push-toast-timer h-full rounded-r-full bg-gradient-to-r from-[var(--brand-primary)] to-[#e9a06b]"
              style={{ animationDuration: `${VISIBLE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cuando llega un push con la app abierta, lo mostramos también dentro de la
 * página con nuestro diseño. Así el cliente lo ve aunque Windows o el celular
 * escondan las notificaciones de Chrome. Cae arriba al centro, como en el
 * celular, para no taparse con la campanita ni con el chat de soporte.
 */
export function InAppPushToasts() {
  const router = useRouter();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const open = useCallback(
    (toast: Toast) => {
      dismiss(toast.id);
      router.push(toast.url);
    },
    [dismiss, router],
  );

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
    }
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="push-stage pointer-events-none fixed inset-x-0 top-[calc(0.5rem+env(safe-area-inset-top))] z-[70] flex justify-center px-3 sm:top-[calc(0.75rem+env(safe-area-inset-top))]"
    >
      <div className="flex w-full max-w-[25rem] flex-col gap-2.5">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={dismiss} onOpen={open} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

type Audience = "clientes" | "todos";
type Destination = { url: string; label: string };
type Count = { recipients: number; devices: number };
type Log = {
  id: string;
  title: string;
  body: string;
  url: string;
  audience: Audience;
  sentByEmail: string | null;
  recipients: number;
  devices: number;
  delivered: number;
  createdAt: string;
};

const API = "/api/push/broadcasts";

/** Plantillas listas para no empezar de cero. */
const TEMPLATES: Array<{ name: string; title: string; body: string; url: string }> = [
  {
    name: "Recarga con Stripe",
    title: "Recarga en segundos con tarjeta",
    body: "Ahora recargas tu saldo con Stripe al toque, sin mandar comprobantes. Tu saldo queda listo al instante.",
    url: "/payments",
  },
  {
    name: "Hora de pautar",
    title: "¡Ya es hora de pautar!",
    body: "Tus clientes están en TikTok ahora mismo. Recarga tu saldo y activa tus campañas hoy.",
    url: "/payments",
  },
  {
    name: "Lanza campañas",
    title: "¡Es momento de lanzar campañas!",
    body: "Aprovecha esta semana: sube tus creativos y deja tus anuncios corriendo desde hoy.",
    url: "/ad-accounts",
  },
  {
    name: "Nuevo tutorial",
    title: "Nuevo tutorial disponible",
    body: "Aprende a sacarle más a tus campañas con el nuevo video en Educación.",
    url: "/education",
  },
];

const field =
  "w-full rounded-xl bg-white px-3 text-[14px] text-[#1c1917] ring-1 ring-[#e8e1d8] placeholder:text-[#a8a097] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]";
const primary =
  "inline-flex h-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-primary-deep)] disabled:opacity-50";
const ghost =
  "inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-[13px] font-semibold text-[#5c564e] ring-1 ring-[#e8e1d8] transition hover:bg-[#faf8f5] disabled:opacity-50";

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Vista previa: así se ve en la pantalla de bloqueo del celular. */
function PhonePreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[2.2rem] bg-[#1c1917] p-2.5 shadow-[0_24px_50px_-24px_rgb(28_25_23_/_0.6)]">
      <div className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-[#3b2a20] via-[#5a3a28] to-[#2a1f19] px-3 pb-10 pt-3">
        <div className="mx-auto h-5 w-20 rounded-full bg-black/80" />
        <p className="mt-6 text-center text-[44px] font-semibold leading-none tracking-tight text-white/90">9:41</p>
        <div className="mt-6 rounded-2xl bg-white/80 p-2.5 backdrop-blur">
          <div className="flex items-start gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="h-8 w-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[12.5px] font-semibold text-[#1c1917]">{title || "Título del aviso"}</p>
                <span className="shrink-0 text-[10.5px] text-[#6b645c]">ahora</span>
              </div>
              <p className="line-clamp-4 text-[12px] leading-snug text-[#3f3a35]">{body || "Aquí va el mensaje."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BroadcastComposer({
  destinations,
  titleMax,
  bodyMax,
}: {
  destinations: Destination[];
  titleMax: number;
  bodyMax: number;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState(destinations[0]?.url ?? "/overview");
  const [audience, setAudience] = useState<Audience>("clientes");
  const [count, setCount] = useState<Count | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<"test" | "send" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<Log[] | null>(null);

  const loadHistory = useCallback(() => {
    fetch(API, { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((j: { history?: Log[] }) => setHistory(j.history ?? []))
      .catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}?audience=${audience}`, { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((j: { count?: Count }) => {
        if (!cancelled) setCount(j.count ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [audience]);

  const ready = title.trim().length > 0 && body.trim().length > 0;
  const destinationLabel = destinations.find((d) => d.url === url)?.label ?? url;

  function edit<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setConfirming(false);
      setNotice(null);
      setError(null);
    };
  }

  async function post(target: "prueba" | Audience) {
    setBusy(target === "prueba" ? "test" : "send");
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(API, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url, audience: target }),
      });
      const j = (await res.json().catch(() => ({}))) as {
        error?: string;
        result?: { recipients: number; devices: number; delivered: number };
      };
      if (!res.ok || !j.result) throw new Error(j.error || "No se pudo enviar.");
      const r = j.result;
      if (target === "prueba") {
        setNotice(
          r.delivered > 0
            ? "Prueba enviada. Revisa tu celular o tu PC."
            : "No tienes avisos activos en ningún dispositivo. Actívalos en la campanita y vuelve a probar.",
        );
      } else {
        setNotice(
          `Enviado. Quedó en la campanita de ${plural(r.recipients, "persona", "personas")} y llegó al instante a ${plural(r.delivered, "dispositivo", "dispositivos")}.`,
        );
        setTitle("");
        setBody("");
        setConfirming(false);
        loadHistory();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-[#e8e1d8] bg-white p-4 sm:p-5">
          <p className="text-[12px] font-semibold text-[#5c564e]">Plantillas</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => {
                  edit(setTitle)(tpl.title);
                  setBody(tpl.body);
                  setUrl(tpl.url);
                }}
                className="rounded-full bg-[#faf6f1] px-3 py-1.5 text-[12.5px] font-semibold text-[#5c4a3c] ring-1 ring-[#efe5da] transition hover:bg-[#f6ede3] hover:ring-[var(--brand-primary)]/40"
              >
                {tpl.name}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="flex items-baseline justify-between text-[12px] font-semibold text-[#5c564e]">
                Título
                <span className={title.length > titleMax ? "text-red-600" : "font-normal text-[#a8a097]"}>
                  {title.length}/{titleMax}
                </span>
              </span>
              <input
                value={title}
                maxLength={titleMax}
                onChange={(e) => edit(setTitle)(e.target.value)}
                placeholder="¡Ya es hora de pautar!"
                className={`${field} mt-1 h-10`}
              />
            </label>
            <label className="block">
              <span className="flex items-baseline justify-between text-[12px] font-semibold text-[#5c564e]">
                Mensaje
                <span className={body.length > bodyMax ? "text-red-600" : "font-normal text-[#a8a097]"}>
                  {body.length}/{bodyMax}
                </span>
              </span>
              <textarea
                value={body}
                maxLength={bodyMax}
                rows={3}
                onChange={(e) => edit(setBody)(e.target.value)}
                placeholder="Recarga tu saldo y activa tus campañas hoy."
                className={`${field} mt-1 resize-none py-2.5 leading-snug`}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[12px] font-semibold text-[#5c564e]">Al tocarlo abre</span>
                <select
                  value={url}
                  onChange={(e) => edit(setUrl)(e.target.value)}
                  className={`${field} mt-1 h-10`}
                >
                  {destinations.map((d) => (
                    <option key={d.url} value={d.url}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <span className="text-[12px] font-semibold text-[#5c564e]">Para</span>
                <div className="mt-1 grid grid-cols-2 gap-1 rounded-xl bg-[#f6f3ef] p-1" role="radiogroup" aria-label="Para">
                  {(
                    [
                      ["clientes", "Clientes"],
                      ["todos", "Todos + equipo"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={audience === value}
                      onClick={() => edit(setAudience)(value)}
                      className={`h-8 rounded-lg text-[12.5px] font-semibold transition ${
                        audience === value ? "bg-white text-[#1c1917] shadow-sm" : "text-[#6b645c] hover:text-[#1c1917]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-[#faf8f5] px-3 py-2 text-[12.5px] text-[#5c564e] ring-1 ring-[#efe8df]">
            {count ? (
              <>
                Queda en la campanita de <strong className="text-[#1c1917]">{plural(count.recipients, "persona", "personas")}</strong>{" "}
                y llega al instante a <strong className="text-[#1c1917]">{plural(count.devices, "celular o PC", "celulares o PCs")}</strong>{" "}
                con avisos activos.
              </>
            ) : (
              "Calculando a cuántos llega…"
            )}
          </p>

          {error ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-950 ring-1 ring-amber-200">{error}</p> : null}
          {notice ? (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[13px] text-emerald-900 ring-1 ring-emerald-200">{notice}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {confirming ? (
              <>
                <button type="button" className={primary} disabled={busy !== null} onClick={() => void post(audience)}>
                  {busy === "send" ? "Enviando…" : `Sí, enviar a ${count ? plural(count.recipients, "persona", "personas") : "todos"}`}
                </button>
                <button type="button" className={ghost} disabled={busy !== null} onClick={() => setConfirming(false)}>
                  Cancelar
                </button>
                <span className="text-[12px] text-[#8a8278]">Se manda una sola vez y no se puede deshacer.</span>
              </>
            ) : (
              <>
                <button type="button" className={primary} disabled={!ready || busy !== null} onClick={() => setConfirming(true)}>
                  Enviar aviso
                </button>
                <button type="button" className={ghost} disabled={!ready || busy !== null} onClick={() => void post("prueba")}>
                  {busy === "test" ? "Enviando prueba…" : "Mandarme una prueba"}
                </button>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8e1d8] bg-white p-4 sm:p-5">
          <p className="text-[12px] font-semibold text-[#5c564e]">Enviados</p>
          {history === null ? (
            <p className="mt-2 text-[13px] text-[#8a8278]">Cargando…</p>
          ) : history.length === 0 ? (
            <p className="mt-2 text-[13px] text-[#8a8278]">Todavía no se mandó ningún aviso.</p>
          ) : (
            <ul className="mt-2 divide-y divide-[#f1ebe3]">
              {history.map((h) => (
                <li key={h.id} className="py-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-[13.5px] font-semibold text-[#1c1917]">{h.title}</p>
                    <span className="text-[11.5px] text-[#8a8278]">
                      {new Date(h.createdAt).toLocaleString("es-PE", {
                        timeZone: "America/Lima",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[#5c564e]">{h.body}</p>
                  <p className="mt-1 text-[11.5px] text-[#8a8278]">
                    {h.audience === "todos" ? "Todos + equipo" : "Clientes"} · {plural(h.recipients, "persona", "personas")} ·{" "}
                    {plural(h.delivered, "dispositivo", "dispositivos")} al instante
                    {h.sentByEmail ? ` · ${h.sentByEmail}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 text-center text-[12px] font-semibold text-[#5c564e]">Así se ve en el celular</p>
        <PhonePreview title={title.trim()} body={body.trim()} />
        <p className="mt-2 text-center text-[11.5px] text-[#8a8278]">Al tocarlo abre: {destinationLabel}</p>
      </aside>
    </div>
  );
}

"use client";

import { clientEnv } from "@/lib/env/env.client";

/** Estado de los avisos en ESTE dispositivo. */
export type PushState =
  | "unsupported" // navegador sin push (o sin llave configurada)
  | "ios-install" // iPhone en Safari: Apple solo da avisos con la app en inicio
  | "denied" // el cliente los bloqueó en el navegador
  | "off" // aún no los activa
  | "on";

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPad con iPadOS se presenta como Mac con pantalla táctil.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(clientEnv.vapidPublicKey) &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

/**
 * Registra el worker y espera a que quede ACTIVO: suscribirse antes de eso
 * falla ("no active Service Worker"), justo en el primer toque de "Activar".
 */
async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration("/");
  if (!existing) await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

/** Suscripción del dispositivo; si quedó una con otra llave, la renueva. */
async function ensureSubscription(reg: ServiceWorkerRegistration): Promise<PushSubscription> {
  const options = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(clientEnv.vapidPublicKey) as BufferSource,
  };
  const current = await reg.pushManager.getSubscription();
  if (current) return current;
  try {
    return await reg.pushManager.subscribe(options);
  } catch (error) {
    const stale = await reg.pushManager.getSubscription();
    if (!stale) throw error;
    await stale.unsubscribe().catch(() => false);
    return reg.pushManager.subscribe(options);
  }
}

async function saveSubscription(subscription: PushSubscription): Promise<void> {
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!res.ok) throw new Error("No se pudo guardar el dispositivo.");
}

export async function readPushState(): Promise<PushState> {
  if (isIos() && !isStandalone()) return "ios-install";
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission !== "granted") return "off";
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    return sub ? "on" : "off";
  } catch {
    return "off";
  }
}

/** Pide permiso y registra el dispositivo. Devuelve el estado final. */
export async function enablePush(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  // Primero el permiso: Safari solo lo muestra si viene directo del toque.
  const permission = await Notification.requestPermission();
  if (permission === "denied") return "denied";
  if (permission !== "granted") return "off";
  const reg = await registration();
  await saveSubscription(await ensureSubscription(reg));
  return "on";
}

export async function disablePush(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => undefined);
    await sub.unsubscribe().catch(() => false);
  }
  return "off";
}

/**
 * Si el navegador ya dio permiso, vuelve a registrar el dispositivo para esta
 * sesión. Al cerrar sesión se borran sus dispositivos y, como el permiso ya
 * estaba dado, antes nadie volvía a preguntar: ese celular quedaba sin avisos.
 */
export async function resyncPushIfGranted(): Promise<void> {
  if (!pushSupported() || Notification.permission !== "granted") return;
  if (isIos() && !isStandalone()) return;
  try {
    const reg = await registration();
    await saveSubscription(await ensureSubscription(reg));
  } catch (error) {
    console.error("[push] no se pudo renovar el dispositivo", error);
  }
}

/** Cómo desbloquear según el navegador (cuando el cliente tocó "Bloquear"). */
export function unblockSteps(): string[] {
  if (typeof navigator === "undefined") return [];
  const ua = navigator.userAgent;
  if (isIos()) {
    return ["Abre Ajustes del iPhone → Notificaciones.", "Busca Ads Holistic y activa «Permitir notificaciones»."];
  }
  if (/android/i.test(ua)) {
    return ["Toca el candado al lado de la dirección.", "Permisos → Notificaciones → Permitir. Luego recarga la página."];
  }
  if (/firefox/i.test(ua)) {
    return ["Haz clic en el ícono a la izquierda de la dirección.", "Quita el bloqueo de «Enviar notificaciones» y recarga."];
  }
  if (/safari/i.test(ua) && !/chrome|chromium|edg/i.test(ua)) {
    return ["Safari → Ajustes → Sitios web → Notificaciones.", "Busca adsholistic.com y elige «Permitir»."];
  }
  return ["Haz clic en el ícono a la izquierda de la dirección.", "Notificaciones → Permitir. Luego recarga la página."];
}

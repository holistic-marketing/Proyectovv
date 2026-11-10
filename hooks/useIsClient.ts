"use client";

import { useSyncExternalStore } from "react";

// Nada que suscribir: el valor solo cambia entre servidor/hidratación (false) y cliente (true).
const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` en el render del servidor y durante la hidratación; `true` después en el cliente.
 * Reemplaza el patrón `useState(false)` + `useEffect(() => setMounted(true), [])`,
 * p. ej. para no llamar a `createPortal` antes de que exista `document`.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

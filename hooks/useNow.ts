"use client";

import { useSyncExternalStore } from "react";

type NowStore = {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => number;
};

// Un reloj compartido por intervalo: todos los componentes que piden el mismo
// intervalo usan un solo setInterval, que se apaga cuando no queda nadie suscrito.
const stores = new Map<number, NowStore>();

function getNowStore(intervalMs: number): NowStore {
  const existing = stores.get(intervalMs);
  if (existing) return existing;

  let now = Date.now();
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | null = null;

  const store: NowStore = {
    subscribe(onChange) {
      listeners.add(onChange);
      if (timer === null) {
        now = Date.now();
        timer = setInterval(() => {
          now = Date.now();
          listeners.forEach((listener) => listener());
        }, intervalMs);
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0 && timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
    // Devuelve el valor guardado (no Date.now()) para que React vea una instantánea estable.
    getSnapshot: () => now,
  };
  stores.set(intervalMs, store);
  return store;
}

// En el servidor y durante la hidratación: valor fijo, sin desajustes.
const getServerSnapshot = () => 0;

/**
 * Hora actual (ms) que se actualiza cada `intervalMs`. Sustituye `Date.now()` en el
 * render: el reloj se lee fuera del render y los textos relativos se refrescan solos.
 * Vale 0 en el render del servidor y en la hidratación.
 */
export function useNow(intervalMs = 30_000): number {
  const store = getNowStore(intervalMs);
  return useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);
}

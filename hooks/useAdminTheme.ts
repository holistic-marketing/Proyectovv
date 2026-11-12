"use client";

import { useCallback, useSyncExternalStore, type MouseEvent } from "react";
import { useIsClient } from "@/hooks/useIsClient";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "admin-theme";

export function isAdminPathname(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function getStoredAdminTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage may be unavailable in restricted contexts
  }

  // Default light — do not inherit OS dark mode for the product UI.
  return "light";
}

function readDomTheme(): AdminTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyThemeToDom(theme: AdminTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.themeDirection = theme;
}

/** Force document back to light (customer routes / leaving admin). */
export function forceDocumentLightTheme() {
  applyThemeToDom("light");
}

// La clase de <html> es la fuente de verdad (la ponen el script inicial,
// DocumentThemeScope y setTheme); el hook solo la observa.
function subscribeToDomTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const getServerTheme = (): AdminTheme => "light";

export function useAdminTheme() {
  const theme = useSyncExternalStore(subscribeToDomTheme, readDomTheme, getServerTheme);
  const mounted = useIsClient();

  const setTheme = useCallback((next: AdminTheme) => {
    const root = document.documentElement;
    const current = readDomTheme();

    if (current === next) return;

    const applyTheme = () => {
      applyThemeToDom(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore storage failures
      }
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !document.startViewTransition) {
      applyTheme();
      return;
    }

    root.classList.add("theme-transitioning");
    root.dataset.themeDirection = next;

    const transition = document.startViewTransition(() => {
      applyTheme();
    });

    void transition.finished.finally(() => {
      root.classList.remove("theme-transitioning");
    });
  }, []);

  const toggleTheme = useCallback(
    (event?: MouseEvent<HTMLElement>) => {
      void event;
      const current = readDomTheme();
      const next: AdminTheme = current === "dark" ? "light" : "dark";
      setTheme(next);
    },
    [setTheme],
  );

  return { theme, setTheme, toggleTheme, mounted };
}

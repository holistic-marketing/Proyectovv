"use client";

type ClerkBrowserGlobal = {
  signOut?: (options?: { redirectUrl?: string }) => Promise<unknown>;
};

/**
 * Cierra la sesión de Clerk en el navegador si Clerk está cargado.
 * Usa `window.Clerk` en vez de `useClerk()` porque los menús se montan también
 * cuando Clerk está apagado (sin ClerkProvider), y ahí el hook fallaría.
 *
 * @returns true si Clerk se encargó de navegar a `redirectUrl`.
 */
export async function signOutOfClerkIfLoaded(redirectUrl: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const clerk = (window as unknown as { Clerk?: ClerkBrowserGlobal }).Clerk;
  if (typeof clerk?.signOut !== "function") return false;
  try {
    await clerk.signOut({ redirectUrl });
    return true;
  } catch (error) {
    console.warn("[auth] clerk_sign_out_failed", error);
    return false;
  }
}

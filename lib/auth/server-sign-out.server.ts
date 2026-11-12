import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { clerkLoginEnabled } from "@/lib/auth/clerk";
import { TESTER_DASHBOARD_MODE_COOKIE } from "@/lib/auth/tester-dashboard-mode";

/**
 * Revoca en Clerk la sesión de esta petición. No depende de que el navegador cargue
 * clerk-js: si el signOut del cliente falla (bloqueadores, red), la cookie de Clerk
 * quedaría viva y /sign-in reabriría la sesión del usuario anterior en ese navegador.
 * Requiere que la ruta pase por clerkMiddleware (proxy.ts matcher).
 */
export async function revokeCurrentClerkSession(): Promise<"revoked" | "none" | "skipped" | "failed"> {
  if (!clerkLoginEnabled()) return "skipped";
  try {
    const { sessionId } = await auth();
    if (!sessionId) return "none";
    const client = await clerkClient();
    await client.sessions.revokeSession(sessionId);
    return "revoked";
  } catch (error) {
    console.warn("[auth] clerk_server_revoke_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return "failed";
  }
}

/** Cookie del modo tester (gerente / cliente): no debe sobrevivir al logout. */
export async function clearTesterDashboardModeCookie(): Promise<void> {
  try {
    const store = await cookies();
    store.delete(TESTER_DASHBOARD_MODE_COOKIE);
  } catch {
    // best-effort
  }
}

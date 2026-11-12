"use server";

import {
  clearTesterDashboardModeCookie,
  revokeCurrentClerkSession,
} from "@/lib/auth/server-sign-out.server";
import { clearSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesión del admin: Clerk (revocada en el servidor), Supabase y las cookies
 * de cliente Hecom y modo tester. No redirige: el botón cierra además Clerk en el
 * navegador y navega.
 */
export async function signOutAdminSessionAction(): Promise<{ ok: true }> {
  await revokeCurrentClerkSession();
  const supabase = await createClient();
  await supabase.auth.signOut();
  try {
    await clearSelectedHecomCliente();
  } catch {
    // limpieza de cookies best-effort
  }
  await clearTesterDashboardModeCookie();
  return { ok: true };
}

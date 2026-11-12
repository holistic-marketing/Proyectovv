"use server";

import { clearSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cierra la sesión Supabase del admin y limpia las cookies de cliente Hecom.
 * No redirige: el botón cierra luego la sesión de Clerk en el navegador y navega.
 */
export async function signOutAdminSessionAction(): Promise<{ ok: true }> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  try {
    await clearSelectedHecomCliente();
  } catch {
    // limpieza de cookies best-effort
  }
  return { ok: true };
}

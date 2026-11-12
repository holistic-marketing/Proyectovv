import { NextResponse } from "next/server";
import { routes } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { clearSelectedHecomCliente } from "@/lib/hecom/selected-cliente.server";
import { getSession } from "@/lib/auth/session.server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  clearTesterDashboardModeCookie,
  revokeCurrentClerkSession,
} from "@/lib/auth/server-sign-out.server";

export async function POST() {
  const session = await getSession();
  // Clerk primero, en el servidor: no depende de que el navegador cargue clerk-js.
  await revokeCurrentClerkSession();
  const supabase = await createClient();
  await supabase.auth.signOut();
  try {
    await clearSelectedHecomCliente();
  } catch {
    // cookie clear best-effort
  }
  await clearTesterDashboardModeCookie();
  if (session?.id) {
    try {
      await createAdminClient()
        .from("web_push_subscriptions")
        .delete()
        .eq("user_id", session.id);
    } catch {
      // la suscripción se limpia en el próximo envío si ya no existe
    }
  }

  return NextResponse.json({
    ok: true,
    redirectTo: routes.login,
  });
}

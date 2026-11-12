import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { clerkConfigured } from "@/lib/auth/clerk";
import { completeClerkLoginToHolistic } from "@/lib/auth/clerk-bridge.server";
import { routes } from "@/config/routes";
import { serverEnv } from "@/lib/env/env.server";

export const dynamic = "force-dynamic";

function decodeCookie(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value) || null;
  } catch {
    return null;
  }
}

/**
 * Tras SignIn / registro sin contraseña de Clerk: puente a sesión Supabase Holistic + Hecom.
 * Si el correo no tiene acceso, se cierra también la sesión de Clerk para no volver aquí en bucle.
 */
export async function GET(request: NextRequest) {
  if (!clerkConfigured()) {
    return NextResponse.redirect(new URL(routes.login, serverEnv.appUrl));
  }

  const { userId, sessionId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL(`${routes.login}?error=clerk_session`, serverEnv.appUrl));
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.redirect(new URL(`${routes.login}?error=clerk_session`, serverEnv.appUrl));
  }

  const result = await completeClerkLoginToHolistic(user, {
    partnerSlug: request.cookies.get("ah_partner")?.value ?? null,
    referralCode: decodeCookie(request.cookies.get("vv_referral_code")?.value),
    visitorId: request.cookies.get("ah_vid")?.value ?? null,
  });
  if (result.ok) return result.response;

  if (sessionId) {
    try {
      const client = await clerkClient();
      await client.sessions.revokeSession(sessionId);
    } catch (error) {
      console.warn("[clerk-complete] revoke_session_failed", error);
    }
  }

  const loginUrl = new URL(routes.login, serverEnv.appUrl);
  loginUrl.searchParams.set("error", result.error);
  return NextResponse.redirect(loginUrl);
}

import "server-only";
import { resolveHecomClientesForEmail } from "@/lib/auth/hecom-otp.server";
import { logHecomOtp, maskEmail } from "@/lib/auth/hecom-otp-log.server";
import { isStaffUser } from "@/lib/auth/staff.server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PanelAccessReason = "membership" | "staff" | "hecom" | "invite";

export type PanelAccessResult =
  | { ok: true; reason: PanelAccessReason }
  | { ok: false; reason: "not_allowed" | "hecom_unavailable" | "no_email" };

async function hasActiveMembership(userId: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<{ organization_id: string }>();
  return Boolean(data?.organization_id);
}

async function hasPendingInvite(email: string): Promise<boolean> {
  try {
    const { data } = await createAdminClient()
      .from("organization_email_invites")
      .select("id")
      .eq("status", "pending")
      .eq("email", email)
      .limit(1)
      .maybeSingle<{ id: string }>();
    return Boolean(data?.id);
  } catch {
    return false;
  }
}

/**
 * ¿Este usuario puede tener panel de Ads Holistic?
 * Solo staff (`staff_members`), clientes con ficha en Hecom, invitados por correo,
 * o quien ya tenía una organización activa. Cualquier otra cuenta de Supabase
 * (registro público, ImpoERP, etc.) queda fuera. Si Hecom no responde, se niega.
 */
export async function userMayUsePanel(input: {
  userId: string;
  email: string | null | undefined;
  /** false = solo para cuentas nuevas (no cuenta una membresía existente). */
  allowExistingMembership?: boolean;
}): Promise<PanelAccessResult> {
  const email = String(input.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, reason: "no_email" };

  if (input.allowExistingMembership !== false && (await hasActiveMembership(input.userId))) {
    return { ok: true, reason: "membership" };
  }
  if (await isStaffUser(email)) return { ok: true, reason: "staff" };

  try {
    const clientes = await resolveHecomClientesForEmail(email);
    if (clientes.length > 0) return { ok: true, reason: "hecom" };
  } catch (error) {
    logHecomOtp("error", "panel_access_hecom_lookup_failed", {
      email: maskEmail(email),
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, reason: "hecom_unavailable" };
  }

  if (await hasPendingInvite(email)) return { ok: true, reason: "invite" };

  logHecomOtp("warn", "panel_access_denied", { email: maskEmail(email) });
  return { ok: false, reason: "not_allowed" };
}

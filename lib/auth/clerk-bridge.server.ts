import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureAccountProvisionedForUser } from "@/lib/auth/account-provisioning.server";
import type { ClerkBridgeErrorCode } from "@/lib/auth/clerk-errors";
import {
  normalizeHecomOtpEmail,
  provisionHecomClienteAccess,
  resolveHecomClientesForEmail,
} from "@/lib/auth/hecom-otp.server";
import { logHecomOtp, maskEmail } from "@/lib/auth/hecom-otp-log.server";
import {
  getRegisterCountry,
  isRegisterCountry,
  isValidPhone,
} from "@/lib/auth/register-countries.shared";
import { isStaffUser } from "@/lib/auth/staff.server";
import { routes } from "@/config/routes";
import { serverEnv } from "@/lib/env/env.server";
import { createHecomCliente } from "@/lib/hecom/clientes.server";
import { recordSignupAttribution } from "@/lib/partners/partners.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAuthCookieOptions } from "@/lib/supabase/auth-cookie";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

/** Datos de atribución (aliado / referido) leídos de las cookies de la petición. */
export type ClerkBridgeAttribution = {
  partnerSlug: string | null;
  referralCode: string | null;
  visitorId: string | null;
};

export type ClerkBridgeResult =
  | { ok: true; response: NextResponse }
  | { ok: false; error: ClerkBridgeErrorCode };

/** Lo que manda el registro propio (`ClerkPasswordlessSignUp`) en unsafeMetadata. */
type RegistrationMetadata = {
  fullName: string | null;
  phone: string;
  country: ReturnType<typeof getRegisterCountry>;
};

function metadataString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function registrationMetadata(clerkUser: ClerkUser): RegistrationMetadata | null {
  const meta = (clerkUser.unsafeMetadata ?? {}) as Record<string, unknown>;
  if (meta.source !== "ah_register") return null;
  return {
    fullName: metadataString(meta.fullName),
    phone: metadataString(meta.phone) ?? "",
    country: getRegisterCountry(isRegisterCountry(meta.country) ? meta.country : "PE"),
  };
}

/** Correo principal, solo si Clerk lo marca como verificado. */
function verifiedPrimaryEmail(
  clerkUser: ClerkUser,
): { ok: true; email: string } | { ok: false; error: ClerkBridgeErrorCode } {
  const primary = clerkUser.primaryEmailAddress;
  if (!primary?.emailAddress) return { ok: false, error: "clerk_email" };
  if (primary.verification?.status !== "verified") {
    return { ok: false, error: "clerk_email_unverified" };
  }
  const email = normalizeHecomOtpEmail(primary.emailAddress);
  return email ? { ok: true, email } : { ok: false, error: "clerk_email" };
}

function clerkFullName(clerkUser: ClerkUser, registration: RegistrationMetadata | null, email: string): string {
  const joined = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return registration?.fullName || joined || clerkUser.fullName || email.split("@")[0] || "Usuario";
}

/**
 * Solo staff (staff_members) o correos con ficha en Hecom entran.
 * El registro propio (`source: "ah_register"`) crea su ficha si aún no existe.
 */
async function assertHecomAccess(input: {
  email: string;
  registration: RegistrationMetadata | null;
  attribution: ClerkBridgeAttribution;
}): Promise<{ ok: true } | { ok: false; error: ClerkBridgeErrorCode }> {
  const { email, registration } = input;
  if (await isStaffUser(email)) return { ok: true };

  try {
    const clientes = await resolveHecomClientesForEmail(email);
    if (clientes.length > 0) return { ok: true };
  } catch (error) {
    logHecomOtp("error", "clerk_bridge_hecom_lookup_failed", {
      email: maskEmail(email),
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: "hecom_unavailable" };
  }

  if (!registration) return { ok: false, error: "clerk_not_hecom" };
  if (!isValidPhone(registration.country, registration.phone)) {
    return { ok: false, error: "clerk_phone" };
  }

  const created = await createHecomCliente({
    name: registration.fullName,
    dni: null,
    email,
    phone: registration.phone,
    country: registration.country.code,
  });

  if (!created.ok) {
    // Otra petición la creó un instante antes: vale si ahora existe.
    if (created.code === "duplicate_email") {
      const again = await resolveHecomClientesForEmail(email).catch(() => []);
      if (again.length > 0) return { ok: true };
    }
    logHecomOtp("error", "clerk_bridge_hecom_create_failed", {
      email: maskEmail(email),
      code: created.code ?? "unknown",
      error: created.message,
    });
    return { ok: false, error: "hecom_create" };
  }

  logHecomOtp("info", "clerk_bridge_hecom_cliente_created", {
    email: maskEmail(email),
    clienteId: created.cliente.id,
  });

  // Aliado o referido que trajo al cliente. Nunca frena el registro.
  try {
    await recordSignupAttribution({
      email,
      hecomClienteId: created.cliente.id,
      ...input.attribution,
    });
  } catch (error) {
    console.warn("[clerk-bridge] signup_attribution_failed", error);
  }

  return { ok: true };
}

/** Crea el usuario de Supabase Auth si no existe. Sin listar usuarios (no hay tope de 200). */
async function ensureSupabaseAuthUser(input: {
  email: string;
  fullName: string;
  clerkUserId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await createAdminClient().auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: {
      full_name: input.fullName,
      clerk_user_id: input.clerkUserId,
      auth_via: "clerk",
    },
  });
  if (!error) return { ok: true };
  const alreadyExists =
    /already|registered|exists/i.test(error.message) || error.status === 422;
  return alreadyExists ? { ok: true } : { ok: false, error: error.message };
}

/**
 * Tras el login o registro en Clerk: valida acceso (staff o cliente Hecom),
 * abre la sesión Supabase de Holistic con cookies propias y provisiona org + Hecom.
 */
export async function completeClerkLoginToHolistic(
  clerkUser: ClerkUser,
  attribution: ClerkBridgeAttribution,
): Promise<ClerkBridgeResult> {
  const primary = verifiedPrimaryEmail(clerkUser);
  if (!primary.ok) return primary;
  const { email } = primary;

  const registration = registrationMetadata(clerkUser);
  const access = await assertHecomAccess({ email, registration, attribution });
  if (!access.ok) {
    logHecomOtp("warn", "clerk_bridge_rejected", {
      email: maskEmail(email),
      reason: access.error,
    });
    return access;
  }

  const fullName = clerkFullName(clerkUser, registration, email);
  const ensured = await ensureSupabaseAuthUser({ email, fullName, clerkUserId: clerkUser.id });
  if (!ensured.ok) {
    console.error("[clerk-bridge] supabase_create_user_failed", { error: ensured.error });
    return { ok: false, error: "clerk_supabase" };
  }

  const admin = createAdminClient();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const hashedToken = linkData?.properties?.hashed_token;
  if (linkError || !hashedToken) return { ok: false, error: "clerk_link" };

  const pendingCookies: CookieToSet[] = [];
  const supabase = createServerClient(serverEnv.supabaseUrl, serverEnv.supabaseAnonKey, {
    cookieOptions: supabaseAuthCookieOptions,
    cookies: {
      getAll() {
        return [];
      },
      setAll(cookiesToSet) {
        pendingCookies.push(...cookiesToSet);
      },
    },
  });

  const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: hashedToken,
  });
  if (verifyError || !verified.user) return { ok: false, error: "clerk_verify" };

  const user = verified.user;
  // Usuario ya existente: enlazar la cuenta de Clerk sin pisar el nombre guardado.
  if (user.user_metadata?.clerk_user_id !== clerkUser.id) {
    await admin.auth.admin
      .updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          full_name: user.user_metadata?.full_name ?? fullName,
          clerk_user_id: clerkUser.id,
          auth_via: "clerk",
        },
      })
      .catch((error: unknown) => {
        console.warn("[clerk-bridge] link_metadata_failed", error);
      });
  }

  const account = await ensureAccountProvisionedForUser(user);
  const provisioned = await provisionHecomClienteAccess({ userId: user.id, email }).catch(
    (error: unknown) => {
      console.warn("[clerk-bridge] hecom_provision_failed", error);
      return null;
    },
  );

  const nextPath: string = !account.ready
    ? routes.accountSetup
    : (provisioned?.nextPath ?? routes.overview);

  const response = NextResponse.redirect(new URL(nextPath, serverEnv.appUrl));
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }
  return { ok: true, response };
}

import "server-only";
import { cache } from "react";
import {
  isDemoClienteEmail,
  isDemoGerenteEmail,
} from "@/lib/auth/demo-personas.server";
import {
  isHecomOtpStaffEmail,
  listHecomOtpStaffEmails,
  normalizeHecomOtpEmail,
} from "@/lib/auth/hecom-otp.server";
import { serverEnv } from "@/lib/env/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Cuánto vive el roster en memoria de cada instancia antes de volver a leerlo. */
const ROSTER_TTL_MS = 60_000;

type StaffRoster = {
  active: Set<string>;
  inactive: Set<string>;
  loadedAt: number;
};

let roster: StaffRoster | null = null;
let inflight: Promise<StaffRoster | null> | null = null;

async function loadRoster(): Promise<StaffRoster | null> {
  try {
    const { data, error } = await createAdminClient()
      .from("staff_members")
      .select("email, is_active");
    if (error || !data) throw new Error(error?.message ?? "no_data");

    const active = new Set<string>();
    const inactive = new Set<string>();
    for (const row of data as Array<{ email: unknown; is_active: unknown }>) {
      const email = normalizeHecomOtpEmail(String(row.email ?? ""));
      if (!email) continue;
      if (row.is_active === true) active.add(email);
      else inactive.add(email);
    }
    return { active, inactive, loadedAt: Date.now() };
  } catch (error) {
    console.warn("[staff] roster_load_failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Roster de `staff_members` en memoria (TTL 60 s). Una sola carga a la vez;
 * si una recarga falla se conserva el último roster bueno.
 */
async function getStaffRoster(): Promise<StaffRoster | null> {
  if (roster && Date.now() - roster.loadedAt < ROSTER_TTL_MS) return roster;
  inflight ??= loadRoster()
    .then((fresh) => {
      if (fresh) roster = fresh;
      return roster;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Acceso de emergencia: las variables de Vercel siguen dando el rol aunque falte la fila. */
function isBreakGlassStaffEmail(email: string): boolean {
  return (
    serverEnv.authHecomOtpStaffEmails.includes(email) ||
    serverEnv.adminAllowedEmails.includes(email)
  );
}

/**
 * ¿Este correo es gerente/staff de Ads Holistic?
 * 1. Demos fijas en código (cliente nunca, gerente siempre).
 * 2. `staff_members`: inactivo revoca, activo concede; si no está, solo cuentan las variables.
 * 3. Sin tabla o sin base: lista legada (`isHecomOtpStaffEmail`), igual que antes.
 */
export const isStaffUser = cache(async (emailRaw: string): Promise<boolean> => {
  const email = normalizeHecomOtpEmail(emailRaw ?? "");
  if (!email) return false;
  if (isDemoClienteEmail(email)) return false;
  if (isDemoGerenteEmail(email)) return true;

  const current = await getStaffRoster();
  if (!current) return isHecomOtpStaffEmail(email);

  if (current.inactive.has(email)) return false;
  if (current.active.has(email)) return true;
  return isBreakGlassStaffEmail(email);
});

/**
 * Comprobación síncrona con el roster ya cargado (una sola lectura): para filtros sobre
 * muchas filas. Mismas reglas que `isStaffUser`.
 */
export async function staffEmailMatcher(): Promise<(emailRaw: string) => boolean> {
  const current = await getStaffRoster();
  return (emailRaw: string) => {
    const email = normalizeHecomOtpEmail(emailRaw ?? "");
    if (!email) return false;
    if (isDemoClienteEmail(email)) return false;
    if (isDemoGerenteEmail(email)) return true;
    if (!current) return isHecomOtpStaffEmail(email);
    if (current.inactive.has(email)) return false;
    if (current.active.has(email)) return true;
    return isBreakGlassStaffEmail(email);
  };
}

/**
 * Correos de staff activos (avisos a gerentes, asesores de soporte): `staff_members`
 * activos + acceso de emergencia de Vercel. Sin tabla: la lista legada.
 */
export async function listStaffEmails(): Promise<string[]> {
  const current = await getStaffRoster();
  if (!current) return listHecomOtpStaffEmails();
  const emails = new Set<string>();
  for (const email of [
    ...current.active,
    ...serverEnv.authHecomOtpStaffEmails,
    ...serverEnv.adminAllowedEmails,
  ]) {
    const normalized = normalizeHecomOtpEmail(email);
    if (!normalized || isDemoClienteEmail(normalized) || current.inactive.has(normalized)) continue;
    emails.add(normalized);
  }
  return [...emails];
}

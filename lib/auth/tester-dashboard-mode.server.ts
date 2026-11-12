import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isStaffUser } from "@/lib/auth/staff.server";
import {
  canSwitchTesterDashboardMode,
  parseTesterDashboardMode,
  TESTER_DASHBOARD_MODE_COOKIE,
  type TesterDashboardMode,
} from "@/lib/auth/tester-dashboard-mode";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

/** `null` si la cuenta no puede cambiar de modo. Una sola lectura de cookie por request. */
export const getTesterDashboardMode = cache(async (
  email: string | null | undefined,
): Promise<TesterDashboardMode | null> => {
  if (!canSwitchTesterDashboardMode(email)) return null;
  const store = await cookies();
  return parseTesterDashboardMode(
    store.get(TESTER_DASHBOARD_MODE_COOKIE)?.value,
  );
});

export async function setTesterDashboardMode(
  mode: TesterDashboardMode,
): Promise<void> {
  const store = await cookies();
  store.set(TESTER_DASHBOARD_MODE_COOKIE, mode, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
  });
}

/**
 * Staff real (staff_members con caché), o el tester según su cookie de modo.
 * Para el tester manda la cookie: así su modo "cliente" funciona aunque esté en el roster.
 */
export async function sessionIsGerente(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;
  const mode = await getTesterDashboardMode(email);
  if (mode !== null) return mode === "gerente";
  return isStaffUser(email);
}

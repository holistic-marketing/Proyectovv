/** Cooldown entre reenvíos OTP Hecom (servidor + UI). */
export const HECOM_OTP_COOLDOWN_SECONDS = 30;

/**
 * Alias de correo (typo → correo real). Vacío a propósito: un alias convierte un correo
 * verificado en OTRO, y en el puente de Clerk eso abría la sesión del dueño del correo
 * destino (p. ej. un gerente). No volver a añadir entradas que apunten a cuentas reales.
 */
export const HECOM_OTP_EMAIL_ALIASES: Record<string, string> = {};

/** Misma normalización en login, verify y servidor (evita OTP “inválido”). */
export function normalizeHecomOtpEmail(email: string): string {
  const raw = email.trim().toLowerCase();
  return HECOM_OTP_EMAIL_ALIASES[raw] ?? raw;
}

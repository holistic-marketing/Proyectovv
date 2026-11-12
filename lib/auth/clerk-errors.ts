/** Códigos de error del puente Clerk → Holistic (`/login?error=…`) y su texto para el usuario. */
export const CLERK_BRIDGE_ERRORS = {
  clerk_email: "Tu cuenta no tiene un correo principal. Inicia sesión con un correo.",
  clerk_email_unverified: "Tu correo aún no está verificado. Ábrelo desde el enlace que te enviamos.",
  clerk_not_hecom: "Este correo no tiene una cuenta de cliente. Crea tu cuenta o escríbenos a soporte.",
  clerk_phone: "El celular del registro no es válido. Vuelve a registrarte con un celular correcto.",
  hecom_unavailable: "No pudimos validar tu cuenta en este momento. Inténtalo en unos minutos.",
  hecom_create: "No pudimos crear tu ficha de cliente. Inténtalo de nuevo o escríbenos a soporte.",
  clerk_supabase: "No pudimos preparar tu cuenta. Inténtalo de nuevo.",
  clerk_link: "No pudimos iniciar tu sesión. Inténtalo de nuevo.",
  clerk_verify: "No pudimos iniciar tu sesión. Inténtalo de nuevo.",
  clerk_session: "Tu sesión se cortó a mitad del ingreso. Vuelve a entrar con tu correo.",
} as const;

export type ClerkBridgeErrorCode = keyof typeof CLERK_BRIDGE_ERRORS;

export function clerkBridgeErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return (CLERK_BRIDGE_ERRORS as Record<string, string>)[code] ?? null;
}

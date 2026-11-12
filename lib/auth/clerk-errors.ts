/** Códigos de error del puente Clerk → Holistic (`/login?error=…`) y su texto para el usuario. */
export const CLERK_BRIDGE_ERRORS = {
  clerk_email: "Tu cuenta no tiene un correo principal. Inicia sesión con un correo.",
  clerk_email_unverified: "Tu correo aún no está verificado. Escribe el código que te enviamos.",
  clerk_not_hecom: "Este correo no tiene una cuenta de cliente. Crea tu cuenta o escríbenos a soporte.",
  clerk_phone: "El celular del registro no es válido. Vuelve a registrarte con un celular correcto.",
  hecom_unavailable: "No pudimos validar tu cuenta en este momento. Inténtalo en unos minutos.",
  hecom_create: "No pudimos crear tu ficha de cliente. Inténtalo de nuevo o escríbenos a soporte.",
  clerk_supabase: "No pudimos preparar tu cuenta. Inténtalo de nuevo.",
  clerk_link: "No pudimos iniciar tu sesión. Inténtalo de nuevo.",
  clerk_verify: "No pudimos iniciar tu sesión. Inténtalo de nuevo.",
  clerk_session: "Tu sesión se cortó a mitad del ingreso. Vuelve a entrar con tu correo.",
  clerk_email_alias: "Este correo no puede usarse para entrar. Usa el correo con el que te registraste.",
  not_allowed: "Este correo no tiene acceso al panel. Crea tu cuenta o escríbenos a soporte.",
  admin_not_allowed: "Tu usuario no está habilitado para el panel admin.",
} as const;

export type ClerkBridgeErrorCode = keyof typeof CLERK_BRIDGE_ERRORS;

export function clerkBridgeErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return (CLERK_BRIDGE_ERRORS as Record<string, string>)[code] ?? null;
}

/**
 * Errores de la API de Clerk en el registro propio (`ClerkAPIResponseError.errors[].code`)
 * traducidos al español. Nunca se muestra el mensaje original en inglés.
 */
export const CLERK_SIGN_UP_ERRORS: Record<string, string> = {
  form_identifier_exists: "Ya existe una cuenta con este correo. Inicia sesión.",
  form_param_format_invalid: "Revisa el correo: no tiene un formato válido.",
  form_param_value_invalid: "Revisa los datos: alguno no es válido.",
  form_param_nil: "Completa todos los campos.",
  form_email_address_blocked: "No podemos registrar este correo. Usa otro o escríbenos a soporte.",
  form_code_incorrect: "El código no es correcto. Revísalo e inténtalo de nuevo.",
  verification_expired: "El código venció. Pide uno nuevo.",
  verification_failed: "Demasiados intentos con este código. Pide uno nuevo.",
  too_many_requests: "Demasiados intentos. Espera un momento y vuelve a probar.",
  rate_limit_exceeded: "Demasiados intentos. Espera un momento y vuelve a probar.",
  captcha_invalid: "No pudimos comprobar que eres una persona. Recarga la página e inténtalo de nuevo.",
  captcha_missing_token: "No pudimos comprobar que eres una persona. Recarga la página e inténtalo de nuevo.",
  captcha_unavailable: "No pudimos comprobar que eres una persona. Desactiva el bloqueador de anuncios y recarga.",
  action_blocked: "Tu navegador bloqueó la verificación. Desactiva el bloqueador de anuncios y recarga.",
  session_exists: "Ya tienes una sesión abierta. Recarga la página para continuar.",
  sign_up_restricted: "El registro no está disponible para este correo. Escríbenos a soporte.",
  not_allowed_access: "El registro no está disponible para este correo. Escríbenos a soporte.",
};

export const CLERK_SIGN_UP_FALLBACK_ERROR = "No pudimos completar el registro. Inténtalo de nuevo.";

/** Primer código de Clerk que tenga traducción; si ninguno la tiene, el texto genérico. */
export function clerkSignUpErrorMessage(codes: readonly string[]): string {
  for (const code of codes) {
    const message = CLERK_SIGN_UP_ERRORS[code];
    if (message) return message;
  }
  return CLERK_SIGN_UP_FALLBACK_ERROR;
}

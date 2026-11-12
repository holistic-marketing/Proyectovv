import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";

/** `LocalizationResource` de Clerk v7, tomado de las props de ClerkProvider (sin dependencia extra). */
type ClerkLocalization = NonNullable<ComponentProps<typeof ClerkProvider>["localization"]>;

/**
 * Textos de Clerk en español (LATAM) para Ads Holistic.
 *
 * Base: `esES` de @clerk/localizations. Encima, lo que esES deja en inglés en el flujo de
 * acceso (Clerk Protect, errores de verificación, etc.) y el tono de Ads Holistic.
 * Claves verificadas contra `LocalizationResource` (@clerk/shared/dist/types/localization.d.mts).
 *
 * Nota: los textos de `signIn.*` no reciben `{{identifier}}` (el SDK los llama sin parámetros);
 * el correo ya se muestra debajo, en la vista de identidad.
 */
export const holisticClerkLocalizationEs = {
  ...esES,
  formButtonPrimary: "Continuar",
  backButton: "Volver",
  dividerText: "o",
  badge__primary: "Principal",
  footerPageLink__help: "Ayuda",
  footerPageLink__privacy: "Privacidad",
  footerPageLink__terms: "Términos",
  footerActionLink__useAnotherMethod: "Usar otro método",
  formFieldLabel__emailAddress: "Correo electrónico",
  formFieldInputPlaceholder__emailAddress: "tu@correo.com",
  formFieldInput__emailAddress_format: "Formato de ejemplo: nombre@ejemplo.com",
  formFieldInputPlaceholder__password: "Ingresa tu contraseña",
  formFieldInputPlaceholder__signUpPassword: "Crea una contraseña",
  formFieldHintText__optional: "Opcional",

  unstable__errors: {
    ...esES.unstable__errors,
    form_param_nil: "Completa este campo para continuar.",
    form_param_format_invalid: "El formato no es válido. Revísalo e inténtalo de nuevo.",
    form_param_format_invalid__email_address: "Escribe un correo válido, por ejemplo nombre@ejemplo.com.",
    // /sign-in ya no crea cuentas: los clientes nuevos (o de Hecom sin cuenta aún) van a /sign-up.
    form_identifier_not_found:
      "Aún no tienes cuenta con este correo. Créala en «Crear cuenta» usando el mismo correo.",
    form_identifier_exists: "Ya existe una cuenta con este correo. Inicia sesión.",
    form_code_incorrect: "El código no es correcto. Revísalo e inténtalo de nuevo.",
    not_allowed_access: "Este correo no tiene acceso. Escríbenos a soporte si crees que es un error.",
    form_password_pwned:
      "Esta contraseña apareció en una filtración de datos. Usa otra distinta.",
    form_password_incorrect: "La contraseña no es correcta. Inténtalo de nuevo.",
    form_password_untrusted__sign_in:
      "Por seguridad, continúa con otro método de acceso o restablece tu contraseña.",
    captcha_invalid:
      "No pudimos comprobar que eres una persona. Recarga la página e inténtalo de nuevo.",
    captcha_unavailable:
      "No pudimos comprobar que eres una persona. Desactiva el bloqueador de anuncios y recarga.",
    action_blocked:
      "No pudimos completar esta acción. Inténtalo más tarde o escríbenos a soporte si continúa.",
    protect_check_execution_failed: "La verificación no terminó. Inténtalo de nuevo.",
    protect_check_invalid_script:
      "No pudimos cargar la verificación. Escríbenos a soporte si continúa.",
    protect_check_invalid_sdk_url: "La verificación no pudo iniciarse. Escríbenos a soporte.",
    protect_check_script_load_failed:
      "No pudimos cargar la verificación. Revisa tu conexión o desactiva el bloqueador de anuncios y recarga.",
    protect_check_timed_out: "La verificación tardó demasiado. Inténtalo de nuevo.",
    protect_check_unsupported_environment:
      "La verificación no funciona en este navegador. Abre la página en un navegador normal (Chrome, Safari, Edge o Firefox).",
  },

  signIn: {
    ...esES.signIn,
    start: {
      ...esES.signIn?.start,
      title: "Iniciar sesión en {{applicationName}}",
      subtitle: "Ingresa tu correo electrónico para continuar",
      titleCombined: "Entrar a Ads Holistic",
      subtitleCombined: "Usa el correo con el que te registraste.",
      actionText: "¿No tienes una cuenta?",
      actionLink: "Crear cuenta",
    },
    emailCode: {
      ...esES.signIn?.emailCode,
      title: "Verifica tu correo",
      subtitle: "Ingresa el código de 6 dígitos que enviamos a tu correo",
      formTitle: "Código de verificación",
      resendButton: "¿No recibiste el código? Reenviar",
    },
    emailLink: {
      ...esES.signIn?.emailLink,
      title: "Verifica tu correo",
      subtitle: "Abre el enlace que enviamos a tu correo para continuar",
      formTitle: "Enlace de verificación",
      formSubtitle: "Usa el enlace de verificación que enviamos a tu correo",
      resendButton: "¿No recibiste el enlace? Reenviar",
      verifiedTransferable: {
        ...esES.signIn?.emailLink?.verifiedTransferable,
        title: "Correo verificado",
        subtitle: "Vuelve a la pestaña original para continuar",
      },
    },
    alternativeMethods: {
      ...esES.signIn?.alternativeMethods,
      title: "Usar otro método",
      subtitle: "¿Tienes problemas? Puedes usar cualquiera de estos métodos para entrar.",
      actionText: "¿No tienes ninguno de estos?",
      actionLink: "Obtener ayuda",
      blockButton__emailCode: "Enviar un código a {{identifier}}",
      blockButton__emailLink: "Enviar un enlace a {{identifier}}",
    },
    protectCheck: {
      ...esES.signIn?.protectCheck,
      title: "Verificando tu solicitud",
      subtitle: "Espera un momento mientras comprobamos tu solicitud.",
      loading: "Cargando…",
      retryButton: "Intentar de nuevo",
    },
    password: {
      ...esES.signIn?.password,
      subtitle: "para continuar en Ads Holistic",
    },
  },

  signUp: {
    ...esES.signUp,
    start: {
      ...esES.signUp?.start,
      title: "Crear cuenta",
      titleCombined: "Crear cuenta",
      subtitle: "Si ya eres cliente Hecom, usa el mismo correo.",
      subtitleCombined: "Si ya eres cliente Hecom, usa el mismo correo.",
    },
    continue: {
      ...esES.signUp?.continue,
      subtitle: "para continuar en Ads Holistic",
    },
    emailCode: {
      ...esES.signUp?.emailCode,
      subtitle: "Ingresa el código de 6 dígitos que enviamos a tu correo",
    },
    protectCheck: {
      ...esES.signUp?.protectCheck,
      title: "Verificando tu solicitud",
      subtitle: "Espera un momento mientras comprobamos tu solicitud.",
      loading: "Cargando…",
      retryButton: "Intentar de nuevo",
    },
  },
} satisfies ClerkLocalization;

/** @deprecated Usa getClerkLocalization(). */
export const holisticClerkLocalization = holisticClerkLocalizationEs;

/**
 * Clerk siempre en español. Antes dependía de la cookie NEXT_LOCALE del panel: con "en",
 * /sign-in salía entero en inglés (enUS), aunque todo el flujo de acceso de Ads Holistic
 * (registro propio, OTP, correos) es solo en español.
 */
export function getClerkLocalization(): ClerkLocalization {
  return holisticClerkLocalizationEs;
}

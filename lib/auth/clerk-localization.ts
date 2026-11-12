import { enUS, esES, ptBR } from "@clerk/localizations";
import type { AppLocale } from "@/i18n/config";

/** Spanish (LATAM) overrides on top of Clerk esES. */
export const holisticClerkLocalizationEs = {
  ...esES,
  formFieldInputPlaceholder__password: "Ingresa tu contraseña",
  formFieldInputPlaceholder__signUpPassword: "Crea una contraseña",
  formFieldInputPlaceholder__emailAddress: "tu@gmail.com",
  formButtonPrimary: "Continuar",
  signIn: {
    ...esES.signIn,
    start: {
      ...esES.signIn?.start,
      title: "Bienvenido de nuevo",
      subtitle: "Inicia sesión para entrar a tu panel de Ads Holistic.",
      subtitleCombined: "Inicia sesión para entrar a tu panel de Ads Holistic.",
    },
    emailCode: {
      ...esES.signIn?.emailCode,
      subtitle: "para continuar en Holistic",
    },
    password: {
      ...esES.signIn?.password,
      subtitle: "para continuar en Holistic",
    },
  },
  signUp: {
    ...esES.signUp,
    start: {
      ...esES.signUp?.start,
      title: "Crear cuenta",
      subtitle: "Si ya eres cliente Hecom, usa el mismo correo.",
      subtitleCombined: "Si ya eres cliente Hecom, usa el mismo correo.",
    },
    continue: {
      ...esES.signUp?.continue,
      subtitle: "para continuar en Holistic",
    },
    emailCode: {
      ...esES.signUp?.emailCode,
      subtitle: "para continuar en Holistic",
    },
  },
};

/** @deprecated Prefer getClerkLocalization(locale). */
export const holisticClerkLocalization = holisticClerkLocalizationEs;

export function getClerkLocalization(locale: AppLocale) {
  switch (locale) {
    case "en":
      return enUS;
    case "pt-BR":
      return ptBR;
    case "es":
    default:
      return holisticClerkLocalizationEs;
  }
}

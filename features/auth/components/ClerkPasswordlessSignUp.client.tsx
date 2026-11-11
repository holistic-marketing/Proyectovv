"use client";

import { useState, type FormEvent } from "react";
import { useSignUp } from "@clerk/nextjs";
import { clerkRoutes } from "@/lib/auth/clerk";
import {
  getRegisterCountry,
  isValidPhone,
} from "@/lib/auth/register-countries.shared";
import { AuthFormHeading, AuthNotice, AuthSubmitButton } from "./AuthFormUi";
import styles from "./auth.module.css";

const COUNTRY = getRegisterCountry("PE");

type Step = "form" | "check-email" | "other-device" | "expired";

type FieldErrors = Partial<Record<"fullName" | "email" | "phone", string>>;

function errorText(error: { longMessage?: string; message: string } | null | undefined): string {
  if (!error) return "No pudimos completar el registro. Inténtalo de nuevo.";
  return error.longMessage || error.message;
}

function validate(fullName: string, email: string, phone: string): FieldErrors {
  const errors: FieldErrors = {};
  if (fullName.replace(/\s+/g, " ").trim().length < 2) {
    errors.fullName = "Escribe tu nombre completo.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Escribe un correo válido.";
  }
  if (!isValidPhone(COUNTRY, phone)) {
    errors.phone = `Escribe un celular válido de ${COUNTRY.name.es}.`;
  }
  return errors;
}

/**
 * Registro sin contraseña: nombre, correo y celular → enlace mágico de Clerk.
 * El servidor (/auth/clerk/complete) valida de nuevo y crea la ficha en Hecom.
 */
export function ClerkPasswordlessSignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || fetchStatus === "fetching";
  const emailError = fieldErrors.email ?? errors.fields.emailAddress?.longMessage ?? errors.fields.emailAddress?.message;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setFormError(null);

    const cleanName = fullName.replace(/\s+/g, " ").trim();
    const cleanEmail = email.trim().toLowerCase();
    const nextErrors = validate(cleanName, cleanEmail, phone);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await signUp.create({
        emailAddress: cleanEmail,
        unsafeMetadata: {
          fullName: cleanName,
          phone: phone.replace(/\D/g, ""),
          country: COUNTRY.code,
          source: "ah_register",
        },
      });
      if (created.error) {
        setFormError(errorText(created.error));
        return;
      }

      const sent = await signUp.verifications.sendEmailLink({
        verificationUrl: `${window.location.origin}${clerkRoutes.verify}`,
      });
      if (sent.error) {
        setFormError(errorText(sent.error));
        return;
      }
      setStep("check-email");

      // Espera a que el usuario abra el enlace (en esta u otra pestaña/dispositivo).
      const waited = await signUp.verifications.waitForEmailLinkVerification();
      if (waited.error) {
        setFormError(errorText(waited.error));
        setStep("form");
        return;
      }

      const link = signUp.verifications.emailLinkVerification;
      if (link?.status === "expired") {
        setStep("expired");
        return;
      }
      if (signUp.status !== "complete") {
        if (link?.status === "client_mismatch" || link?.verifiedFromTheSameClient === false) {
          setStep("other-device");
          return;
        }
        setFormError("Tu correo quedó verificado, pero falta un paso. Inicia sesión para continuar.");
        setStep("form");
        return;
      }

      const finalized = await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          // Navegación completa: /auth/clerk/complete es un route handler que fija cookies.
          window.location.assign(decorateUrl(clerkRoutes.complete));
        },
      });
      if (finalized.error) {
        setFormError(errorText(finalized.error));
        setStep("form");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function restart() {
    await signUp.reset();
    setFormError(null);
    setStep("form");
  }

  if (step === "check-email") {
    return (
      <div className={styles.form}>
        <AuthFormHeading title="Revisa tu correo">
          Te enviamos un enlace a <strong>{email.trim().toLowerCase()}</strong>. Ábrelo para
          activar tu cuenta; esta pantalla continúa sola.
        </AuthFormHeading>
        <AuthNotice tone="info">Si no lo ves, revisa spam o promociones.</AuthNotice>
        <button type="button" className={styles.secondaryButton} onClick={() => void restart()}>
          Usar otro correo
        </button>
      </div>
    );
  }

  if (step === "other-device") {
    return (
      <div className={styles.form}>
        <AuthFormHeading title="Correo verificado en otro dispositivo">
          Tu cuenta quedó lista. Inicia sesión aquí para continuar.
        </AuthFormHeading>
        <a href={clerkRoutes.signIn} className={styles.secondaryButton}>
          Iniciar sesión
        </a>
      </div>
    );
  }

  if (step === "expired") {
    return (
      <div className={styles.form}>
        <AuthFormHeading title="El enlace venció">
          Pide uno nuevo para terminar tu registro.
        </AuthFormHeading>
        <button type="button" className={styles.secondaryButton} onClick={() => void restart()}>
          Volver a intentar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} aria-busy={busy} noValidate>
      <AuthFormHeading title="Crea tu cuenta">
        Sin contraseña: te enviamos un enlace a tu correo.
      </AuthFormHeading>

      {formError ? <AuthNotice tone="error">{formError}</AuthNotice> : null}

      <div className={styles.fieldGroup}>
        <label htmlFor="signup-full-name" className={styles.fieldLabel}>
          Nombre completo
        </label>
        <input
          id="signup-full-name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Nombre y apellido"
          className="auth-field"
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "signup-full-name-error" : undefined}
        />
        {fieldErrors.fullName ? (
          <p id="signup-full-name-error" className={styles.helpText} role="alert">
            {fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="signup-email" className={styles.fieldLabel}>
          Correo
        </label>
        <input
          id="signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@correo.com"
          className="auth-field"
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "signup-email-error" : undefined}
        />
        {emailError ? (
          <p id="signup-email-error" className={styles.helpText} role="alert">
            {emailError}
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="signup-phone" className={styles.fieldLabel}>
          Celular ({COUNTRY.name.es}, +{COUNTRY.dial})
        </label>
        <input
          id="signup-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder={COUNTRY.phonePlaceholder}
          className="auth-field"
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? "signup-phone-error" : undefined}
        />
        {fieldErrors.phone ? (
          <p id="signup-phone-error" className={styles.helpText} role="alert">
            {fieldErrors.phone}
          </p>
        ) : null}
      </div>

      {/* Bot protection de Clerk (Turnstile) se monta aquí. */}
      <div id="clerk-captcha" />

      <AuthSubmitButton loading={busy} loadingLabel="Enviando enlace…">
        Crear cuenta
      </AuthSubmitButton>
    </form>
  );
}

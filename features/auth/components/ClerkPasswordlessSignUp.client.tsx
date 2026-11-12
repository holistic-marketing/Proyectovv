"use client";

import { useState, type FormEvent } from "react";
import { useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useNow } from "@/hooks/useNow";
import { clerkRoutes } from "@/lib/auth/clerk";
import {
  CLERK_SIGN_UP_FALLBACK_ERROR,
  clerkSignUpErrorMessage,
} from "@/lib/auth/clerk-errors";
import {
  getRegisterCountry,
  isValidPhone,
} from "@/lib/auth/register-countries.shared";
import {
  AuthCodeInput,
  AuthFormHeading,
  AuthNotice,
  AuthSubmitButton,
} from "./AuthFormUi";
import styles from "./auth.module.css";

const COUNTRY = getRegisterCountry("PE");
const CODE_LENGTH = 6;
const RESEND_COOLDOWN_MS = 30_000;

type Step = "form" | "code";

type FieldErrors = Partial<Record<"fullName" | "email" | "phone" | "code", string>>;

type SignUpError = {
  message: string;
  /** Sugerir /sign-in (el correo ya tiene cuenta en Clerk). */
  existingAccount: boolean;
};

/** Códigos de la API de Clerk dentro del error (nunca se muestra su texto en inglés). */
function clerkErrorCodes(error: unknown): string[] {
  if (!error) return [];
  if (isClerkAPIResponseError(error)) {
    return [...error.errors.map((item) => item.code), error.code].filter(Boolean);
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" && code ? [code] : [];
}

function toSignUpError(error: unknown): SignUpError {
  const codes = clerkErrorCodes(error);
  return {
    message: codes.length > 0 ? clerkSignUpErrorMessage(codes) : CLERK_SIGN_UP_FALLBACK_ERROR,
    existingAccount: codes.includes("form_identifier_exists"),
  };
}

function validate(fullName: string, email: string, phone: string): FieldErrors {
  const errors: FieldErrors = {};
  if (fullName.length < 2) {
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
 * Registro sin contraseña: nombre, correo y celular → código de 6 dígitos al correo (email_code),
 * el mismo método que el inicio de sesión. El servidor (/auth/clerk/complete) valida de nuevo
 * y crea la ficha en Hecom con el celular de unsafeMetadata.
 */
export function ClerkPasswordlessSignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const now = useNow(1000);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<SignUpError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);

  const busy = submitting || fetchStatus === "fetching";
  const cleanEmail = email.trim().toLowerCase();
  const clerkEmailCode = errors.fields.emailAddress?.code;
  const emailError =
    fieldErrors.email ?? (clerkEmailCode ? clerkSignUpErrorMessage([clerkEmailCode]) : undefined);
  const resendSeconds = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));

  async function sendCode(): Promise<boolean> {
    const sent = await signUp.verifications.sendEmailCode();
    if (sent.error) {
      setFormError(toSignUpError(sent.error));
      return false;
    }
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setFormError(null);
    setNotice(null);

    const cleanName = fullName.replace(/\s+/g, " ").trim();
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
        setFormError(toSignUpError(created.error));
        return;
      }
      if (await sendCode()) {
        setCode("");
        setStep("code");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setFormError(null);
    setNotice(null);
    if (code.length !== CODE_LENGTH) {
      setFieldErrors({ code: `Escribe los ${CODE_LENGTH} dígitos del código.` });
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      const verified = await signUp.verifications.verifyEmailCode({ code });
      if (verified.error) {
        setFormError(toSignUpError(verified.error));
        return;
      }
      if (signUp.status !== "complete") {
        // Faltaría un dato que pide la instancia de Clerk (missing_requirements).
        setFormError({ message: CLERK_SIGN_UP_FALLBACK_ERROR, existingAccount: false });
        return;
      }
      const finalized = await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          // Navegación completa: /auth/clerk/complete es un route handler que fija cookies.
          window.location.assign(decorateUrl(clerkRoutes.complete));
        },
      });
      if (finalized.error) {
        setFormError(toSignUpError(finalized.error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (busy || resendSeconds > 0) return;
    setFormError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      if (await sendCode()) {
        setCode("");
        setNotice(`Te enviamos un código nuevo a ${cleanEmail}.`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangeEmail() {
    await signUp.reset();
    setCode("");
    setFormError(null);
    setNotice(null);
    setFieldErrors({});
    setResendAvailableAt(0);
    setStep("form");
  }

  const errorNotice = formError ? (
    <AuthNotice tone="error">
      {formError.message}
      {formError.existingAccount ? (
        <>
          {" "}
          <a href={clerkRoutes.signIn}>Ir a iniciar sesión</a>
        </>
      ) : null}
    </AuthNotice>
  ) : null;

  if (step === "code") {
    return (
      <form onSubmit={handleVerify} className={styles.form} aria-busy={busy} noValidate>
        <AuthFormHeading title="Revisa tu correo">
          Escribe el código de {CODE_LENGTH} dígitos que enviamos a <strong>{cleanEmail}</strong>.
        </AuthFormHeading>

        {errorNotice}
        {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}

        <div className={styles.fieldGroup}>
          <label htmlFor="signup-code" className={styles.fieldLabel}>
            Código de verificación
          </label>
          <AuthCodeInput
            id="signup-code"
            value={code}
            onChange={setCode}
            disabled={busy}
            invalid={Boolean(fieldErrors.code)}
            describedBy={fieldErrors.code ? "signup-code-error" : undefined}
          />
          {fieldErrors.code ? (
            <p id="signup-code-error" className={styles.helpText} role="alert">
              {fieldErrors.code}
            </p>
          ) : (
            <p className={styles.helpText}>Si no lo ves, revisa spam o promociones.</p>
          )}
        </div>

        <AuthSubmitButton loading={busy} loadingLabel="Verificando…" disabled={code.length !== CODE_LENGTH}>
          Verificar y entrar
        </AuthSubmitButton>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => void handleResend()}
          disabled={busy || resendSeconds > 0}
        >
          {resendSeconds > 0 ? `Reenviar código en ${resendSeconds} s` : "Reenviar código"}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => void handleChangeEmail()}
          disabled={busy}
        >
          Cambiar correo
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} aria-busy={busy} noValidate>
      <AuthFormHeading title="Crea tu cuenta">
        Sin contraseña: te enviamos un código a tu correo.
      </AuthFormHeading>

      {errorNotice}

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

      <AuthSubmitButton loading={busy} loadingLabel="Enviando código…">
        Crear cuenta
      </AuthSubmitButton>
    </form>
  );
}

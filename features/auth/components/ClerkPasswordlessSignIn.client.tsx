"use client";

import { useState, type FormEvent } from "react";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useNow } from "@/hooks/useNow";
import { clerkRoutes } from "@/lib/auth/clerk";
import {
  CLERK_SIGN_UP_FALLBACK_ERROR,
  clerkSignUpErrorMessage,
} from "@/lib/auth/clerk-errors";
import {
  AuthCodeInput,
  AuthFormHeading,
  AuthNotice,
  AuthSubmitButton,
} from "./AuthFormUi";
import styles from "./auth.module.css";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_MS = 30_000;
const SIGN_IN_FALLBACK_ERROR = "No pudimos iniciar tu sesión. Inténtalo de nuevo.";

type Step = "email" | "code";

type SignInError = {
  message: string;
  /** Correo sin cuenta: sugerir /sign-up. */
  notRegistered: boolean;
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

function toSignInError(error: unknown): SignInError {
  const codes = clerkErrorCodes(error);
  const message = codes.length > 0 ? clerkSignUpErrorMessage(codes) : SIGN_IN_FALLBACK_ERROR;
  return {
    message: message === CLERK_SIGN_UP_FALLBACK_ERROR ? SIGN_IN_FALLBACK_ERROR : message,
    notRegistered: codes.includes("form_identifier_not_found"),
  };
}

/**
 * Inicio de sesión sin contraseña: correo → (precheck: solo correos ya registrados)
 * → código de 6 dígitos de Clerk → /auth/clerk/complete.
 * Un correo sin cuenta no recibe código: se le invita a crear la cuenta en /sign-up.
 */
export function ClerkPasswordlessSignIn() {
  const clerk = useClerk();
  const { signIn, fetchStatus } = useSignIn();
  const now = useNow(1000);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<SignInError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);

  const busy = submitting || fetchStatus === "fetching";
  const cleanEmail = email.trim().toLowerCase();
  const resendSeconds = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));

  async function sendCode(): Promise<boolean> {
    const sent = await signIn.emailCode.sendCode();
    if (sent.error) {
      setFormError(toSignInError(sent.error));
      return false;
    }
    setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
    return true;
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setFormError(null);
    setNotice(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFieldError("Escribe un correo válido, por ejemplo nombre@ejemplo.com.");
      return;
    }
    setFieldError(null);

    setSubmitting(true);
    try {
      // 1) Solo correos registrados reciben código (y se crean en Clerk si faltan).
      const response = await fetch("/api/auth/clerk/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setFormError({
          message: payload.error || SIGN_IN_FALLBACK_ERROR,
          notRegistered: response.status === 403,
        });
        return;
      }

      // 2) Intento de inicio de sesión y código al correo.
      const created = await signIn.create({ identifier: cleanEmail });
      if (created.error) {
        setFormError(toSignInError(created.error));
        return;
      }
      if (await sendCode()) {
        setCode("");
        setStep("code");
      }
    } catch {
      setFormError({ message: SIGN_IN_FALLBACK_ERROR, notRegistered: false });
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
      setFieldError(`Escribe los ${CODE_LENGTH} dígitos del código.`);
      return;
    }
    setFieldError(null);

    setSubmitting(true);
    try {
      const verified = await signIn.emailCode.verifyCode({ code });
      if (verified.error) {
        setFormError(toSignInError(verified.error));
        return;
      }
      if (signIn.status !== "complete") {
        setFormError({ message: SIGN_IN_FALLBACK_ERROR, notRegistered: false });
        return;
      }
      const finalized = await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          // Navegación completa: /auth/clerk/complete es un route handler que fija cookies.
          window.location.assign(decorateUrl(clerkRoutes.complete));
        },
      });
      if (finalized.error) setFormError(toSignInError(finalized.error));
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
    await signIn.reset();
    setCode("");
    setFormError(null);
    setNotice(null);
    setFieldError(null);
    setResendAvailableAt(0);
    setStep("email");
  }

  const errorNotice = formError ? (
    <AuthNotice tone="error">
      {formError.message}
      {formError.notRegistered ? (
        <>
          {" "}
          <a href={clerkRoutes.signUp}>Crear cuenta</a>
        </>
      ) : null}
    </AuthNotice>
  ) : null;

  // Sin clerk-js cargado no se puede enviar el código: ClerkLoadFallback ofrece el OTP de respaldo.
  if (!clerk.loaded) {
    return (
      <div role="status" className={styles.helpText}>
        Cargando acceso…
      </div>
    );
  }

  if (step === "code") {
    return (
      <form data-clerk-ready onSubmit={handleVerify} className={styles.form} aria-busy={busy} noValidate>
        <AuthFormHeading title="Verifica tu correo">
          Escribe el código de {CODE_LENGTH} dígitos que enviamos a <strong>{cleanEmail}</strong>.
        </AuthFormHeading>

        {errorNotice}
        {notice ? <AuthNotice tone="success">{notice}</AuthNotice> : null}

        <div className={styles.fieldGroup}>
          <label htmlFor="signin-code" className={styles.fieldLabel}>
            Código de verificación
          </label>
          <AuthCodeInput
            id="signin-code"
            value={code}
            onChange={setCode}
            disabled={busy}
            invalid={Boolean(fieldError)}
            describedBy={fieldError ? "signin-code-error" : undefined}
          />
          {fieldError ? (
            <p id="signin-code-error" className={styles.helpText} role="alert">
              {fieldError}
            </p>
          ) : (
            <p className={styles.helpText}>Si no lo ves, revisa spam o promociones.</p>
          )}
        </div>

        <AuthSubmitButton loading={busy} loadingLabel="Verificando…" disabled={code.length !== CODE_LENGTH}>
          Entrar
        </AuthSubmitButton>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => void handleResend()}
          disabled={busy || resendSeconds > 0}
        >
          {resendSeconds > 0 ? `Reenviar código en ${resendSeconds} s` : "¿No recibiste el código? Reenviar"}
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
    <form data-clerk-ready onSubmit={handleEmail} className={styles.form} aria-busy={busy} noValidate>
      <AuthFormHeading title="Iniciar sesión">
        Ingresa tu correo electrónico para continuar.
      </AuthFormHeading>

      {errorNotice}

      <div className={styles.fieldGroup}>
        <label htmlFor="signin-email" className={styles.fieldLabel}>
          Correo electrónico
        </label>
        <input
          id="signin-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@correo.com"
          className="auth-field"
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? "signin-email-error" : undefined}
        />
        {fieldError ? (
          <p id="signin-email-error" className={styles.helpText} role="alert">
            {fieldError}
          </p>
        ) : null}
      </div>

      <div id="clerk-captcha" />

      <AuthSubmitButton loading={busy} loadingLabel="Enviando código…">
        Continuar
      </AuthSubmitButton>

      <p className={styles.helpText}>
        ¿No tienes una cuenta? <a href={clerkRoutes.signUp}>Crear cuenta</a>
      </p>
    </form>
  );
}

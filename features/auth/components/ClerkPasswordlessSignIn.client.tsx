"use client";

import { useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useNow } from "@/hooks/useNow";
import { clerkRoutes } from "@/lib/auth/clerk";
import {
  CLERK_SIGN_UP_FALLBACK_ERROR,
  clerkSignUpErrorMessage,
} from "@/lib/auth/clerk-errors";

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

/* Estilos copiados de lib/auth/clerk-appearance.ts para que la tarjeta sea idéntica a <SignIn />. */
const primaryButton =
  "flex w-full items-center justify-center rounded-[10px] bg-[#d47840] px-[1.35rem] py-[0.85rem] text-[0.95rem] font-bold text-white transition-colors hover:bg-[#c46a33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b94708] disabled:cursor-not-allowed disabled:opacity-55";
const inputBase =
  "w-full rounded-[10px] border border-[#dcd8d1] bg-white text-[#242522] outline-none transition-[border-color,box-shadow] placeholder:text-[#9a9790] focus:border-[#d47840] focus:shadow-[0_0_0_2px_rgb(212_120_64_/_0.25)] aria-[invalid=true]:border-[#d14343] disabled:opacity-60";

/** Tarjeta nativa de Clerk: caja con franja crema inferior y tarjeta blanca encima. */
function CardFrame({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[25rem] overflow-hidden rounded-[24px] border border-[#e6e3dd] bg-[#f5f4f1] font-[family-name:var(--font-jakarta)] text-[0.9375rem] shadow-[0_24px_48px_-24px_rgb(15_14_12_/_0.28),0_2px_6px_rgb(15_14_12_/_0.06)]">
      <div className="rounded-b-[20px] border-b border-[#e6e3dd] bg-white px-6 py-8 sm:px-9">{children}</div>
      <div className="flex flex-col items-center gap-3 px-6 py-4 text-center text-[0.8125rem] text-[#676961]">
        {footer}
        <p className="flex items-center gap-1 text-[0.75rem] text-[#9a9790]">
          Secured by <span className="font-bold tracking-tight text-[#676961]">clerk</span>
        </p>
      </div>
    </div>
  );
}

function CardHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col items-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- mismo logo que logoImageUrl de Clerk */}
      <img src="/icon-512.png" alt="Ads Holistic" width={48} height={48} className="mb-5 h-12 w-12 rounded-[12px]" />
      <h1 className="font-[family-name:var(--font-sora)] text-[1.35rem] font-extrabold tracking-[-0.02em] text-[#242522]">
        {title}
      </h1>
      <div className="mt-1 text-[0.9rem] text-[#4f514b]">{children}</div>
    </div>
  );
}

function ErrorText({ id, error }: { id: string; error: SignInError | string }) {
  const message = typeof error === "string" ? error : error.message;
  const notRegistered = typeof error !== "string" && error.notRegistered;
  return (
    <p id={id} role="alert" className="mt-2 text-[0.8125rem] text-[#d14343]">
      {message}
      {notRegistered ? (
        <>
          {" "}
          <a href={clerkRoutes.signUp} className="font-semibold text-[#242522] underline">
            Crear cuenta
          </a>
        </>
      ) : null}
    </p>
  );
}

/** Seis casillas cuadradas independientes; pegar el código las llena todas. */
function CodeBoxes({
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const focus = (index: number) => refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, index))]?.focus();

  function setDigit(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const chars = value.padEnd(CODE_LENGTH, " ").split("");
    for (let i = 0; i < digits.length && index + i < CODE_LENGTH; i += 1) chars[index + i] = digits[i]!;
    onChange(chars.join("").replace(/\s+$/, "").replace(/\s/g, ""));
    focus(index + digits.length);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) onChange(value.slice(0, index) + value.slice(index + 1));
      else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        focus(index - 1);
      }
    } else if (event.key === "ArrowLeft") focus(index - 1);
    else if (event.key === "ArrowRight") focus(index + 1);
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!digits) return;
    event.preventDefault();
    onChange(digits);
    focus(digits.length);
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Código de verificación">
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={CODE_LENGTH}
          autoFocus={index === 0}
          value={value[index] ?? ""}
          onChange={(event) => setDigit(index, event.target.value.slice(-CODE_LENGTH))}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
          disabled={disabled}
          aria-label={`Dígito ${index + 1}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={`${inputBase} h-12 w-11 p-0 text-center text-[1.25rem] font-semibold tabular-nums`}
        />
      ))}
    </div>
  );
}

/**
 * Inicio de sesión sin contraseña con la tarjeta de <SignIn /> de Clerk:
 * correo → precheck (solo correos registrados) → código de 6 dígitos → /auth/clerk/complete.
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
        setNotice("Te enviamos un código nuevo.");
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

  // Sin clerk-js cargado no se puede enviar el código: ClerkLoadFallback ofrece el OTP de respaldo.
  if (!clerk.loaded) {
    return (
      <div role="status" className="py-8 text-center text-[0.9rem] text-[#4f514b]">
        Cargando acceso…
      </div>
    );
  }

  if (step === "code") {
    const codeError = formError ?? fieldError;
    return (
      <CardFrame footer={null}>
        <form data-clerk-ready onSubmit={handleVerify} aria-busy={busy} noValidate>
          <CardHeader title="Verifica tu correo">
            <p>Ingresa el código de verificación enviado a tu correo</p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-[#242522]">
              <span className="font-medium">{cleanEmail}</span>
              <button
                type="button"
                onClick={() => void handleChangeEmail()}
                disabled={busy}
                aria-label="Editar correo"
                className="rounded-md p-1 text-[#676961] transition-colors hover:bg-[#f5f4f1] hover:text-[#242522] disabled:opacity-55"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M11.3 2.3a1.4 1.4 0 0 1 2 2L5.6 12l-2.8.8.8-2.8 7.7-7.7Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </p>
          </CardHeader>

          <CodeBoxes
            value={code}
            onChange={(next) => {
              setCode(next);
              if (fieldError) setFieldError(null);
            }}
            disabled={busy}
            invalid={Boolean(codeError)}
            describedBy={codeError ? "signin-code-error" : undefined}
          />
          <div className="text-center">
            {codeError ? <ErrorText id="signin-code-error" error={codeError} /> : null}
            {notice ? (
              <p role="status" className="mt-2 text-[0.8125rem] text-[#2f7a4b]">
                {notice}
              </p>
            ) : null}
          </div>

          <p className="mt-5 text-center text-[0.8125rem] text-[#676961]">
            ¿No recibiste el código?{" "}
            <button
              type="button"
              onClick={() => void handleResend()}
              disabled={busy || resendSeconds > 0}
              className="font-semibold text-[#242522] hover:underline disabled:cursor-not-allowed disabled:font-medium disabled:text-[#9a9790] disabled:no-underline"
            >
              Reenviar{resendSeconds > 0 ? ` (${resendSeconds})` : ""}
            </button>
          </p>

          <button type="submit" disabled={busy || code.length !== CODE_LENGTH} className={`${primaryButton} mt-6`}>
            {busy ? "Verificando…" : "Continuar"}
          </button>
        </form>
      </CardFrame>
    );
  }

  const emailError = formError ?? fieldError;
  return (
    <CardFrame
      footer={
        <p>
          ¿No tienes una cuenta?{" "}
          <a href={clerkRoutes.signUp} className="font-semibold text-[#242522] hover:underline">
            Crear cuenta
          </a>
        </p>
      }
    >
      <form data-clerk-ready onSubmit={handleEmail} aria-busy={busy} noValidate>
        <CardHeader title="Iniciar sesión">
          <p>Ingresa tu correo electrónico para continuar</p>
        </CardHeader>

        <label htmlFor="signin-email" className="mb-1.5 block text-[0.8125rem] font-semibold text-[#242522]">
          Correo electrónico
        </label>
        <input
          id="signin-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (fieldError) setFieldError(null);
            if (formError) setFormError(null);
          }}
          placeholder="Ingresa tu correo electrónico"
          disabled={busy}
          className={`${inputBase} px-[0.85rem] py-[0.7rem]`}
          aria-invalid={Boolean(emailError) || undefined}
          aria-describedby={emailError ? "signin-email-error" : undefined}
        />
        {emailError ? <ErrorText id="signin-email-error" error={emailError} /> : null}

        <div id="clerk-captcha" />

        <button type="submit" disabled={busy} className={`${primaryButton} mt-6`}>
          {busy ? "Enviando código…" : "Continuar"}
        </button>
      </form>
    </CardFrame>
  );
}

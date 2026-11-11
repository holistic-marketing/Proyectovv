"use client";

import { useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { EmailLinkErrorCodeStatus, isEmailLinkError } from "@clerk/nextjs/errors";
import { AuthFormHeading } from "@/features/auth/components/AuthFormUi";
import styles from "@/features/auth/components/auth.module.css";
import { clerkRoutes } from "@/lib/auth/clerk";

type VerifyState = "verifying" | "other-device" | "expired" | "failed";

/** Destino del enlace mágico: completa la verificación y manda al puente Supabase + Hecom. */
export function EmailLinkVerify() {
  const clerk = useClerk();
  const [state, setState] = useState<VerifyState>("verifying");
  const started = useRef(false);

  useEffect(() => {
    // Efecto justificado: la verificación es una llamada externa a Clerk, una sola vez por carga.
    if (!clerk.loaded || started.current) return;
    started.current = true;
    clerk
      .handleEmailLinkVerification({
        redirectUrlComplete: clerkRoutes.complete,
        redirectUrl: clerkRoutes.signIn,
        onVerifiedOnOtherDevice: () => setState("other-device"),
      })
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          isEmailLinkError(error) &&
          error.code === EmailLinkErrorCodeStatus.Expired
        ) {
          setState("expired");
          return;
        }
        setState("failed");
      });
  }, [clerk]);

  if (state === "other-device") {
    return (
      <AuthFormHeading title="Correo verificado">
        Vuelve a la pestaña o dispositivo donde empezaste: allí continúa solo.
      </AuthFormHeading>
    );
  }

  if (state === "expired" || state === "failed") {
    return (
      <div className={styles.form}>
        <AuthFormHeading title={state === "expired" ? "El enlace venció" : "No pudimos verificar el enlace"}>
          Pide un enlace nuevo para continuar.
        </AuthFormHeading>
        <a href={clerkRoutes.signIn} className={styles.secondaryButton}>
          Volver a iniciar sesión
        </a>
      </div>
    );
  }

  return (
    <div role="status">
      <AuthFormHeading title="Verificando tu correo…">Un momento, te llevamos a tu cuenta.</AuthFormHeading>
    </div>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";
import { AuthNotice } from "./AuthFormUi";

/**
 * Tras un rechazo del puente (/auth/clerk/complete), la cookie de Clerk puede seguir viva
 * un rato y <SignIn> volvería a mandar al puente. Aquí se cierra esa sesión en el navegador
 * y solo se muestra el formulario cuando ya no hay usuario de Clerk.
 */
export function ClerkRejectedGate({ message, children }: { message: string; children: ReactNode }) {
  const clerk = useClerk();
  const signingOut = useRef(false);
  const hasClerkUser = Boolean(clerk.user);

  useEffect(() => {
    // Efecto justificado: cerrar la sesión externa de Clerk una sola vez.
    if (!clerk.loaded || !hasClerkUser || signingOut.current) return;
    signingOut.current = true;
    void clerk.signOut({ redirectUrl: window.location.href });
  }, [clerk, hasClerkUser]);

  return (
    <>
      <AuthNotice tone="error">{message}</AuthNotice>
      {clerk.loaded && !hasClerkUser ? children : null}
    </>
  );
}

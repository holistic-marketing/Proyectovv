"use client";

import { useEffect, useState, type ReactNode } from "react";
import { routes } from "@/config/routes";
import styles from "./auth.module.css";

const WAIT_MS = 8000;

/**
 * Si el formulario de Clerk no aparece (p. ej. Brave Shields o un bloqueador cortan sus scripts),
 * en vez de dejar la tarjeta en blanco se ofrece entrar con el código de siempre.
 */
export function ClerkLoadFallback({ children }: { children: ReactNode }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      // `[data-clerk-ready]`: formularios propios (ClerkPasswordlessSignIn) ya con clerk-js cargado.
      const rendered = document.querySelector(
        ".cl-rootBox input, .cl-rootBox button, .cl-card, [data-clerk-ready]",
      );
      if (!rendered) setStuck(true);
    }, WAIT_MS);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      {children}
      {stuck ? (
        <div className={styles.form} role="alert">
          <p className={styles.helpText}>
            El formulario no cargó. Si usas Brave o un bloqueador de anuncios, desactívalo para este
            sitio y recarga, o entra con un código a tu correo.
          </p>
          <a href={`${routes.login}?codigo=1`} className={styles.secondaryButton}>
            Entrar con código
          </a>
        </div>
      ) : null}
    </>
  );
}

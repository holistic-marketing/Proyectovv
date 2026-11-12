"use client";

import { useEffect, type ReactNode } from "react";

const SIGN_INS_PATH = "/v1/client/sign_ins";

/** Correo enviado por <SignIn> en el body (Clerk usa form-urlencoded). */
function identifierFromBody(body: BodyInit | null | undefined): string | null {
  let params: URLSearchParams | null = null;
  if (typeof body === "string") params = new URLSearchParams(body);
  else if (body instanceof URLSearchParams) params = body;
  else if (body instanceof FormData) {
    const value = body.get("identifier");
    return typeof value === "string" ? value : null;
  }
  return params?.get("identifier") ?? null;
}

function isSignInCreate(input: RequestInfo | URL, method: string): boolean {
  if (method.toUpperCase() !== "POST") return false;
  const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  try {
    return new URL(raw, window.location.href).pathname.endsWith(SIGN_INS_PATH);
  } catch {
    return false;
  }
}

/**
 * Envuelve el <SignIn> nativo de Clerk: antes de que Clerk cree el intento de inicio de sesión
 * (POST …/v1/client/sign_ins con `identifier`), llama a /api/auth/clerk/precheck. Si el correo es
 * de staff, cliente Hecom o usuario existente, el precheck lo crea en Clerk a tiempo; si no, no lo
 * crea y Clerk responde su propio `form_identifier_not_found` (en español) sin enviar código.
 */
export function ClerkSignInPrecheck({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Efecto justificado: se intercepta fetch (API externa del navegador) solo mientras está montado.
    const originalFetch = window.fetch;
    const patchedFetch: typeof window.fetch = async (input, init) => {
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");
      if (isSignInCreate(input, method)) {
        const identifier = identifierFromBody(init?.body)?.trim().toLowerCase();
        if (identifier && identifier.includes("@")) {
          try {
            await originalFetch.call(window, "/api/auth/clerk/precheck", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: identifier }),
            });
          } catch {
            // Si el precheck falla, Clerk sigue igual (y el puente vuelve a filtrar).
          }
        }
      }
      return originalFetch.call(window, input, init);
    };
    window.fetch = patchedFetch;
    return () => {
      if (window.fetch === patchedFetch) window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}

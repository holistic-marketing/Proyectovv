/**
 * Clerk helpers para Ads Holistic.
 * Instancia propia y aislada: sin modo satélite ni dominios compartidos con otros proyectos.
 */

const TRUTHY = new Set(["1", "true", "yes", "on"]);

function envTruthy(value: string | undefined): boolean {
  if (value === undefined || value === "") return false;
  return TRUTHY.has(value.toLowerCase());
}

export function clerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

/** Clerk listo en runtime: basta con las claves de la instancia propia. */
export function clerkRuntimeReady() {
  return clerkConfigured();
}

/**
 * Solo se prende con AUTH_CLERK_LOGIN=true explícito; sin eso (o sin claves) → OTP en /login.
 * Sin claves → OTP en /login. Con claves, AUTH_CLERK_LOGIN=false lo apaga.
 */
export function clerkLoginEnabled() {
  if (!clerkRuntimeReady()) return false;
  const flag = process.env.AUTH_CLERK_LOGIN;
  if (flag === undefined || flag === "") return false;
  return envTruthy(flag);
}

/** Hosts Clerk para Content-Security-Policy (next.config). */
export const clerkCspHosts = {
  scripts: [
    "https://clerk.adsholistic.com",
    "https://*.clerk.accounts.dev",
    // Bot protection (Turnstile) del registro propio.
    "https://challenges.cloudflare.com",
  ],
  connect: [
    "https://clerk.adsholistic.com",
    "https://api.clerk.com",
    "https://*.clerk.accounts.dev",
  ],
  frames: [
    "https://clerk.adsholistic.com",
    "https://*.clerk.accounts.dev",
    "https://challenges.cloudflare.com",
  ],
  images: ["https://img.clerk.com"],
  fonts: ["https://fonts.gstatic.com"],
  styles: ["https://fonts.googleapis.com"],
} as const;

export const clerkRoutes = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  /** Destino del enlace mágico del correo. */
  verify: "/auth/clerk/verify",
  complete: "/auth/clerk/complete",
  afterAuth: "/overview",
} as const;

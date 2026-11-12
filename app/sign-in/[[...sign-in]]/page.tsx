import Link from "next/link";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { AuthSplitShell } from "@/features/auth/components/AuthSplitShell";
import { AuthFormHeading } from "@/features/auth/components/AuthFormUi";
import styles from "@/features/auth/components/auth.module.css";
import { ClerkMountGate } from "@/features/auth/components/ClerkMountGate.client";
import { ClerkAuthShell } from "@/features/auth/components/ClerkAuthShell";
import { ClerkLoadFallback } from "@/features/auth/components/ClerkLoadFallback.client";
import { ClerkRejectedGate } from "@/features/auth/components/ClerkRejectedGate.client";
import {
  clerkConfigured,
  clerkLoginEnabled,
  clerkRoutes,
} from "@/lib/auth/clerk";
import { clerkBridgeErrorMessage } from "@/lib/auth/clerk-errors";
import { routes } from "@/config/routes";

export default async function ClerkSignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!clerkConfigured()) {
    return (
      <AuthSplitShell
        topRight={{ label: "Inicio", href: routes.home }}
        caption={{
          title: "Tu publicidad, en un solo lugar.",
          sub: "Accede a tus cuentas y sigue el movimiento de tu inversión.",
        }}
      >
        <AuthFormHeading title="Inicia sesión">
          Continúa a la página de acceso para ingresar con tu correo.
        </AuthFormHeading>
        <Link
          href={routes.login}
          className={styles.secondaryButton}
        >
          Ir al inicio de sesión
        </Link>
      </AuthSplitShell>
    );
  }

  // Clerk apagado por AUTH_CLERK_LOGIN=false → OTP en /login.
  if (!clerkLoginEnabled()) {
    redirect(routes.login);
  }

  const { error } = await searchParams;
  const rejectedMessage = clerkBridgeErrorMessage(typeof error === "string" ? error : null);

  // Ya tiene sesión de Clerk (p. ej. volvió a /sign-in tras el código): el <SignIn> quedaría
  // en blanco, así que se termina el puente directamente.
  if (!rejectedMessage) {
    const { userId } = await auth();
    if (userId) redirect(clerkRoutes.complete);
  }
  const signIn = (
    <SignIn
      withSignUp
      routing="path"
      path={clerkRoutes.signIn}
      signUpUrl={clerkRoutes.signUp}
      forceRedirectUrl={clerkRoutes.complete}
      fallbackRedirectUrl={clerkRoutes.complete}
      signUpForceRedirectUrl={clerkRoutes.complete}
      signUpFallbackRedirectUrl={clerkRoutes.complete}
    />
  );

  return (
    <ClerkAuthShell>
      <ClerkMountGate>
        <ClerkLoadFallback>
          {rejectedMessage ? (
            <ClerkRejectedGate message={rejectedMessage}>{signIn}</ClerkRejectedGate>
          ) : (
            signIn
          )}
        </ClerkLoadFallback>
      </ClerkMountGate>
    </ClerkAuthShell>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { AuthSplitShell } from "@/features/auth/components/AuthSplitShell";
import { AuthFormHeading } from "@/features/auth/components/AuthFormUi";
import styles from "@/features/auth/components/auth.module.css";
import { ClerkMountGate } from "@/features/auth/components/ClerkMountGate.client";
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
  const signIn = (
    <SignIn
      routing="path"
      path={clerkRoutes.signIn}
      signUpUrl={clerkRoutes.signUp}
      forceRedirectUrl={clerkRoutes.complete}
      fallbackRedirectUrl={clerkRoutes.complete}
    />
  );

  return (
    <AuthSplitShell
      topRight={{ label: "Inicio", href: routes.home }}
      caption={{
        title: "Tu publicidad, en un solo lugar.",
        sub: "Accede a tus cuentas y sigue el movimiento de tu inversión.",
      }}
    >
      <ClerkMountGate>
        {rejectedMessage ? (
          <ClerkRejectedGate message={rejectedMessage}>{signIn}</ClerkRejectedGate>
        ) : (
          signIn
        )}
      </ClerkMountGate>
    </AuthSplitShell>
  );
}

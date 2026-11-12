import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ClerkPasswordlessSignIn } from "@/features/auth/components/ClerkPasswordlessSignIn.client";
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
  // Formulario propio: el código de Clerk solo se envía a correos ya registrados
  // (/api/auth/clerk/precheck). Las cuentas nuevas pasan por /sign-up (nombre y celular).
  // Misma tarjeta blanca que /sign-up sobre el fondo crema del shell.
  const signIn = (
    <div className="relative rounded-[14px] border border-[#e6e3dd] bg-white px-6 py-8 sm:px-8">
      <ClerkPasswordlessSignIn />
    </div>
  );

  return (
    <ClerkAuthShell formLogo={false}>
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

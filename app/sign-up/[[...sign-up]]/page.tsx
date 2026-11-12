import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSplitShell } from "@/features/auth/components/AuthSplitShell";
import { ClerkPasswordlessSignUp } from "@/features/auth/components/ClerkPasswordlessSignUp.client";
import { AuthFormHeading } from "@/features/auth/components/AuthFormUi";
import styles from "@/features/auth/components/auth.module.css";
import { ClerkMountGate } from "@/features/auth/components/ClerkMountGate.client";
import { ClerkAuthShell } from "@/features/auth/components/ClerkAuthShell";
import { clerkConfigured, clerkLoginEnabled, clerkRoutes } from "@/lib/auth/clerk";
import { routes } from "@/config/routes";

export default function ClerkSignUpPage() {
  if (!clerkConfigured()) {
    return (
      <AuthSplitShell
        topRight={{ label: "Iniciar sesión", href: routes.login }}
        caption={{
          title: "Una sola cartera para todas tus cuentas.",
          sub: "Organiza tu inversión publicitaria con Ads Holistic.",
        }}
      >
        <AuthFormHeading title="Crea tu cuenta">
          Para continuar con el registro, vuelve a la página de acceso.
        </AuthFormHeading>
        <Link
          href={routes.login}
          className={styles.secondaryButton}
        >
          Ir a la página de acceso
        </Link>
      </AuthSplitShell>
    );
  }

  if (!clerkLoginEnabled()) {
    redirect(routes.login);
  }

  return (
    <ClerkAuthShell>
      <div className="relative rounded-[14px] border border-[#e6e3dd] bg-white px-6 py-8 sm:px-8">
      <ClerkMountGate>
        <ClerkPasswordlessSignUp />
      </ClerkMountGate>
      </div>
    </ClerkAuthShell>
  );
}

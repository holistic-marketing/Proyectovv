import { redirect } from "next/navigation";
import { AuthSplitShell } from "@/features/auth/components/AuthSplitShell";
import { ClerkMountGate } from "@/features/auth/components/ClerkMountGate.client";
import { routes } from "@/config/routes";
import { clerkLoginEnabled } from "@/lib/auth/clerk";
import { EmailLinkVerify } from "./EmailLinkVerify.client";

export const dynamic = "force-dynamic";

export default function ClerkEmailLinkVerifyPage() {
  // Sin ClerkProvider montado (Clerk apagado) no hay nada que verificar.
  if (!clerkLoginEnabled()) {
    redirect(routes.login);
  }

  return (
    <AuthSplitShell
      topRight={{ label: "Inicio", href: routes.home }}
      caption={{
        title: "Tu publicidad, en un solo lugar.",
        sub: "Accede a tus cuentas y sigue el movimiento de tu inversión.",
      }}
    >
      <ClerkMountGate>
        <EmailLinkVerify />
      </ClerkMountGate>
    </AuthSplitShell>
  );
}

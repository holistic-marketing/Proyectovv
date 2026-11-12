import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm.client";
import { AuthSplitShell } from "@/features/auth/components/AuthSplitShell";
import { routes } from "@/config/routes";
import { clerkLoginEnabled, clerkRoutes } from "@/lib/auth/clerk";
import { serverEnv } from "@/lib/env/env.server";
import { getAuthCopy } from "@/features/auth/i18n/auth-copy";
import { getLandingLocale } from "@/features/landing/i18n/landing-locale.server";

function AuthCardFallback() {
  return (
    <div className="w-full animate-pulse space-y-4 py-4">
      <div className="h-8 w-52 rounded-lg bg-[var(--auth-skeleton)]" />
      <div className="h-4 w-64 rounded bg-[var(--auth-skeleton)]" />
      <div className="h-[3.375rem] rounded-[14px] bg-[var(--auth-skeleton)]" />
      <div className="h-[3.375rem] rounded-[14px] bg-[var(--auth-skeleton)]" />
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // ?codigo=1: respaldo con OTP cuando el formulario de Clerk no carga (Brave, bloqueadores).
  if (clerkLoginEnabled() && params.codigo !== "1") {
    // Conserva el motivo de un rechazo del puente Clerk para mostrarlo en /sign-in.
    const { error } = params;
    const code = typeof error === "string" ? error : null;
    redirect(code ? `${clerkRoutes.signIn}?error=${encodeURIComponent(code)}` : clerkRoutes.signIn);
  }

  const locale = await getLandingLocale();
  const copy = getAuthCopy(locale).login;

  return (
    <AuthSplitShell
      locale={locale}
      liveCompact
      topRight={{ label: copy.topRightLabel, href: routes.register, prompt: copy.topRightPrompt }}
      accountLinkPosition="bottom"
      caption={{
        title: copy.caption,
      }}
    >
      <Suspense fallback={<AuthCardFallback />}>
        <LoginForm hecomOtpEnabled={serverEnv.authHecomOtpLogin} locale={locale} />
      </Suspense>
    </AuthSplitShell>
  );
}

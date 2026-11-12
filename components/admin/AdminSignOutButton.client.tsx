"use client";

import { useState, type ReactNode } from "react";
import { signOutAdminSessionAction } from "@/app/actions/admin-auth";
import { routes } from "@/config/routes";
import { signOutOfClerkIfLoaded } from "@/lib/auth/clerk-sign-out.client";

/** Logout del admin: Supabase + cookies Hecom en el servidor, luego la sesión de Clerk. */
export function AdminSignOutButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    try {
      await signOutAdminSessionAction();
    } catch (error) {
      console.warn("[admin] sign_out_failed", error);
    }
    if (await signOutOfClerkIfLoaded(routes.adminLogin)) return;
    window.location.assign(routes.adminLogin);
  }

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {children}
    </button>
  );
}

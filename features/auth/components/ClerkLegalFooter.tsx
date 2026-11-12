import Link from "next/link";
import { routes } from "@/config/routes";

/** Debajo de la tarjeta de Clerk: términos y volver al sitio (mismo patrón que ImpoERP). */
export function ClerkLegalFooter() {
  return (
    <div className="mt-6 space-y-3 text-center">
      <p className="text-[12px] leading-relaxed text-[#676961]">
        Al continuar aceptas los{" "}
        <Link
          href={routes.terms}
          className="font-semibold text-[#242522] underline-offset-2 hover:underline"
        >
          Términos y condiciones
        </Link>
        .
      </p>
      <Link
        href={routes.home}
        className="inline-block text-[13px] text-[#676961] transition-colors hover:text-[#242522]"
      >
        ← Volver al sitio
      </Link>
    </div>
  );
}

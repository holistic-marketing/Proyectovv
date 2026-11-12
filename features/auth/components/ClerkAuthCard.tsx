import type { ReactNode } from "react";

/**
 * Tarjeta grande que envuelve el formulario de Clerk (estilo panel de operaciones):
 * fondo blanco, sombra profunda y aviso de conexión segura al final.
 */
export function ClerkAuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-[22px] border border-[#ebe8e3] bg-white px-6 pb-6 pt-8 shadow-[0_1px_2px_rgb(36_33_30/0.04),0_32px_80px_-32px_rgb(36_33_30/0.28)] sm:px-8">
      {children}
      <div className="mt-6 flex items-start gap-2.5 rounded-[14px] border border-[#ebe8e3] bg-[#faf9f7] px-3.5 py-3 text-[12px] leading-relaxed text-[#69625c]">
        <svg
          className="mt-[1px] h-3.5 w-3.5 shrink-0 text-[#8a827a]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round" />
        </svg>
        <p>
          <span className="font-semibold text-[#24211e]">Conexión segura.</span> Entras con un
          link que llega a tu correo. Ads Holistic nunca te pedirá contraseñas ni códigos por
          WhatsApp.
        </p>
      </div>
    </div>
  );
}

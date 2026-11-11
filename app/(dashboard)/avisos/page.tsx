import { redirect } from "next/navigation";
import { routes } from "@/config/routes";
import { BroadcastComposer } from "@/features/push/BroadcastComposer.client";
import { requireSession } from "@/lib/auth/guards.server";
import { getActingAsCliente } from "@/lib/hecom/selected-cliente.server";
import { resolvePaymentsFundingCapabilities } from "@/lib/payments/funding-roles.server";
import { BROADCAST_BODY_MAX, BROADCAST_DESTINATIONS, BROADCAST_TITLE_MAX } from "@/lib/push/broadcast.server";

export const dynamic = "force-dynamic";

export default async function AvisosPage() {
  const session = await requireSession();
  const capabilities = await resolvePaymentsFundingCapabilities({
    email: session.email,
    role: session.role,
  });
  if (!capabilities.isStaff && !capabilities.isSuperAdmin) {
    redirect(routes.overview);
  }
  if (await getActingAsCliente(session.id)) {
    redirect(routes.overview);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="shrink-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a6b4a]">Gerente</p>
        <h1 className="mt-0.5 text-[1.15rem] font-semibold tracking-[-0.02em] text-[#1a1714]">Avisos</h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#6b645c]">
          Manda un aviso a todos los clientes. Le llega al celular o a la PC a quien tenga los avisos activos, y
          queda en la campanita de todos.
        </p>
      </header>

      <BroadcastComposer
        destinations={BROADCAST_DESTINATIONS.map((d) => ({ url: d.url, label: d.label }))}
        titleMax={BROADCAST_TITLE_MAX}
        bodyMax={BROADCAST_BODY_MAX}
      />
    </div>
  );
}

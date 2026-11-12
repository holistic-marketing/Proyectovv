import { Suspense, type ComponentProps } from "react";
import { cache } from "react";
import { getHecomClienteShell } from "@/lib/hecom/cliente-dashboard.server";
import { resolveOrganizationIdForHecomCliente } from "@/lib/hecom/resolve-cliente-organization.server";
import { getWalletLedgerBalance } from "@/lib/ledger/ledger.server";
import type { DashboardPersona } from "@/types/dashboard-persona";
import {
  pickClienteWalletOrganizationId,
  sidebarWalletCents,
} from "./sidebar-wallet-balance";
import {
  SidebarWalletCard,
  SidebarWalletCardSkeleton,
} from "./SidebarWalletCard.client";

type SidebarClienteWalletProps = {
  clienteId: string;
  fallbackName: string;
  /** Solo si el cliente no tiene org propia. No es la org del gerente. */
  sessionOrganizationId?: string | null;
  persona?: DashboardPersona;
  actingAsCliente?: boolean;
  onNavigate?: () => void;
  className?: string;
};

const loadSidebarClienteWallet = cache(
  async (clienteId: string, sessionOrganizationId: string | null) => {
    const [shell, resolvedOrgId] = await Promise.all([
      getHecomClienteShell(clienteId, { includeSaldo: false }),
      // Cartera del cliente seleccionado, no la org de quien está “viendo como”.
      resolveOrganizationIdForHecomCliente(clienteId),
    ]);
    const clienteOrgId = pickClienteWalletOrganizationId(
      resolvedOrgId,
      sessionOrganizationId,
    );
    const wallet = clienteOrgId
      ? await getWalletLedgerBalance(clienteOrgId)
      : null;
    return { shell, wallet };
  },
);

async function SidebarClienteWallet({
  clienteId,
  fallbackName,
  sessionOrganizationId = null,
  persona = "cliente",
  actingAsCliente = false,
  onNavigate,
  className,
}: SidebarClienteWalletProps) {
  // Solo la carga va en try/catch; el render de la tarjeta queda fuera.
  let selectedCliente: ComponentProps<typeof SidebarWalletCard>["selectedCliente"];
  try {
    const { shell, wallet } = await loadSidebarClienteWallet(
      clienteId,
      sessionOrganizationId,
    );
    selectedCliente = {
      id: shell?.id ?? clienteId,
      name: shell?.name ?? fallbackName,
      avatarUrl: shell?.avatarUrl ?? null,
      walletBalanceCents: sidebarWalletCents(wallet ?? { availableBalanceCents: null }),
      walletCurrency: wallet?.currency ?? "USD",
    };
  } catch {
    selectedCliente = {
      id: clienteId,
      name: fallbackName,
      avatarUrl: null,
      walletBalanceCents: null,
      walletCurrency: "USD",
    };
  }

  return (
    <SidebarWalletCard
      className={className}
      onNavigate={onNavigate}
      persona={persona}
      actingAsCliente={actingAsCliente}
      selectedCliente={selectedCliente}
    />
  );
}

export function SidebarClienteWalletBoundary(
  props: SidebarClienteWalletProps,
) {
  return (
    <Suspense
      fallback={
        <SidebarWalletCardSkeleton
          name={props.fallbackName}
          onNavigate={props.onNavigate}
          className={props.className}
          persona={props.persona}
          actingAsCliente={props.actingAsCliente}
        />
      }
    >
      <SidebarClienteWallet {...props} />
    </Suspense>
  );
}

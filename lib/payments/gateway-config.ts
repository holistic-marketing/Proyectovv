import type { PaymentGateway, PaymentGatewayId } from "@/types/payment";
import { serverEnv } from "@/lib/env/env.server";
import { STRIPE_PAYMENTS_ENABLED } from "@/lib/payments/stripe-policy";

const STRIPE_ACTIVE = STRIPE_PAYMENTS_ENABLED && Boolean(serverEnv.stripeSecretKey);

/**
 * Gateways visibles en Pagos.
 * Stripe (solo con STRIPE_PAYMENTS_ENABLED + clave), Yape/Plin, manual y cripto.
 * Whop y NOWPayments retirados. Binance Pay usa el flujo manual con comprobante.
 */
export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  ...(STRIPE_ACTIVE
    ? [{ id: "stripe", name: "Tarjeta", description: "Visa, Mastercard y más · pago seguro con Stripe" } as PaymentGateway]
    : []),
  {
    id: "cobrana",
    name: "Yape / Plin",
    description: "Paga con Yape, Plin o transferencia bancaria",
  },
  {
    id: "manual",
    name: "Pago manual",
    description: "Transferencia BCP o Binance Pay · con comprobante",
  },
  {
    id: "crypto",
    name: "Binance Pay",
    description: "Pago en USDT por correo · sube tu comprobante para revisión",
  },
];

export function isGatewayInMaintenance(id: PaymentGatewayId): boolean {
  // Also reject direct API requests for the removed gateway.
  // The crypto tile opens the manual Binance flow; legacy NOWPayments requests stay blocked.
  if (id === "whop" || id === "crypto") return true;
  if (id === "stripe") return !STRIPE_ACTIVE;
  return Boolean(PAYMENT_GATEWAYS.find((g) => g.id === id)?.maintenance);
}

export function getDefaultGatewayId(): PaymentGatewayId {
  const configured = serverEnv.paymentsDefaultProvider;
  const visible = PAYMENT_GATEWAYS.find((g) => g.id === configured && !g.maintenance);
  if (visible) return visible.id;

  const firstActive = PAYMENT_GATEWAYS.find((g) => !g.maintenance);
  return firstActive?.id ?? "manual";
}

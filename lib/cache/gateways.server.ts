import {
  getDefaultGatewayId,
  PAYMENT_GATEWAYS,
} from "@/lib/payments/gateway-config";
import type { PaymentGateway, PaymentGatewayId } from "@/types/payment";

// Static deployment configuration: persistent cache could retain emergency flags
// from a previous deployment or leak preview flags into production.
export async function getCachedPaymentGateways(): Promise<PaymentGateway[]> {
  return PAYMENT_GATEWAYS;
}

export async function getCachedDefaultGatewayId(): Promise<PaymentGatewayId> {
  return getDefaultGatewayId();
}

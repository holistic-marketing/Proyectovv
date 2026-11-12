import { sendTransactionalEmail } from "@/lib/email/email.server";
import {
  buildVerificationCodeEmailHtml,
  VERIFICATION_CODE_SUBJECT,
} from "@/lib/email/templates/verification-code";
import { serverEnv } from "@/lib/env/env.server";
import { siteConfig } from "@/config/site";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Email de acceso: código de 6 dígitos (y enlace mágico real como alternativa discreta).
 * Mismo diseño que la plantilla `verification_code` de Clerk (lib/email/templates/verification-code.ts).
 */
export async function sendHecomOtpEmail(input: {
  to: string;
  code: string;
  magicLink: string;
}): Promise<{ sent: boolean; providerMessageId?: string }> {
  const appUrl = serverEnv.appUrl.replace(/\/$/, "");
  const brand = siteConfig.name;
  const domain = new URL(appUrl).host.replace(/^www\./, "");

  const html = buildVerificationCodeEmailHtml({
    code: escapeHtml(input.code),
    logoUrl: `${appUrl}${siteConfig.logoSrc}`,
    // Icono transparente: el círculo lo pinta la celda (cambia de color en modo oscuro).
    shieldUrl: `${appUrl}/email/shield-icon-warm.png`,
    brand: escapeHtml(brand),
    domain: escapeHtml(domain),
    magicLink: escapeHtml(input.magicLink),
  });

  const text = [
    `Código de verificación`,
    ``,
    `Tu código: ${input.code}`,
    `Expira pronto y solo funciona una vez.`,
    ``,
    `Para proteger tu cuenta, no compartas este código con nadie.`,
    ``,
    `¿Prefieres no copiar el código? Entra con este enlace:`,
    input.magicLink,
    ``,
    `Si no pediste este código, puedes ignorar este correo.`,
    `— ${brand} · ${domain}`,
  ].join("\n");

  return sendTransactionalEmail({
    to: input.to,
    subject: VERIFICATION_CODE_SUBJECT,
    html,
    text,
    templateKey: "auth.hecom.otp",
    idempotencyKey: `email:hecom_otp:${input.to}:${input.code}`,
    metadata: { channel: "hecom_otp" },
  });
}

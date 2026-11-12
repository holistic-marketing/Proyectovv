/**
 * Correo del código de verificación de 6 dígitos — tema crema cálido como /sign-in,
 * con modo oscuro automático.
 *
 * Función pura (sin imports de servidor) para usar el MISMO HTML en:
 * - el OTP propio (Resend, `lib/email/auth-otp.server.ts`), con el código real;
 * - la plantilla `verification_code` de Clerk, con `code = "{{otp_code}}"`.
 *
 * Paleta clara tomada de /sign-in:
 * - fondo #f5f4f1 (`--ah-paper-alt`, clerk-auth-shell.module.css);
 * - tarjeta #ffffff y borde #e6e3dd (lib/auth/clerk-appearance.ts); la franja inferior
 *   también es blanca, separada solo por la línea #e6e3dd, para que la tarjeta se lea entera;
 * - texto #242522 / #4f514b / #676961, borde de campos #dcd8d1, terracota #d47840 / #b94708.
 *
 * Tablas + estilos en línea (modo claro): Gmail y Outlook ignoran flexbox y <svg>.
 * Modo oscuro: clases `em-*` con `@media (prefers-color-scheme: dark)` (Apple Mail,
 * iOS, Outlook macOS) y `[data-ogsc]` / `[data-ogsb]` (Outlook.com: texto / fondos).
 */

export const VERIFICATION_CODE_SUBJECT = "Tu código de verificación";

export type VerificationCodeEmailInput = {
  /** Código ya escapado, o el placeholder de Clerk `{{otp_code}}`. */
  code: string;
  /** URL absoluta del logo (PNG). */
  logoUrl: string;
  /** URL absoluta del icono del escudo (PNG transparente; el círculo lo pinta la celda). */
  shieldUrl: string;
  /** Nombre de marca ya escapado (alt del logo y pie). */
  brand: string;
  /** Dominio visible en el pie, p. ej. "adsholistic.com". */
  domain: string;
  /** Enlace mágico real (solo OTP propio). Opcional: Clerk no lo tiene. */
  magicLink?: string;
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";

/** Modo claro (/sign-in). */
const LIGHT = {
  bg: "#f5f4f1",
  card: "#ffffff",
  border: "#e6e3dd",
  /** Blanco como la tarjeta: si fuera crema se confunde con el fondo y la tarjeta pierde su borde inferior. */
  footer: "#ffffff",
  ink: "#242522",
  body: "#4f514b",
  muted: "#676961",
  codeBox: "#f7f5f0",
  codeBorder: "#dcd8d1",
  /** #d47840 al 12 % sobre blanco. */
  badge: "#faefe8",
  /** #b94708: terracota oscuro de /sign-in, legible (AA) en texto pequeño. */
  link: "#b94708",
} as const;

/** Reglas de modo oscuro; el mismo bloque se repite para cada selector de activación. */
const DARK_RULES: ReadonlyArray<readonly [string, string]> = [
  [".em-bg", "background-color:#0c0a09 !important;"],
  [".em-card", "background-color:#18181b !important;border-color:#27272a !important;box-shadow:none !important;"],
  [".em-card-footer", "background-color:#121215 !important;border-color:#27272a !important;"],
  [".em-badge", "background-color:#2a1a10 !important;"],
  [".em-title", "color:#fafaf9 !important;"],
  [".em-text", "color:#a8a29e !important;"],
  [".em-code-box", "background-color:#27272a !important;border-color:#3f3f46 !important;"],
  [".em-code", "color:#fafaf9 !important;"],
  [".em-link", "color:#e0874f !important;"],
  [".em-muted", "color:#78716c !important;"],
];

function darkRules(prefix: string): string {
  return DARK_RULES.map(([selector, decl]) => `${prefix}${selector}{${decl}}`).join("\n    ");
}

/** CSS del modo oscuro (se exporta para la vista previa forzada). */
export const VERIFICATION_CODE_DARK_CSS = `
    :root{color-scheme:light dark;supported-color-schemes:light dark;}
    @media (prefers-color-scheme: dark) {
    ${darkRules("")}
    }
    ${darkRules("[data-ogsc] ")}
    ${darkRules("[data-ogsb] ")}`;

export function buildVerificationCodeEmailHtml(input: VerificationCodeEmailInput): string {
  const magicLinkRow = input.magicLink
    ? `
                <tr>
                  <td class="em-text" align="center" style="padding:20px 40px 0;font-family:${FONT};font-size:13px;line-height:20px;color:${LIGHT.muted};">
                    ¿Prefieres no copiar el código? <a class="em-link" href="${input.magicLink}" style="color:${LIGHT.link};text-decoration:underline;">Entra con este enlace</a>.
                  </td>
                </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>${VERIFICATION_CODE_SUBJECT}</title>
  <style>${VERIFICATION_CODE_DARK_CSS}
  </style>
</head>
<body class="em-bg" style="margin:0;padding:0;background-color:${LIGHT.bg};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Tu código de verificación es ${input.code}. No lo compartas con nadie.</div>
  <table class="em-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${LIGHT.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <img src="${input.logoUrl}" alt="${input.brand}" width="150" style="display:block;width:150px;max-width:150px;height:auto;border:0;outline:none;" />
            </td>
          </tr>
          <tr>
            <td class="em-card" style="background-color:${LIGHT.card};border:1px solid ${LIGHT.border};border-radius:22px;box-shadow:0 12px 32px rgba(24,24,27,0.06);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:40px 40px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td class="em-badge" align="center" valign="middle" width="48" height="48" style="width:48px;height:48px;background-color:${LIGHT.badge};border-radius:24px;">
                          <img src="${input.shieldUrl}" alt="" width="28" height="28" style="display:block;width:28px;height:28px;border:0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="em-title" align="center" style="padding:20px 40px 0;font-family:${FONT};font-size:24px;line-height:32px;font-weight:700;color:${LIGHT.ink};">
                    Código de verificación
                  </td>
                </tr>
                <tr>
                  <td class="em-text" align="center" style="padding:10px 40px 0;font-family:${FONT};font-size:15px;line-height:24px;color:${LIGHT.body};">
                    Usa este código para continuar. Expira pronto y solo funciona una vez.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:28px 40px 0;">
                    <table class="em-code-box" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${LIGHT.codeBox};border:1px solid ${LIGHT.codeBorder};border-radius:12px;">
                      <tr>
                        <td class="em-code" align="center" style="padding:24px 12px;font-family:${MONO};font-size:34px;line-height:40px;font-weight:700;letter-spacing:12px;color:${LIGHT.ink};">
                          <span class="em-code" style="padding-left:12px;">${input.code}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>${magicLinkRow}
                <tr>
                  <td style="padding:32px 0 0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td class="em-card-footer" align="center" style="padding:18px 40px 20px;background-color:${LIGHT.footer};border-top:1px solid ${LIGHT.border};border-radius:0 0 21px 21px;">
                    <p class="em-text" style="margin:0;font-family:${FONT};font-size:13px;line-height:20px;color:${LIGHT.body};">
                      Para proteger tu cuenta, no compartas este código con nadie.
                    </p>
                    <p class="em-muted" style="margin:6px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${LIGHT.muted};">
                      Si no pediste este código, puedes ignorar este correo.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="em-muted" align="center" style="padding:24px 16px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${LIGHT.muted};">
              © ${input.brand} · ${input.domain}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

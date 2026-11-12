/**
 * Correo del código de verificación de 6 dígitos — diseño claro y minimalista,
 * con modo oscuro automático.
 *
 * Función pura (sin imports de servidor) para usar el MISMO HTML en:
 * - el OTP propio (Resend, `lib/email/auth-otp.server.ts`), con el código real;
 * - la plantilla `verification_code` de Clerk, con `code = "{{otp_code}}"`.
 *
 * Tablas + estilos en línea (modo claro): Gmail y Outlook ignoran flexbox y <svg>.
 * Modo oscuro: clases `em-*` con `@media (prefers-color-scheme: dark)` (Apple Mail,
 * iOS, Outlook macOS) y `[data-ogsc]` / `[data-ogsb]` (Outlook.com: texto / fondos).
 * Donde el cliente no soporta nada de esto, se queda el modo claro en línea.
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

/** Reglas de modo oscuro; el mismo bloque se repite para cada selector de activación. */
const DARK_RULES: ReadonlyArray<readonly [string, string]> = [
  [".em-bg", "background-color:#0b0f19 !important;"],
  [".em-card", "background-color:#111827 !important;border-color:#1f2937 !important;"],
  [".em-badge", "background-color:#27170f !important;"],
  [".em-title", "color:#f8fafc !important;"],
  [".em-text", "color:#94a3b8 !important;"],
  [".em-code-box", "background-color:#1e293b !important;border-color:#334155 !important;"],
  [".em-code", "color:#ffffff !important;"],
  [".em-link", "color:#fb923c !important;"],
  [".em-muted", "color:#64748b !important;"],
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
                  <td class="em-text" align="center" style="padding:16px 40px 0;font-family:${FONT};font-size:13px;line-height:20px;color:#64748b;">
                    ¿Prefieres no copiar el código? <a class="em-link" href="${input.magicLink}" style="color:#ea580c;text-decoration:underline;">Entra con este enlace</a>.
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
<body class="em-bg" style="margin:0;padding:0;background-color:#f8fafc;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Tu código de verificación es ${input.code}. No lo compartas con nadie.</div>
  <table class="em-bg" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:0 0 28px;">
              <img src="${input.logoUrl}" alt="${input.brand}" width="150" style="display:block;width:150px;max-width:150px;height:auto;border:0;outline:none;" />
            </td>
          </tr>
          <tr>
            <td class="em-card" style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding:40px 40px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td class="em-badge" align="center" valign="middle" width="48" height="48" style="width:48px;height:48px;background-color:#fff1e6;border-radius:24px;">
                          <img src="${input.shieldUrl}" alt="" width="28" height="28" style="display:block;width:28px;height:28px;border:0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="em-title" align="center" style="padding:20px 40px 0;font-family:${FONT};font-size:24px;line-height:32px;font-weight:700;color:#0f172a;">
                    Código de verificación
                  </td>
                </tr>
                <tr>
                  <td class="em-text" align="center" style="padding:10px 40px 0;font-family:${FONT};font-size:15px;line-height:24px;color:#475569;">
                    Usa este código para continuar. Expira pronto y solo funciona una vez.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:28px 40px 0;">
                    <table class="em-code-box" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                      <tr>
                        <td class="em-code" align="center" style="padding:24px 12px;font-family:${MONO};font-size:34px;line-height:40px;font-weight:700;letter-spacing:12px;color:#0f172a;">
                          <span class="em-code" style="padding-left:12px;">${input.code}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td class="em-text" align="center" style="padding:24px 40px 0;font-family:${FONT};font-size:13px;line-height:20px;color:#64748b;">
                    Para proteger tu cuenta, no compartas este código con nadie.
                  </td>
                </tr>${magicLinkRow}
                <tr>
                  <td class="em-muted" align="center" style="padding:24px 40px 40px;font-family:${FONT};font-size:13px;line-height:20px;color:#94a3b8;">
                    Si no pediste este código, puedes ignorar este correo.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="em-muted" align="center" style="padding:24px 16px 0;font-family:${FONT};font-size:12px;line-height:18px;color:#94a3b8;">
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

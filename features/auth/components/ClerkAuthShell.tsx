import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import styles from "./clerk-auth-shell.module.css";

const steps = [
  {
    n: "01",
    title: "Recarga tu cartera",
    body: "Con Yape, Plin, bancos o USDT. El saldo se acredita al instante.",
  },
  {
    n: "02",
    title: "Crea tus cuentas TikTok",
    body: "Reparte el saldo entre tus cuentas ads cuando lo necesites.",
  },
  {
    n: "03",
    title: "Mide el ROAS real",
    body: "Gasto y resultados de cada campaña, sin planillas ni dashboards genéricos.",
  },
];

/** Pantalla de acceso con Clerk (sign-in / sign-up), mismo layout que ImpoERP. */
export function ClerkAuthShell({
  children,
  formLogo = true,
}: {
  children: ReactNode;
  /** En /sign-in el logo va dentro de la tarjeta de Clerk. */
  formLogo?: boolean;
}) {
  const year = new Date().getFullYear();

  return (
    <main className={`auth-shell ${styles.shell}`}>
      <aside className={styles.aside}>
        <div className={styles.glow} aria-hidden />
        <div className={styles.grid} aria-hidden />
        <div className={styles.bar} aria-hidden />

        <div className={styles.logoRow}>
          <Link href={routes.home} aria-label={`${siteConfig.name} — inicio`} className="inline-flex">
            <Image
              src="/brand/holistic-marketing-logo.png"
              alt={siteConfig.name}
              width={506}
              height={183}
              sizes="132px"
              className={styles.logo}
              priority
            />
          </Link>
        </div>

        <div className={styles.content}>
          <p className={styles.eyebrow}>Agencia de TikTok Ads</p>
          <h1 className={styles.title}>
            Controla tus campañas TikTok desde un solo <em className={styles.accent}>panel</em>
          </h1>
          <p className={styles.lead}>
            Recarga con billetera, crea tus cuentas TikTok, reparte el saldo y mide el ROAS real
            de cada campaña.
          </p>

          <ol className={styles.steps}>
            {steps.map((s, i) => (
              <li
                key={s.n}
                className={styles.step}
                style={{ "--auth-step-delay": `${120 + i * 90}ms` } as CSSProperties}
              >
                <span className={styles.stepN} aria-hidden>
                  {s.n}
                </span>
                <div>
                  <p className={styles.stepTitle}>{s.title}</p>
                  <p className={styles.stepBody}>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.foot}>
          © {year} {siteConfig.companyName} · Ads Holistic · Perú
        </p>
      </aside>

      <section className={styles.formSide}>
        <div className={styles.formInner}>
          {formLogo ? (
          <Link href={routes.home} aria-label={`${siteConfig.name} — inicio`} className={styles.formLogo}>
            <Image
              src="/brand/holistic-marketing-logo.png"
              alt={siteConfig.name}
              width={506}
              height={183}
              sizes="168px"
              className={styles.formLogoImg}
              priority
            />
          </Link>
          ) : null}
          <div className={styles.mobileIntro}>
            <p className={styles.mobileEyebrow}>Acceso Ads Holistic</p>
            <p className={styles.mobileLead}>
              Controla tus campañas TikTok desde un solo panel.
            </p>
          </div>

          {children}

          <div className={styles.legal}>
            <p>
              Al continuar aceptas los <Link href={routes.terms}>Términos</Link> de Ads Holistic.
            </p>
            <Link href={routes.home} className={styles.back}>
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

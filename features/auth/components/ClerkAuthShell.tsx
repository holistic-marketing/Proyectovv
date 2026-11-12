import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import styles from "./clerk-auth-shell.module.css";

const steps = [
  {
    n: "01",
    title: "Pones tu correo",
    body: "Te llega un link de acceso. Sin contraseñas que recordar.",
  },
  {
    n: "02",
    title: "Validamos tu cuenta",
    body: "Revisamos que seas cliente o gerente de Ads Holistic.",
  },
  {
    n: "03",
    title: "Entras a tu panel",
    body: "Cartera, cuentas ads, pagos y gasto en un solo lugar.",
  },
];

/** Pantalla de acceso con Clerk (sign-in / sign-up), mismo layout que ImpoERP. */
export function ClerkAuthShell({ children }: { children: ReactNode }) {
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
          <p className={styles.eyebrow}>Cómo funciona el acceso</p>
          <h1 className={styles.title}>
            Tu publicidad, en un solo <em className={styles.accent}>lugar</em>
          </h1>
          <p className={styles.lead}>
            Recarga tu cartera, asígnala a tus cuentas ads y sigue el movimiento de tu inversión
            día a día.
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
          <div className={styles.mobileIntro}>
            <p className={styles.mobileEyebrow}>Acceso Ads Holistic</p>
            <p className={styles.mobileLead}>
              Pones tu correo, abres el link y pasas directo a tu panel.
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

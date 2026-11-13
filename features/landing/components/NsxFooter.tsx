import Link from "next/link";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import type { LandingCopy } from "../i18n/landing-copy";

export function NsxFooter({ copy }: { copy: LandingCopy["footer"] }) {
  return (
    <footer className="nsx-footer">
      <div className="nsx-container nsx-footer-row">
        <div className="nsx-footer-brand">
          <strong>{siteConfig.name}</strong>
          <span>{copy.tagline}</span>
        </div>
        <nav className="nsx-footer-nav" aria-label={copy.ariaNav}>
          <a href="#soluciones">{copy.solutions}</a>
          <Link href={routes.terms}>{copy.terms}</Link>
          <Link href={routes.returns}>{copy.returns}</Link>
          <Link href={routes.complaints}>{copy.complaints}</Link>
          <Link href={routes.login}>{copy.login}</Link>
          <Link href={routes.register}>{copy.register}</Link>
        </nav>
        <p className="nsx-footer-copy">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { routes } from "@/config/routes";
import type { LandingCopy } from "../i18n/landing-copy";

export function NsxCta({ copy }: { copy: LandingCopy["cta"] }) {
  return (
    <section className="nsx-cta" aria-labelledby="cta-title">
      <div className="nsx-container nsx-cta-inner">
        <div>
          <span className="nsx-pill nsx-pill-on-dark">{copy.pill}</span>
          <h2 className="nsx-h2 nsx-h2-on-dark" id="cta-title">
            {copy.title}
          </h2>
          <p>{copy.lead}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={routes.register} className="nsx-btn-light">
            {copy.register}
            <span className="nsx-btn-arrow" aria-hidden>
              →
            </span>
          </Link>
          <Link href={routes.login} className="nsx-btn-outline">
            {copy.login}
          </Link>
        </div>
      </div>
    </section>
  );
}

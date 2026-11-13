import Link from "next/link";
import { routes } from "@/config/routes";
import type { LandingCopy } from "../i18n/landing-copy";

/** Banda de referidos (USD 10 por anunciante invitado). */
export function NsxReferral({ copy }: { copy: LandingCopy["referral"] }) {
  return (
    <section className="nsx-section nsx-referral-section" aria-labelledby="referral-title">
      <div className="nsx-container">
        <div className="nsx-referral">
          <div className="nsx-referral-badge" aria-hidden>
            <span>USD</span>
            <strong>10</strong>
          </div>
          <div className="nsx-referral-copy">
            <span className="nsx-pill">{copy.pill}</span>
            <h2 className="nsx-h2" id="referral-title">{copy.title}</h2>
            <p>{copy.body}</p>
          </div>
          <Link href={routes.register} className="nsx-btn-dark nsx-referral-cta">
            {copy.cta} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

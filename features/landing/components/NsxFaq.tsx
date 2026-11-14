import type { LandingCopy } from "../i18n/landing-copy";

/** Preguntas frecuentes con `<details>` nativo (accesible y sin JS). */
export function NsxFaq({ copy }: { copy: LandingCopy["faq"] }) {
  return (
    <section className="nsx-section nsx-faq" id="preguntas" aria-labelledby="faq-title">
      <div className="nsx-container nsx-faq-grid">
        <div className="nsx-section-head">
          <span className="nsx-pill">{copy.pill}</span>
          <h2 className="nsx-h2" id="faq-title">{copy.title}</h2>
          <p>{copy.lead}</p>
        </div>
        <div className="nsx-faq-list">
          {copy.items.map((item, i) => (
            <details key={item.q} className="nsx-faq-item" open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <span className="nsx-faq-icon" aria-hidden />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { LandingCopy } from "../i18n/landing-copy";
import { NsxReveal } from "./NsxReveal.client";

/** Ancla de “Proceso” para el menú — de cero a la primera campaña. */
export function NsxProcess({ copy }: { copy: LandingCopy["process"] }) {
  const steps = copy.steps.map((s, i) => ({ ...s, n: `0${i + 1}` }));

  return (
    <section className="nsx-section nsx-process" id="proceso">
      <div className="nsx-container">
        <div className="nsx-section-head">
          <span className="nsx-pill">{copy.pill}</span>
          <h2 className="nsx-h2">{copy.title}</h2>
          <p>{copy.lead}</p>
        </div>
        <ol className="nsx-process-grid">
          {steps.map((s, i) => (
            <NsxReveal key={s.n} as="li" className="nsx-process-card" delayMs={i * 90}>
              <span className="nsx-process-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </NsxReveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

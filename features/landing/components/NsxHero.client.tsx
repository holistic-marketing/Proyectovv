"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { routes } from "@/config/routes";
import { NsxBtnPrimary, NsxBtnSecondary } from "./NsxButtons";
import { NsxReveal } from "./NsxReveal.client";
import type { LandingCopy } from "../i18n/landing-copy";

// Fotos referenciales (Unsplash).
const AVATARS = [
  "/landing/holistic/avatars/a1.jpg",
  "/landing/holistic/avatars/a2.jpg",
  "/landing/holistic/avatars/a3.jpg",
] as const;

const ROTATE_MS = 2600;

/** Palabra que rota dentro del título; todas apiladas para no mover el layout. */
function RotatingWord({ words }: { words: readonly string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [words.length]);

  return (
    <>
      <span className="nsx-rotator" aria-hidden>
        {words.map((word, i) => (
          <span key={word} className={i === index ? "is-active" : undefined}>
            {word}
          </span>
        ))}
      </span>
      <span className="sr-only">{words[0]}</span>
    </>
  );
}

export function NsxHero({
  copy,
  nav,
}: {
  copy: LandingCopy["hero"];
  nav: LandingCopy["nav"];
}) {
  return (
    <section className="nsx-hero" id="soluciones">
      <div className="nsx-hero-static" aria-hidden />
      <div className="nsx-hero-scrim" aria-hidden />

      <div className="nsx-container relative z-10">
        <div className="nsx-hero-stack">
          <div className="nsx-hero-copy">
            <p className="nsx-pill nsx-hero-eyebrow">{copy.eyebrow}</p>
            <div className="nsx-hero-social">
              <div className="nsx-hero-avatars">
                {AVATARS.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={44}
                    height={44}
                    className="nsx-hero-avatar"
                  />
                ))}
              </div>
              <p className="nsx-hero-social-text">
                <span className="font-semibold text-[var(--nsx-secondary)]">
                  +180
                </span>{" "}
                {copy.social}
              </p>
            </div>

            <div className="nsx-hero-titles">
              <h1 className="nsx-h1 mx-auto max-w-[950px]">
                {copy.titlePrefix} <RotatingWord words={copy.rotating} />
                {copy.titleSuffix ? (
                  <>
                    <br className="hidden sm:block" /> {copy.titleSuffix}
                  </>
                ) : null}
              </h1>
              <p className="nsx-hero-lead">{copy.lead}</p>
            </div>

            <div className="nsx-hero-cta">
              <NsxBtnPrimary
                href={routes.register}
                className="nsx-hero-cta-btn justify-center"
              >
                {nav.register}
              </NsxBtnPrimary>
              <NsxBtnSecondary
                href={routes.login}
                className="nsx-hero-cta-btn justify-center"
              >
                {nav.login}
              </NsxBtnSecondary>
            </div>
          </div>

          <NsxReveal delayMs={80} eager>
            <figure className="nsx-hero-banner relative z-10">
              <Image
                src="/landing/holistic/hero-dashboard.png"
                alt={copy.imageAlt}
                width={1536}
                height={1024}
                priority
                sizes="(max-width: 768px) 100vw, min(1290px, 92vw)"
                className="size-full object-cover object-top"
              />
            </figure>
          </NsxReveal>
        </div>
      </div>

      <figure className="nsx-hero-gradient" aria-hidden>
        <Image
          src="/nexsas/automation/images/bottom-gradient.svg"
          alt=""
          width={1920}
          height={789}
          className="size-full object-cover"
          priority={false}
        />
      </figure>
    </section>
  );
}

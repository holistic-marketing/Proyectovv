import type { LandingLocale } from "./landing-locale";
import type { LandingCopy } from "./types";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { pt } from "./locales/pt";
import { zh } from "./locales/zh";

export type { LandingCopy, ShowcaseTab, ShowcaseTabId } from "./types";

const copies: Record<LandingLocale, LandingCopy> = { es, en, zh, pt };

export function getLandingCopy(locale: LandingLocale): LandingCopy {
  return copies[locale];
}

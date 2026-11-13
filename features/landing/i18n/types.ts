// Tipos del copy de la landing (compartidos por todos los locales).

type Item = { title: string; body: string };
type GalleryItem = { alt: string; caption: string };
type Six<T> = [T, T, T, T, T, T];

export type ShowcaseTabId = "accounts" | "wallet" | "profit" | "cod" | "pixel" | "support";

export type ShowcaseTab = {
  id: ShowcaseTabId;
  label: string;
  title: string;
  body: string;
  bullets: [string, string, string];
};

export type LandingCopy = {
  meta: { title: string; description: string };
  skipToContent: string;
  nav: {
    ariaMain: string;
    product: string;
    ai: string;
    process: string;
    about: string;
    faq: string;
    login: string;
    register: string;
    openMenu: string;
    closeMenu: string;
    language: string;
  };
  hero: {
    /** Etiqueta visible sobre el H1 con la palabra clave principal (SEO). */
    eyebrow: string;
    social: string;
    titlePrefix: string;
    rotating: [string, string, string, string];
    titleSuffix: string;
    lead: string;
    imageAlt: string;
  };
  payments: {
    label: string;
    methods: string[];
  };
  showcase: {
    pill: string;
    title: string;
    lead: string;
    sample: string;
    tabs: Six<ShowcaseTab>;
    mock: {
      accounts: { header: string; account: string; active: string; review: string; create: string };
      wallet: { balance: string; assigned: string; topup: string; account: string };
      profit: { spendToday: string; roas: string; cpa: string; chart: string; alert: string };
      cod: { orders: string; delivered: string; collected: string; realRoas: string; addon: string };
      pixel: { pixel: string; linked: string; test: string };
      support: { chat: string; chatMsg: string; meeting: string; when: string; academy: string; lessons: [string, string, string] };
    };
  };
  ai: {
    pill: string;
    title: string;
    body: string;
    bullets: [string, string, string];
    mock: {
      file: string;
      overall: string;
      clarity: string;
      brand: string;
      compliance: string;
      hook: string;
      risk: string;
      tip: string;
    };
  };
  process: {
    pill: string;
    title: string;
    lead: string;
    steps: [Item, Item, Item, Item];
  };
  extras: {
    pill: string;
    title: string;
    lead: string;
    items: Six<Item>;
    ctaQuestion: string;
    register: string;
    login: string;
  };
  referral: {
    pill: string;
    title: string;
    body: string;
    cta: string;
  };
  about: {
    pill: string;
    title: string;
    lead: string;
    cta: string;
    stats: [string, string, string];
    imageTallAlt: string;
    imageWideAlt: string;
  };
  gallery: {
    pill: string;
    title: string;
    lead: string;
    items: Six<GalleryItem>;
  };
  faq: {
    pill: string;
    title: string;
    lead: string;
    items: Array<{ q: string; a: string }>;
  };
  cta: {
    pill: string;
    title: string;
    lead: string;
    register: string;
    login: string;
  };
  footer: {
    tagline: string;
    ariaNav: string;
    solutions: string;
    terms: string;
    returns: string;
    complaints: string;
    login: string;
    register: string;
  };
};

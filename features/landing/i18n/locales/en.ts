import { siteConfig } from "@/config/site";
import type { LandingCopy } from "../types";

const n = siteConfig.name;

export const en: LandingCopy = {
  meta: {
    title: "TikTok Ads agency · Top up with wallet | Ads Holistic",
    description:
      "Run your TikTok ads: create ad accounts, top up with a wallet and measure real ROAS. For brands and agencies in many countries.",
  },
  skipToContent: "Skip to content",
  nav: {
    ariaMain: "Main",
    product: "Product",
    ai: "AI",
    process: "Process",
    about: "About us",
    faq: "FAQ",
    login: "Log in",
    register: "Sign up",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },
  hero: {
    eyebrow: "TikTok Ads agency",
    social: `teams across Latin America already run on ${n}.`,
    titlePrefix: "Run your",
    rotating: ["TikTok campaigns", "top-ups", "creatives", "profits"],
    titleSuffix: "from one dashboard.",
    lead: "Top up with a wallet, create your TikTok ad accounts, split your balance and measure the real ROAS of every campaign. No spreadsheets, no generic dashboards.",
    imageAlt: `${n} — wallet, TikTok accounts and Hecom operations dashboard`,
  },
  payments: {
    label: "Top up your way",
    methods: ["Wallet", "Bank transfer"],
  },
  showcase: {
    pill: "Product",
    title: "Everything you need to advertise on TikTok",
    lead: "A dashboard built for advertisers and agencies: from topping up to knowing what you really earned.",
    sample: "Sample view",
    tabs: [
      {
        id: "accounts",
        label: "TikTok accounts",
        title: "Create your accounts without waiting",
        body: "Open ad accounts in the Holistic Business Center yourself, right from the dashboard.",
        bullets: [
          "Create up to 2 accounts on your own; need more? We'll help you on WhatsApp.",
          "See each account's status and, if it gets suspended, the reason and an appeal guide.",
          "Everything synced with TikTok Business Manager.",
        ],
      },
      {
        id: "wallet",
        label: "Wallet & top-ups",
        title: "Your balance, where you need it",
        body: "Top up your Holistic wallet and split the balance across your accounts in seconds.",
        bullets: [
          "Wallet or bank transfer.",
          "Assign balance to each account and move it between accounts anytime.",
          "Pull the balance of a suspended account back to your wallet, no tickets needed.",
        ],
      },
      {
        id: "profit",
        label: "Profit & ROAS",
        title: "See which campaign makes you money",
        body: "Live spend and per-campaign metrics so you decide with data, not gut feeling.",
        bullets: [
          "Spend for today, 7 and 30 days, or any range you choose.",
          "Campaign ranking with CTR, CPC, CPM, CPA and ROAS.",
          "Break-even ROAS and alerts when your balance burns too fast.",
        ],
      },
      {
        id: "cod",
        label: "Real Profit COD",
        title: "ROAS on what you actually collected",
        body: "For cash-on-delivery stores: connect Shopify and measure on collected orders, not placed orders.",
        bullets: [
          "Match your Shopify orders with what was collected on delivery.",
          "ROAS and CPA calculated on collected sales.",
          "Your real net profit, not the one Ads Manager promises.",
        ],
      },
      {
        id: "pixel",
        label: "TikTok Pixel",
        title: "Your pixel ready in minutes",
        body: "Create and link your TikTok pixel without fighting the setup.",
        bullets: [
          "Create a pixel and link it to several accounts at once.",
          "Cash-on-delivery events: ViewContent, AddToCart, CompletePayment, PlaceAnOrder.",
          "Send a test event and validate it in Test Events.",
        ],
      },
      {
        id: "support",
        label: "Support & academy",
        title: "You never run it alone",
        body: "Human support and video tutorials so your campaigns get it right the first time.",
        bullets: [
          "Chat and FAQ inside the dashboard.",
          "Book onboarding, review or strategy meetings.",
          "Academy with tutorials: first campaign, pixel, Shopify and suspended accounts.",
        ],
      },
    ],
    mock: {
      accounts: { header: "TikTok accounts", account: "Account", active: "Active", review: "In review", create: "+ Create account" },
      wallet: { balance: "Wallet balance", assigned: "Assigned per account", topup: "Top up", account: "Account" },
      profit: { spendToday: "Spend today", roas: "ROAS", cpa: "CPA", chart: "Spend, last 7 days", alert: "Balance burning fast on Account 02" },
      cod: { orders: "Orders", delivered: "Delivered", collected: "Collected", realRoas: "Real ROAS", addon: "Optional add-on" },
      pixel: { pixel: "TikTok Pixel", linked: "Linked to 3 accounts", test: "Send test event" },
      support: {
        chat: "Support",
        chatMsg: "Hi! We reviewed your campaign and it can spend now.",
        meeting: "Onboarding meeting",
        when: "Tomorrow · 10:00",
        academy: "Academy",
        lessons: ["Your first campaign", "Set up your pixel", "Connect Shopify"],
      },
    },
  },
  ai: {
    pill: "AI for creatives",
    title: "Know if your creative works before you spend",
    body: "Upload your video or image: the AI transcribes the audio and gives you a 0–100 score, the hooks that work, TikTok policy risks and what to improve.",
    bullets: [
      "Overall, clarity, brand and compliance scores.",
      "Spots policy risks before you publish.",
      "If TikTok rejects an ad, see why, how to fix it, and appeal right from the dashboard.",
    ],
    mock: {
      file: "offer_video.mp4",
      overall: "Overall score",
      clarity: "Clarity",
      brand: "Brand",
      compliance: "Compliance",
      hook: "Strong hook in the first 3 seconds",
      risk: "Avoid promising guaranteed results",
      tip: "Show the price before second 8",
    },
  },
  process: {
    pill: "Process",
    title: "From zero to your first campaign",
    lead: "No endless onboarding: four steps and you're advertising.",
    steps: [
      { title: "Sign up", body: "With your details and Peruvian DNI. A code arrives by email and you're in." },
      { title: "Top up your wallet", body: "With a wallet or bank transfer." },
      { title: "Create and assign", body: "Create your TikTok accounts and split the balance between them." },
      { title: "Measure and scale", body: "Check spend, ROAS and creatives, and scale what works." },
    ],
  },
  extras: {
    pill: "And more",
    title: "The details that save you hours",
    lead: `${n} handles what usually gets done by hand across chats, Excel and screenshots.`,
    items: [
      {
        title: "Clear account statement",
        body: "How much you paid, how much you spent and your net monthly balance, with receipts and a shareable link.",
      },
      {
        title: "Instant alerts",
        body: "We notify you when your top-up is credited. Install the dashboard as an app on your phone.",
      },
      {
        title: "Referral program",
        body: "Invite other advertisers and get a USD 10 discount for each one who becomes a client.",
      },
      {
        title: "Pay your way",
        body: "Top up your wallet with Yape, Plin, bank transfer or USDT and assign it to your accounts.",
      },
      {
        title: "Clear roles",
        body: "Client, manager and admin see only what's theirs: same product, different permissions and dashboards.",
      },
      {
        title: "Hecom Club + CRM",
        body: "Collections and operations aligned with what happens on the ground, not an outdated export.",
      },
    ],
    ctaQuestion: "New here or already registered with Hecom? Choose how to get in.",
    register: "Sign up",
    login: "Log in",
  },
  referral: {
    pill: "Invite and earn",
    title: "Earn USD 10 for every advertiser you invite",
    body: "Share your link from the dashboard. Your referral starts without paying the initial monthly fee, and you get USD 10 off your next invoice when they become a client.",
    cta: "Create my account",
  },
  about: {
    pill: "About us",
    title: `The team behind ${n}`,
    lead: "We built this dashboard for a real Latin American problem: too much time in Excel and too much friction between the wallet, TikTok top-ups and each client's Hecom Club operations.",
    cta: "Explore the product",
    stats: [
      "teams and agencies in the network",
      "accounts, Business Manager and top-ups",
      "client top-ups and CRM collections, always up to date",
    ],
    imageTallAlt: `${n}: team reviewing ad operations`,
    imageWideAlt: "Digital operations room with TikTok campaign monitors",
  },
  gallery: {
    pill: "Results in a real setting",
    title: "What day-to-day operations look like",
    lead: `From the war room to each account's details: the same pace we run TikTok Ads and Hecom Club at for ${n} clients.`,
    items: [
      { alt: "Growth team in a planning session", caption: "Weekly planning" },
      { alt: "Spend and wallet dashboard on a monitor", caption: "Live wallet and spend" },
      { alt: "Creators recording content in a studio", caption: "Content and creatives" },
      { alt: "Analyzing TikTok metrics in the office", caption: "TikTok metrics" },
      { alt: "Laptops showing campaign reports", caption: "Closings and reports" },
      { alt: "Collaboration in a marketing war room", caption: "Account coordination" },
    ],
  },
  faq: {
    pill: "FAQ",
    title: "What people ask us most",
    lead: "Have another question? Message us from the dashboard chat.",
    items: [
      {
        q: "What is Ads Holistic?",
        a: `It's the platform of ${n} to publish and manage your TikTok ads: ad accounts, top-ups with a wallet, pixel, AI creative analysis and ROAS reports in one dashboard.`,
      },
      {
        q: "Which ad platforms do you work with?",
        a: "We focus on TikTok Ads: accounts, Business Center, pixel, creatives and reports, all integrated in one dashboard.",
      },
      {
        q: "How do I top up my balance?",
        a: "From your wallet, with a wallet or bank transfer. Then you assign the balance to your accounts.",
      },
      {
        q: "Can I create my own TikTok accounts?",
        a: "Yes. You can create up to 2 accounts on your own from the dashboard. If you need more, we'll help you on WhatsApp.",
      },
      {
        q: "What happens if TikTok suspends my account?",
        a: "You see the reason and an appeal guide, and you can move that account's balance to your wallet or another account without opening a ticket.",
      },
      {
        q: "What do I need to sign up?",
        a: "Your name, Peruvian DNI, phone number and email. We email you a code to verify your account.",
      },
      {
        q: "Do you offer support?",
        a: "Yes: chat and FAQ inside the dashboard, scheduled meetings with the team and an academy with video tutorials.",
      },
    ],
  },
  cta: {
    pill: "Access",
    title: "Full control of your wallet and TikTok, in one dashboard",
    lead: `One login for clients, managers and admins. No extra friction: sign in and operate with the account ${n} gave you.`,
    register: "Sign up",
    login: "Log in",
  },
  footer: {
    tagline: "Wallet, TikTok Ads and Hecom Club operations",
    ariaNav: "Footer",
    solutions: "Solutions",
    terms: "Terms and conditions",
    returns: "Exchanges and returns",
    complaints: "Complaints book",
    login: "Log in",
    register: "Sign up",
  },
};

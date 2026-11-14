import { siteConfig } from "@/config/site";
import type { LandingCopy } from "../types";

const n = siteConfig.name;

export const es: LandingCopy = {
  meta: {
    title: "Agencia de TikTok Ads · Recarga con billetera | Ads Holistic",
    description:
      "Publica tus anuncios en TikTok: crea cuentas publicitarias, recarga con billetera y mide el ROAS real. Para marcas y agencias en varios países.",
  },
  skipToContent: "Saltar al contenido",
  nav: {
    ariaMain: "Principal",
    product: "Producto",
    ai: "IA",
    process: "Proceso",
    about: "Nosotros",
    faq: "Preguntas",
    login: "Iniciar sesión",
    register: "Registrarme",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",
  },
  hero: {
    eyebrow: "Agencia de TikTok Ads",
    social: `equipos en Latam ya operan con ${n}.`,
    titlePrefix: "Controla tus",
    rotating: ["campañas TikTok", "recargas", "creativos", "ganancias"],
    titleSuffix: "desde un solo panel.",
    lead: "Recarga con billetera, crea tus cuentas TikTok, reparte el saldo y mide el ROAS real de cada campaña. Sin planillas ni dashboards genéricos.",
    imageAlt: `${n} — panel de cartera, cuentas TikTok y operación Hecom`,
  },
  payments: {
    label: "Recarga como prefieras",
    methods: ["Billetera", "Transferencia"],
  },
  showcase: {
    pill: "Producto",
    title: "Todo lo que necesitas para anunciar en TikTok",
    lead: "Un panel pensado para anunciantes y agencias: desde la recarga hasta saber cuánto ganaste de verdad.",
    sample: "Vista de ejemplo",
    tabs: [
      {
        id: "accounts",
        label: "Cuentas TikTok",
        title: "Crea tus cuentas sin esperar",
        body: "Abre cuentas publicitarias en el Business Center de Holistic tú mismo, desde el panel.",
        bullets: [
          "Crea hasta 2 cuentas por tu cuenta; si necesitas más, te ayudamos por WhatsApp.",
          "Ves el estado de cada cuenta y, si la suspenden, el motivo y una guía de apelación.",
          "Todo sincronizado con el Business Manager de TikTok.",
        ],
      },
      {
        id: "wallet",
        label: "Cartera y recargas",
        title: "Tu saldo, donde lo necesitas",
        body: "Recarga tu cartera Holistic y reparte el saldo entre tus cuentas en segundos.",
        bullets: [
          "Billetera o transferencia.",
          "Asigna saldo a cada cuenta y muévelo entre cuentas cuando quieras.",
          "Recupera el saldo de una cuenta suspendida a tu cartera, sin tickets.",
        ],
      },
      {
        id: "profit",
        label: "Profit y ROAS",
        title: "Mira qué campaña te hace ganar",
        body: "Gasto en vivo y métricas por campaña para decidir con datos, no con intuición.",
        bullets: [
          "Gasto de hoy, 7 y 30 días, o el rango que elijas.",
          "Ranking de campañas con CTR, CPC, CPM, CPA y ROAS.",
          "ROAS de equilibrio y alertas cuando el saldo se quema demasiado rápido.",
        ],
      },
      {
        id: "cod",
        label: "Real Profit COD",
        title: "El ROAS de lo que realmente cobraste",
        body: "Para tiendas contra entrega: conecta Shopify y mide sobre pedidos cobrados, no sobre pedidos hechos.",
        bullets: [
          "Cruza tus pedidos de Shopify con lo que se cobró en la entrega.",
          "ROAS y CPA calculados sobre ventas cobradas.",
          "Tu ganancia neta real, no la que promete el Ads Manager.",
        ],
      },
      {
        id: "pixel",
        label: "Píxel TikTok",
        title: "Tu píxel listo en minutos",
        body: "Crea y vincula tu píxel de TikTok sin pelearte con la configuración.",
        bullets: [
          "Crea un píxel y vincúlalo a varias cuentas a la vez.",
          "Eventos para contra entrega: ViewContent, AddToCart, CompletePayment, PlaceAnOrder.",
          "Envía un evento de prueba y valídalo en Test Events.",
        ],
      },
      {
        id: "support",
        label: "Soporte y academia",
        title: "Nunca operas solo",
        body: "Soporte humano y tutoriales en video para que tus campañas salgan bien a la primera.",
        bullets: [
          "Chat y preguntas frecuentes dentro del panel.",
          "Agenda reuniones de onboarding, revisión o estrategia.",
          "Academia con tutoriales: primera campaña, píxel, Shopify y cuentas suspendidas.",
        ],
      },
    ],
    mock: {
      accounts: { header: "Cuentas TikTok", account: "Cuenta", active: "Activa", review: "En revisión", create: "+ Crear cuenta" },
      wallet: { balance: "Saldo en cartera", assigned: "Asignado por cuenta", topup: "Recargar", account: "Cuenta" },
      profit: { spendToday: "Gasto hoy", roas: "ROAS", cpa: "CPA", chart: "Gasto últimos 7 días", alert: "Saldo quemándose rápido en Cuenta 02" },
      cod: { orders: "Pedidos", delivered: "Entregados", collected: "Cobrados", realRoas: "ROAS real", addon: "Add-on opcional" },
      pixel: { pixel: "Píxel TikTok", linked: "Vinculado a 3 cuentas", test: "Enviar evento de prueba" },
      support: {
        chat: "Soporte",
        chatMsg: "¡Hola! Revisamos tu campaña y ya puede gastar.",
        meeting: "Reunión de onboarding",
        when: "Mañana · 10:00",
        academy: "Academia",
        lessons: ["Tu primera campaña", "Configura tu píxel", "Conecta Shopify"],
      },
    },
  },
  ai: {
    pill: "Creativos con IA",
    title: "Sabe si tu creativo funciona antes de gastar",
    body: "Sube tu video o imagen: la IA transcribe el audio y te devuelve un puntaje de 0 a 100, los ganchos que funcionan, los riesgos de política de TikTok y qué mejorar.",
    bullets: [
      "Puntaje general, claridad, marca y cumplimiento.",
      "Detecta riesgos de política antes de publicar.",
      "Si TikTok rechaza un anuncio, ves el motivo, cómo corregirlo y puedes apelar desde el panel.",
    ],
    mock: {
      file: "video_oferta.mp4",
      overall: "Puntaje general",
      clarity: "Claridad",
      brand: "Marca",
      compliance: "Cumplimiento",
      hook: "Gancho fuerte en los primeros 3 segundos",
      risk: "Evita prometer resultados garantizados",
      tip: "Muestra el precio antes del segundo 8",
    },
  },
  process: {
    pill: "Proceso",
    title: "De cero a tu primera campaña",
    lead: "Sin onboarding eterno: en cuatro pasos estás anunciando.",
    steps: [
      { title: "Regístrate", body: "Con tus datos y DNI. Te llega un código al correo y entras." },
      { title: "Recarga tu cartera", body: "Con billetera o transferencia." },
      { title: "Crea y asigna", body: "Crea tus cuentas TikTok y reparte el saldo entre ellas." },
      { title: "Mide y escala", body: "Revisa gasto, ROAS y creativos, y escala lo que funciona." },
    ],
  },
  extras: {
    pill: "Y además",
    title: "Los detalles que te ahorran horas",
    lead: `${n} resuelve lo que normalmente se hace a mano entre chats, Excel y capturas.`,
    items: [
      {
        title: "Estado de cuenta claro",
        body: "Cuánto pagaste, cuánto gastaste y tu saldo neto del mes, con comprobantes y un enlace para compartir.",
      },
      {
        title: "Avisos al instante",
        body: "Te avisamos cuando se acredita tu recarga. Instala el panel como app en tu celular.",
      },
      {
        title: "Programa de referidos",
        body: "Invita a otros anunciantes y gana USD 10 de descuento por cada uno que se vuelva cliente.",
      },
      {
        title: "Paga como prefieras",
        body: "Recarga tu cartera con Yape, Plin, bancos o USDT y asígnala a tus cuentas.",
      },
      {
        title: "Roles claros",
        body: "Cliente, gerente y admin ven solo lo suyo: mismo producto, permisos y paneles distintos.",
      },
      {
        title: "Hecom Club + CRM",
        body: "Cobros y operación alineados a lo que pasa en la calle, no a un export desactualizado.",
      },
    ],
    ctaQuestion: "¿Nuevo o ya tienes ficha en Hecom? Elige tu acceso.",
    register: "Registrarme",
    login: "Iniciar sesión",
  },
  referral: {
    pill: "Invita y gana",
    title: "Gana USD 10 por cada anunciante que invites",
    body: "Comparte tu enlace desde el panel. Tu referido empieza sin pagar la mensualidad inicial y tú recibes USD 10 de descuento en tu siguiente factura cuando se vuelve cliente.",
    cta: "Crear mi cuenta",
  },
  about: {
    pill: "Nosotros",
    title: `El equipo detrás de ${n}`,
    lead: "Construimos este panel para un problema real de Latam: demasiado tiempo en Excel y demasiada fricción entre cartera, recargas TikTok y la operación Hecom Club de cada cliente.",
    cta: "Conocer el producto",
    stats: [
      "equipos y agencias en la red",
      "cuentas, Business Manager y recargas",
      "recargas del cliente y cobros CRM al día real",
    ],
    imageTallAlt: `${n}: equipo revisando operación publicitaria`,
    imageWideAlt: "Sala de operación digital con monitores de campañas TikTok",
  },
  gallery: {
    pill: "Resultados en entorno real",
    title: "Así se ve la operación en el día a día",
    lead: `Del war room al detalle de cada cuenta: el mismo ritmo con el que trabajamos TikTok Ads y Hecom Club para los clientes de ${n}.`,
    items: [
      { alt: "Equipo de growth en sesión de planificación", caption: "Planificación semanal" },
      { alt: "Panel de gasto y cartera en monitor", caption: "Cartera y gasto en vivo" },
      { alt: "Creadores grabando contenido en estudio", caption: "Contenido y creativos" },
      { alt: "Análisis de métricas TikTok en oficina", caption: "Métricas TikTok" },
      { alt: "Laptops con reportes de campañas", caption: "Cierres y reportes" },
      { alt: "Colaboración en war room de marketing", caption: "Coordinación de cuenta" },
    ],
  },
  faq: {
    pill: "Preguntas frecuentes",
    title: "Lo que más nos preguntan",
    lead: "¿Tienes otra duda? Escríbenos desde el chat del panel.",
    items: [
      {
        q: "¿Qué es Ads Holistic?",
        a: `Es la plataforma de ${n} para publicar y gestionar tus anuncios en TikTok: cuentas publicitarias, recargas con billetera, píxel, creativos con IA y reportes de ROAS en un solo panel.`,
      },
      {
        q: "¿Con qué plataformas de anuncios trabajan?",
        a: "Nos enfocamos en TikTok Ads: cuentas, Business Center, píxel, creativos y reportes, todo integrado en un solo panel.",
      },
      {
        q: "¿Cómo recargo saldo?",
        a: "Desde tu cartera, con billetera o transferencia. Luego asignas el saldo a tus cuentas.",
      },
      {
        q: "¿Puedo crear mis propias cuentas TikTok?",
        a: "Sí. Puedes crear hasta 2 cuentas por tu cuenta desde el panel. Si necesitas más, te ayudamos por WhatsApp.",
      },
      {
        q: "¿Qué pasa si TikTok suspende mi cuenta?",
        a: "Ves el motivo y una guía de apelación, y puedes mover el saldo de esa cuenta a tu cartera o a otra cuenta sin abrir un ticket.",
      },
      {
        q: "¿Qué necesito para registrarme?",
        a: "Tus nombres, DNI, teléfono y correo. Te enviamos un código por correo para verificar tu cuenta.",
      },
      {
        q: "¿Tienen soporte?",
        a: "Sí: chat y preguntas frecuentes dentro del panel, reuniones agendadas con el equipo y una academia con tutoriales en video.",
      },
    ],
  },
  cta: {
    pill: "Acceso",
    title: "Todo el control de cartera y TikTok, en un solo panel",
    lead: `Un único acceso para clientes, managers y admin. Sin fricción extra: entra y opera con la cuenta que te dio ${n}.`,
    register: "Registrarme",
    login: "Iniciar sesión",
  },
  footer: {
    tagline: "Cartera, TikTok Ads y operación Hecom Club",
    ariaNav: "Pie de página",
    solutions: "Soluciones",
    terms: "Términos y condiciones",
    returns: "Cambios y devoluciones",
    complaints: "Libro de reclamaciones",
    login: "Iniciar sesión",
    register: "Registrarme",
  },
};

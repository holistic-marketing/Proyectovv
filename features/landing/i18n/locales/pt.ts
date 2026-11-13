import { siteConfig } from "@/config/site";
import type { LandingCopy } from "../types";

const n = siteConfig.name;

export const pt: LandingCopy = {
  meta: {
    title: "Agência de TikTok Ads · Recarregue com carteira | Ads Holistic",
    description:
      "Publique seus anúncios no TikTok: crie contas de anúncios, recarregue com carteira e meça o ROAS real. Para marcas e agências em vários países.",
  },
  skipToContent: "Pular para o conteúdo",
  nav: {
    ariaMain: "Principal",
    product: "Produto",
    ai: "IA",
    process: "Processo",
    about: "Sobre nós",
    faq: "Perguntas",
    login: "Entrar",
    register: "Cadastrar",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    language: "Idioma",
  },
  hero: {
    eyebrow: "Agência de TikTok Ads",
    social: `equipes na América Latina já operam com a ${n}.`,
    titlePrefix: "Controle",
    rotating: ["suas campanhas TikTok", "suas recargas", "seus criativos", "seus lucros"],
    titleSuffix: "em um só painel.",
    lead: "Recarregue com carteira, crie suas contas TikTok, distribua o saldo e meça o ROAS real de cada campanha. Sem planilhas nem dashboards genéricos.",
    imageAlt: `${n} — painel de carteira, contas TikTok e operação Hecom`,
  },
  payments: {
    label: "Recarregue como preferir",
    methods: ["Carteira", "Transferência"],
  },
  showcase: {
    pill: "Produto",
    title: "Tudo o que você precisa para anunciar no TikTok",
    lead: "Um painel pensado para anunciantes e agências: da recarga até saber quanto você realmente lucrou.",
    sample: "Visualização de exemplo",
    tabs: [
      {
        id: "accounts",
        label: "Contas TikTok",
        title: "Crie suas contas sem esperar",
        body: "Abra contas de anúncios no Business Center da Holistic você mesmo, pelo painel.",
        bullets: [
          "Crie até 2 contas sozinho; se precisar de mais, ajudamos pelo WhatsApp.",
          "Veja o status de cada conta e, se for suspensa, o motivo e um guia de recurso.",
          "Tudo sincronizado com o Business Manager do TikTok.",
        ],
      },
      {
        id: "wallet",
        label: "Carteira e recargas",
        title: "Seu saldo onde você precisa",
        body: "Recarregue sua carteira Holistic e distribua o saldo entre suas contas em segundos.",
        bullets: [
          "Carteira ou transferência.",
          "Atribua saldo a cada conta e mova entre contas quando quiser.",
          "Recupere o saldo de uma conta suspensa para sua carteira, sem abrir chamado.",
        ],
      },
      {
        id: "profit",
        label: "Lucro e ROAS",
        title: "Veja qual campanha dá lucro",
        body: "Gasto ao vivo e métricas por campanha para decidir com dados, não com intuição.",
        bullets: [
          "Gasto de hoje, 7 e 30 dias, ou o período que você escolher.",
          "Ranking de campanhas com CTR, CPC, CPM, CPA e ROAS.",
          "ROAS de equilíbrio e alertas quando o saldo acaba rápido demais.",
        ],
      },
      {
        id: "cod",
        label: "Real Profit COD",
        title: "O ROAS do que você realmente recebeu",
        body: "Para lojas com pagamento na entrega: conecte a Shopify e meça sobre pedidos pagos, não sobre pedidos feitos.",
        bullets: [
          "Cruze seus pedidos da Shopify com o que foi pago na entrega.",
          "ROAS e CPA calculados sobre vendas recebidas.",
          "Seu lucro líquido real, não o que o Ads Manager promete.",
        ],
      },
      {
        id: "pixel",
        label: "Pixel TikTok",
        title: "Seu pixel pronto em minutos",
        body: "Crie e vincule seu pixel do TikTok sem brigar com a configuração.",
        bullets: [
          "Crie um pixel e vincule a várias contas de uma vez.",
          "Eventos para pagamento na entrega: ViewContent, AddToCart, CompletePayment, PlaceAnOrder.",
          "Envie um evento de teste e valide em Test Events.",
        ],
      },
      {
        id: "support",
        label: "Suporte e academia",
        title: "Você nunca opera sozinho",
        body: "Suporte humano e tutoriais em vídeo para suas campanhas darem certo de primeira.",
        bullets: [
          "Chat e perguntas frequentes dentro do painel.",
          "Agende reuniões de onboarding, revisão ou estratégia.",
          "Academia com tutoriais: primeira campanha, pixel, Shopify e contas suspensas.",
        ],
      },
    ],
    mock: {
      accounts: { header: "Contas TikTok", account: "Conta", active: "Ativa", review: "Em análise", create: "+ Criar conta" },
      wallet: { balance: "Saldo na carteira", assigned: "Atribuído por conta", topup: "Recarregar", account: "Conta" },
      profit: { spendToday: "Gasto hoje", roas: "ROAS", cpa: "CPA", chart: "Gasto últimos 7 dias", alert: "Saldo acabando rápido na Conta 02" },
      cod: { orders: "Pedidos", delivered: "Entregues", collected: "Recebidos", realRoas: "ROAS real", addon: "Add-on opcional" },
      pixel: { pixel: "Pixel TikTok", linked: "Vinculado a 3 contas", test: "Enviar evento de teste" },
      support: {
        chat: "Suporte",
        chatMsg: "Olá! Revisamos sua campanha e ela já pode gastar.",
        meeting: "Reunião de onboarding",
        when: "Amanhã · 10:00",
        academy: "Academia",
        lessons: ["Sua primeira campanha", "Configure seu pixel", "Conecte a Shopify"],
      },
    },
  },
  ai: {
    pill: "Criativos com IA",
    title: "Saiba se seu criativo funciona antes de gastar",
    body: "Envie seu vídeo ou imagem: a IA transcreve o áudio e devolve uma nota de 0 a 100, os ganchos que funcionam, os riscos de política do TikTok e o que melhorar.",
    bullets: [
      "Nota geral, clareza, marca e conformidade.",
      "Detecta riscos de política antes de publicar.",
      "Se o TikTok rejeitar um anúncio, você vê o motivo, como corrigir e pode recorrer pelo painel.",
    ],
    mock: {
      file: "video_oferta.mp4",
      overall: "Nota geral",
      clarity: "Clareza",
      brand: "Marca",
      compliance: "Conformidade",
      hook: "Gancho forte nos primeiros 3 segundos",
      risk: "Evite prometer resultados garantidos",
      tip: "Mostre o preço antes do segundo 8",
    },
  },
  process: {
    pill: "Processo",
    title: "Do zero à sua primeira campanha",
    lead: "Sem onboarding infinito: em quatro passos você já está anunciando.",
    steps: [
      { title: "Cadastre-se", body: "Com seus dados e documento. Você recebe um código no e-mail e entra." },
      { title: "Recarregue sua carteira", body: "Com carteira ou transferência." },
      { title: "Crie e atribua", body: "Crie suas contas TikTok e distribua o saldo entre elas." },
      { title: "Meça e escale", body: "Revise gasto, ROAS e criativos, e escale o que funciona." },
    ],
  },
  extras: {
    pill: "E mais",
    title: "Os detalhes que economizam horas",
    lead: `A ${n} resolve o que normalmente se faz à mão entre chats, Excel e prints.`,
    items: [
      {
        title: "Extrato claro",
        body: "Quanto você pagou, quanto gastou e seu saldo líquido do mês, com comprovantes e um link para compartilhar.",
      },
      {
        title: "Avisos na hora",
        body: "Avisamos quando sua recarga é creditada. Instale o painel como app no celular.",
      },
      {
        title: "Programa de indicação",
        body: "Convide outros anunciantes e ganhe USD 10 de desconto por cada um que virar cliente.",
      },
      {
        title: "Pague como preferir",
        body: "Recarregue sua carteira com Yape, Plin, transferência bancária ou USDT e atribua às suas contas.",
      },
      {
        title: "Papéis claros",
        body: "Cliente, gerente e admin veem só o que é seu: mesmo produto, permissões e painéis diferentes.",
      },
      {
        title: "Hecom Club + CRM",
        body: "Cobranças e operação alinhadas ao que acontece na rua, não a um export desatualizado.",
      },
    ],
    ctaQuestion: "Novo ou já tem ficha na Hecom? Escolha seu acesso.",
    register: "Criar conta",
    login: "Entrar",
  },
  referral: {
    pill: "Convide e ganhe",
    title: "Ganhe USD 10 por cada anunciante que você convidar",
    body: "Compartilhe seu link pelo painel. Seu indicado começa sem pagar a mensalidade inicial e você recebe USD 10 de desconto na próxima fatura quando ele vira cliente.",
    cta: "Criar minha conta",
  },
  about: {
    pill: "Sobre nós",
    title: `A equipe por trás da ${n}`,
    lead: "Construímos este painel para um problema real da América Latina: tempo demais no Excel e atrito demais entre carteira, recargas TikTok e a operação Hecom Club de cada cliente.",
    cta: "Conhecer o produto",
    stats: [
      "equipes e agências na rede",
      "contas, Business Manager e recargas",
      "recargas do cliente e cobranças do CRM em dia",
    ],
    imageTallAlt: `${n}: equipe revisando a operação de anúncios`,
    imageWideAlt: "Sala de operação digital com monitores de campanhas TikTok",
  },
  gallery: {
    pill: "Resultados no dia a dia",
    title: "Assim é a operação no dia a dia",
    lead: `Da war room ao detalhe de cada conta: o mesmo ritmo com que trabalhamos TikTok Ads e Hecom Club para os clientes da ${n}.`,
    items: [
      { alt: "Equipe de growth em sessão de planejamento", caption: "Planejamento semanal" },
      { alt: "Painel de gasto e carteira no monitor", caption: "Carteira e gasto ao vivo" },
      { alt: "Criadores gravando conteúdo em estúdio", caption: "Conteúdo e criativos" },
      { alt: "Análise de métricas TikTok no escritório", caption: "Métricas TikTok" },
      { alt: "Notebooks com relatórios de campanhas", caption: "Fechamentos e relatórios" },
      { alt: "Colaboração na war room de marketing", caption: "Coordenação de conta" },
    ],
  },
  faq: {
    pill: "Perguntas frequentes",
    title: "O que mais nos perguntam",
    lead: "Tem outra dúvida? Escreva para nós pelo chat do painel.",
    items: [
      {
        q: "O que é a Ads Holistic?",
        a: `É a plataforma da ${n} para publicar e gerenciar seus anúncios no TikTok: contas de anúncios, recargas com carteira, pixel, criativos com IA e relatórios de ROAS em um só painel.`,
      },
      {
        q: "Com quais plataformas de anúncios vocês trabalham?",
        a: "Nosso foco é TikTok Ads: contas, Business Center, pixel, criativos e relatórios, tudo integrado em um só painel.",
      },
      {
        q: "Como recarrego saldo?",
        a: "Pela sua carteira, com carteira digital ou transferência. Depois você atribui o saldo às suas contas.",
      },
      {
        q: "Posso criar minhas próprias contas TikTok?",
        a: "Sim. Você pode criar até 2 contas sozinho pelo painel. Se precisar de mais, ajudamos pelo WhatsApp.",
      },
      {
        q: "O que acontece se o TikTok suspender minha conta?",
        a: "Você vê o motivo e um guia de recurso, e pode mover o saldo dessa conta para sua carteira ou para outra conta sem abrir chamado.",
      },
      {
        q: "O que preciso para me cadastrar?",
        a: "Seu nome, documento, telefone e e-mail. Enviamos um código por e-mail para verificar sua conta.",
      },
      {
        q: "Vocês têm suporte?",
        a: "Sim: chat e perguntas frequentes dentro do painel, reuniões agendadas com a equipe e uma academia com tutoriais em vídeo.",
      },
    ],
  },
  cta: {
    pill: "Acesso",
    title: "Todo o controle da carteira e do TikTok em um só painel",
    lead: `Um único acesso para clientes, gerentes e admin. Sem atrito extra: entre e opere com a conta que a ${n} te deu.`,
    register: "Criar conta",
    login: "Entrar",
  },
  footer: {
    tagline: "Carteira, TikTok Ads e operação Hecom Club",
    ariaNav: "Rodapé",
    solutions: "Soluções",
    terms: "Termos e condições",
    returns: "Trocas e devoluções",
    complaints: "Livro de reclamações",
    login: "Entrar",
    register: "Criar conta",
  },
};

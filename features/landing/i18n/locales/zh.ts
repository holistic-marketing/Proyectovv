import { siteConfig } from "@/config/site";
import type { LandingCopy } from "../types";

const n = siteConfig.name;

export const zh: LandingCopy = {
  meta: {
    title: "TikTok 广告代理 · 支持钱包或银行转账充值 | Ads Holistic",
    description:
      "投放你的 TikTok 广告：创建广告账户，使用钱包或银行转账充值，并衡量真实 ROAS。面向多个国家的品牌与代理商。",
  },
  skipToContent: "跳到内容",
  nav: {
    ariaMain: "主导航",
    product: "产品",
    ai: "AI",
    process: "流程",
    about: "关于我们",
    faq: "常见问题",
    login: "登录",
    register: "注册",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    language: "语言",
  },
  hero: {
    eyebrow: "TikTok 广告代理",
    social: `个拉美团队已在使用 ${n} 运营。`,
    titlePrefix: "一个面板，掌控你的",
    rotating: ["TikTok 广告", "充值", "创意素材", "利润"],
    titleSuffix: "",
    lead: "通过钱包或银行转账充值，自助创建 TikTok 广告账户，分配余额，并衡量每个广告系列的真实 ROAS。告别电子表格和千篇一律的仪表盘。",
    imageAlt: `${n} — 钱包、TikTok 账户与 Hecom 运营面板`,
  },
  payments: {
    label: "多种充值方式",
    methods: ["钱包", "银行转账"],
  },
  showcase: {
    pill: "产品",
    title: "在 TikTok 投放广告所需的一切",
    lead: "专为广告主和代理商打造的面板：从充值到清楚知道你真正赚了多少。",
    sample: "示例界面",
    tabs: [
      {
        id: "accounts",
        label: "TikTok 账户",
        title: "无需等待，自助开户",
        body: "直接在面板中，于 Holistic 的 Business Center 开设广告账户。",
        bullets: [
          "可自助创建最多 2 个账户；需要更多？我们通过 WhatsApp 协助你。",
          "查看每个账户的状态；如被封禁，可看到原因和申诉指南。",
          "与 TikTok Business Manager 实时同步。",
        ],
      },
      {
        id: "wallet",
        label: "钱包与充值",
        title: "余额随需分配",
        body: "为 Holistic 钱包充值，几秒内即可将余额分配到各个账户。",
        bullets: [
          "钱包或银行转账。",
          "为每个账户分配余额，并可随时在账户之间转移。",
          "被封禁账户的余额可直接转回钱包，无需提交工单。",
        ],
      },
      {
        id: "profit",
        label: "利润与 ROAS",
        title: "看清哪个广告系列在赚钱",
        body: "实时消耗与各广告系列指标，让你用数据而不是直觉做决策。",
        bullets: [
          "查看今日、7 天、30 天或任意时间范围的消耗。",
          "广告系列排行，包含 CTR、CPC、CPM、CPA 和 ROAS。",
          "盈亏平衡 ROAS，并在余额消耗过快时发出提醒。",
        ],
      },
      {
        id: "cod",
        label: "Real Profit COD",
        title: "基于实际收款的 ROAS",
        body: "适用于货到付款店铺：连接 Shopify，按已收款订单而非下单数来衡量。",
        bullets: [
          "将 Shopify 订单与货到付款的实际收款进行对账。",
          "按已收款销售额计算 ROAS 和 CPA。",
          "你的真实净利润，而不是 Ads Manager 给出的数字。",
        ],
      },
      {
        id: "pixel",
        label: "TikTok Pixel",
        title: "几分钟内配置好 Pixel",
        body: "轻松创建并关联你的 TikTok Pixel，无需为配置发愁。",
        bullets: [
          "创建一个 Pixel 并同时关联多个账户。",
          "货到付款事件：ViewContent、AddToCart、CompletePayment、PlaceAnOrder。",
          "发送测试事件，并在 Test Events 中验证。",
        ],
      },
      {
        id: "support",
        label: "支持与学院",
        title: "你从不孤军奋战",
        body: "真人支持加视频教程，让你的广告一次就跑对。",
        bullets: [
          "面板内置聊天与常见问题。",
          "预约入门、复盘或策略会议。",
          "学院教程：第一个广告系列、Pixel、Shopify 与账户封禁处理。",
        ],
      },
    ],
    mock: {
      accounts: { header: "TikTok 账户", account: "账户", active: "正常", review: "审核中", create: "+ 创建账户" },
      wallet: { balance: "钱包余额", assigned: "各账户分配", topup: "充值", account: "账户" },
      profit: { spendToday: "今日消耗", roas: "ROAS", cpa: "CPA", chart: "近 7 天消耗", alert: "账户 02 余额消耗过快" },
      cod: { orders: "订单", delivered: "已送达", collected: "已收款", realRoas: "真实 ROAS", addon: "可选附加功能" },
      pixel: { pixel: "TikTok Pixel", linked: "已关联 3 个账户", test: "发送测试事件" },
      support: {
        chat: "客服",
        chatMsg: "你好！我们已检查你的广告系列，现在可以开始消耗了。",
        meeting: "入门会议",
        when: "明天 · 10:00",
        academy: "学院",
        lessons: ["你的第一个广告系列", "配置你的 Pixel", "连接 Shopify"],
      },
    },
  },
  ai: {
    pill: "AI 创意分析",
    title: "花钱之前，先知道你的创意是否有效",
    body: "上传视频或图片：AI 会转写音频，给出 0–100 分的评分、有效的开头钩子、TikTok 政策风险以及改进建议。",
    bullets: [
      "总分、清晰度、品牌与合规评分。",
      "发布前识别政策风险。",
      "如果 TikTok 拒绝了广告，可查看原因和修改方法，并直接在面板中申诉。",
    ],
    mock: {
      file: "offer_video.mp4",
      overall: "总分",
      clarity: "清晰度",
      brand: "品牌",
      compliance: "合规",
      hook: "前 3 秒的开头很有吸引力",
      risk: "避免承诺保证效果",
      tip: "在第 8 秒前展示价格",
    },
  },
  process: {
    pill: "流程",
    title: "从零到你的第一个广告系列",
    lead: "无需冗长的上手流程：四步即可开始投放。",
    steps: [
      { title: "注册", body: "填写资料和秘鲁 DNI，邮箱收到验证码即可登录。" },
      { title: "为钱包充值", body: "使用钱包或银行转账。" },
      { title: "创建并分配", body: "创建你的 TikTok 账户，并在账户之间分配余额。" },
      { title: "衡量并扩量", body: "查看消耗、ROAS 和创意表现，放大有效的投放。" },
    ],
  },
  extras: {
    pill: "更多功能",
    title: "为你节省数小时的细节",
    lead: `${n} 帮你处理原本需要在聊天、Excel 和截图之间手动完成的工作。`,
    items: [
      {
        title: "清晰的对账单",
        body: "你付了多少、花了多少、本月净余额，附带凭证和可分享的链接。",
      },
      {
        title: "即时通知",
        body: "充值到账时立即通知你。还可以把面板安装为手机应用。",
      },
      {
        title: "推荐计划",
        body: "邀请其他广告主，每成功一位成为客户，你即可获得 USD 10 折扣。",
      },
      {
        title: "灵活付款",
        body: "通过 Yape、Plin、银行转账或 USDT 为钱包充值，并分配到你的账户。",
      },
      {
        title: "角色清晰",
        body: "客户、经理和管理员只看到属于自己的内容：同一产品，不同权限与面板。",
      },
      {
        title: "Hecom Club + CRM",
        body: "收款与运营与一线实际情况保持一致，而不是依赖过时的导出文件。",
      },
    ],
    ctaQuestion: "新用户，还是已在 Hecom 登记？选择你的入口。",
    register: "注册",
    login: "登录",
  },
  referral: {
    pill: "邀请有礼",
    title: "每邀请一位广告主，赚取 USD 10",
    body: "在面板中分享你的专属链接。被邀请人无需支付首月费用即可开始使用；当对方成为客户后，你的下一张账单将减免 USD 10。",
    cta: "创建我的账户",
  },
  about: {
    pill: "关于我们",
    title: `${n} 背后的团队`,
    lead: "我们打造这个面板，是为了解决拉美的一个真实问题：在 Excel 上耗费太多时间，钱包、TikTok 充值与每位客户的 Hecom Club 运营之间摩擦太多。",
    cta: "了解产品",
    stats: [
      "网络中的团队与代理商",
      "账户、Business Manager 与充值",
      "客户充值与 CRM 收款实时同步",
    ],
    imageTallAlt: `${n}：团队正在审查广告运营`,
    imageWideAlt: "配有 TikTok 广告监控屏的数字运营室",
  },
  gallery: {
    pill: "真实场景中的成果",
    title: "日常运营的真实样貌",
    lead: `从作战室到每个账户的细节：这就是我们为 ${n} 客户运营 TikTok Ads 和 Hecom Club 的节奏。`,
    items: [
      { alt: "增长团队正在进行规划会议", caption: "每周规划" },
      { alt: "显示器上的消耗与钱包面板", caption: "实时钱包与消耗" },
      { alt: "创作者在工作室拍摄内容", caption: "内容与创意" },
      { alt: "在办公室分析 TikTok 数据", caption: "TikTok 数据" },
      { alt: "展示广告报告的笔记本电脑", caption: "结算与报告" },
      { alt: "营销作战室中的协作", caption: "账户协调" },
    ],
  },
  faq: {
    pill: "常见问题",
    title: "大家最常问的问题",
    lead: "还有其他疑问？请通过面板内的聊天联系我们。",
    items: [
      {
        q: "Ads Holistic 是什么？",
        a: `它是 ${n} 的平台，用于投放和管理你的 TikTok 广告：广告账户、通过钱包或银行转账充值、Pixel、AI 创意分析和 ROAS 报表，全部集中在一个面板中。`,
      },
      {
        q: "你们支持哪些广告平台？",
        a: "我们专注于 TikTok Ads：账户、Business Center、Pixel、创意素材和报表，全部集成在一个面板中。",
      },
      {
        q: "如何充值余额？",
        a: "通过银行转账为钱包充值，然后将余额分配到你的账户。",
      },
      {
        q: "我可以自己创建 TikTok 账户吗？",
        a: "可以。你可以在面板中自助创建最多 2 个账户。如需更多，我们会通过 WhatsApp 协助你。",
      },
      {
        q: "如果 TikTok 封禁了我的账户怎么办？",
        a: "你会看到封禁原因和申诉指南，并且无需提交工单，就能把该账户的余额转回钱包或转到其他账户。",
      },
      {
        q: "注册需要什么？",
        a: "你的姓名、秘鲁 DNI、电话和邮箱。我们会通过邮件发送验证码来验证你的账户。",
      },
      {
        q: "你们提供支持吗？",
        a: "提供：面板内的聊天和常见问题、与团队预约会议，以及包含视频教程的学院。",
      },
    ],
  },
  cta: {
    pill: "访问",
    title: "钱包与 TikTok 全面掌控，尽在一个面板",
    lead: `客户、经理和管理员共用一个入口。没有额外麻烦：使用 ${n} 提供的账户登录即可开始运营。`,
    register: "注册",
    login: "登录",
  },
  footer: {
    tagline: "钱包、TikTok Ads 与 Hecom Club 运营",
    ariaNav: "页脚",
    solutions: "解决方案",
    terms: "条款与条件",
    returns: "换货与退货",
    complaints: "投诉登记簿",
    login: "登录",
    register: "注册",
  },
};

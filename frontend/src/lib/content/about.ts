import { db } from "@/lib/db";

export type AboutStat = {
  value: string;
  label: string;
};

export type AboutTextItem = {
  title: string;
  description: string;
};

export type AboutTermItem = {
  title: string;
  description: string;
};

export type AboutContent = {
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroStats: AboutStat[];
  serviceCards: AboutTextItem[];
  processEyebrow: string;
  processTitle: string;
  processSteps: AboutTextItem[];
  founderEyebrow: string;
  founderName: string;
  founderRole: string;
  founderPhoto: string;
  founderBio: string;
  founderBullets: string[];
  founderStats: AboutStat[];
  teamEyebrow: string;
  teamTitle: string;
  metricsTitle: string;
  metrics: AboutStat[];
  reasonsTitle: string;
  reasons: AboutTextItem[];
  termsTitle: string;
  termsText: string;
  termsButtonLabel: string;
  termsItems: AboutTermItem[];
};

export const defaultAvatar = "/team/default-avatar.svg";
export const defaultFounderPhoto = "/team/founder-default.png";

export const defaultAboutContent: AboutContent = {
  heroEyebrow: "من نحن",
  heroTitle: "نساعد العلامات التجارية على",
  heroHighlight: "النمو بذكاء واستدامة",
  heroSubtitle:
    "في STS نجمع بين البيانات والإبداع والاستراتيجية لبناء حلول تسويقية تحقق نتائج حقيقية وقابلة للقياس، من غير ما نقدم خدمات ثابتة لكل عميل.",
  heroStats: [
    { value: "+250", label: "حملة ناجحة" },
    { value: "+5M", label: "إجمالي المشاهدات" },
    { value: "+18%", label: "متوسط نمو العملاء" },
    { value: "5", label: "سنوات خبرة" },
  ],
  serviceCards: [
    { title: "قيادة مدفوعة بالبيانات", description: "قرارات مبنية على تحليل واضح ومؤشرات أداء." },
    { title: "فريق متخصص ومتكامل", description: "استراتيجية، محتوى، إعلانات، وتحسين مستمر." },
    { title: "أفكار تنمو معك", description: "حلول قابلة للتوسع حسب مرحلة علامتك." },
    { title: "شريك طويل الأجل", description: "نركز على النمو المستدام لا النتائج المؤقتة." },
  ],
  processEyebrow: "كيف نعمل",
  processTitle: "من الاستراتيجية إلى النمو",
  processSteps: [
    { title: "نستمع ونفهم", description: "نحلل أهدافك وتحدياتك وجمهورك وسوقك." },
    { title: "نبحث ونحلل", description: "نراجع الأداء والمنافسين وفرص التحسين." },
    { title: "نخطط ونستهدف", description: "نبني استراتيجية مخصصة بجدول عمل واضح." },
    { title: "ننفذ ونراقب", description: "نطلق الحملات ونقيس مؤشرات الأداء." },
    { title: "نحسن ونطور", description: "نحلل النتائج ونحسن الأداء بشكل مستمر." },
    { title: "ننمو معك", description: "نوسع الاستراتيجيات الناجحة بثقة." },
  ],
  founderEyebrow: "المدير العام",
  founderName: "أحمد محمد",
  founderRole: "خبير في التسويق الرقمي والاستراتيجيات",
  founderPhoto: defaultFounderPhoto,
  founderBio:
    "خبير في التسويق الرقمي والاستراتيجيات التسويقية، عمل مع عشرات العلامات التجارية والقطاعات التجارية لتحقيق نتائج مستدامة.",
  founderBullets: [
    "متخصص في تحليل البيانات وبناء القرارات الاستراتيجية.",
    "خبرة في إدارة حملات إعلانية احترافية محليًا وعالميًا.",
    "يبني فرقًا قوية ومنظمة بنمو مستدام.",
    "يؤمن بأن البيانات تصنع الفرق والإبداع يضاعف التأثير.",
  ],
  founderStats: [
    { value: "+10", label: "سنوات خبرة" },
    { value: "+250", label: "حملة ناجحة" },
    { value: "+50", label: "علامة تجارية" },
    { value: "+5M", label: "إجمالي المشاهدات" },
  ],
  teamEyebrow: "فريقنا",
  teamTitle: "عقول مبدعة تصنع الفرق",
  metricsTitle: "أرقام نفتخر بها",
  metrics: [
    { value: "+250", label: "حملة ناجحة" },
    { value: "+5M", label: "إجمالي المشاهدات المدارة" },
    { value: "+18%", label: "متوسط نمو العملاء" },
    { value: "50+", label: "علامة تجارية موثوقة" },
    { value: "5", label: "سنوات من التميز" },
  ],
  reasonsTitle: "لماذا تختار STS؟",
  reasons: [
    { title: "فريق متكامل", description: "نغطي كل مراحل النمو من الفكرة إلى التحسين." },
    { title: "تقنيات متقدمة", description: "نستخدم أحدث الأدوات والمنصات في السوق." },
    { title: "دعم مستمر", description: "نبقى معك في كل خطوة من النجاح." },
    { title: "استراتيجيات مخصصة", description: "حلول مصممة خصيصًا لهدفك وسوقك." },
    { title: "شفافية كاملة", description: "تقارير واضحة ورؤية مباشرة للأداء." },
    { title: "نتائج ملموسة", description: "نركز على مؤشرات قابلة للقياس." },
  ],
  termsTitle: "الأحكام والشروط",
  termsText: "يرجى قراءة الشروط والأحكام بعناية قبل استخدام خدمات STS Agency.",
  termsButtonLabel: "قراءة الأحكام والشروط",
  termsItems: [
    { title: "استخدام الخدمات", description: "يجب استخدام خدمات STS بطريقة قانونية وواضحة، مع تقديم معلومات صحيحة تساعد الفريق على تنفيذ العمل بدقة." },
    { title: "الالتزامات والمسؤوليات", description: "يلتزم العميل بتوفير المحتوى والموافقات في المواعيد المتفق عليها، وتلتزم STS بتنفيذ الخدمات وفق نطاق العمل المحدد." },
    { title: "سياسة الدفع والاسترجاع", description: "يتم الدفع حسب الخطة أو العرض المتفق عليه، وتخضع طلبات الاسترجاع لحالة تنفيذ الخدمة والبنود المتفق عليها." },
    { title: "حماية البيانات والخصوصية", description: "نحافظ على بيانات العملاء ولا نشاركها مع أي طرف خارجي إلا عند الحاجة لتنفيذ الخدمة أو بموافقة العميل." },
    { title: "إخلاء المسؤولية", description: "تعمل STS على تحسين النتائج بناء على البيانات والخبرة، لكن النتائج قد تتأثر بعوامل السوق والميزانية وسلوك الجمهور." },
    { title: "التعديلات على الشروط", description: "قد يتم تحديث الشروط عند تطوير الخدمات أو تغيير طريقة العمل، ويتم تطبيق النسخة الأحدث عند نشرها." },
    { title: "القانون الحاكم", description: "تخضع العلاقة بين العميل وSTS للقوانين المعمول بها في نطاق تقديم الخدمة والاتفاق التجاري." },
  ],
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeTerms(value: unknown): AboutTermItem[] {
  if (!Array.isArray(value)) return defaultAboutContent.termsItems;
  return value.map((item) => {
    if (typeof item === "string") {
      return { title: item, description: "سيتم إضافة شرح هذا البند من لوحة الإدارة." };
    }
    if (item && typeof item === "object") {
      const term = item as Partial<AboutTermItem>;
      return {
        title: String(term.title ?? ""),
        description: String(term.description ?? ""),
      };
    }
    return { title: "", description: "" };
  }).filter((item) => item.title.trim().length > 0);
}

export async function getAboutContent(): Promise<AboutContent> {
  const row = await db.aboutPageContent.findUnique({ where: { id: 1 } }).catch(() => null);
  if (!row) return defaultAboutContent;

  return {
    heroEyebrow: row.heroEyebrow,
    heroTitle: row.heroTitle,
    heroHighlight: row.heroHighlight,
    heroSubtitle: row.heroSubtitle,
    heroStats: parseJson(row.heroStats, defaultAboutContent.heroStats),
    serviceCards: parseJson(row.serviceCards, defaultAboutContent.serviceCards),
    processEyebrow: row.processEyebrow,
    processTitle: row.processTitle,
    processSteps: parseJson(row.processSteps, defaultAboutContent.processSteps),
    founderEyebrow: row.founderEyebrow,
    founderName: row.founderName,
    founderRole: row.founderRole,
    founderPhoto: !row.founderPhoto || row.founderPhoto === defaultAvatar ? defaultFounderPhoto : row.founderPhoto,
    founderBio: row.founderBio,
    founderBullets: parseJson(row.founderBullets, defaultAboutContent.founderBullets),
    founderStats: parseJson(row.founderStats, defaultAboutContent.founderStats),
    teamEyebrow: row.teamEyebrow,
    teamTitle: row.teamTitle,
    metricsTitle: row.metricsTitle,
    metrics: parseJson(row.metrics, defaultAboutContent.metrics),
    reasonsTitle: row.reasonsTitle,
    reasons: parseJson(row.reasons, defaultAboutContent.reasons),
    termsTitle: row.termsTitle,
    termsText: row.termsText,
    termsButtonLabel: row.termsButtonLabel,
    termsItems: normalizeTerms(parseJson(row.termsItems, defaultAboutContent.termsItems)),
  };
}

export function serializeAboutContent(content: AboutContent) {
  return {
    heroEyebrow: content.heroEyebrow,
    heroTitle: content.heroTitle,
    heroHighlight: content.heroHighlight,
    heroSubtitle: content.heroSubtitle,
    heroStats: JSON.stringify(content.heroStats),
    serviceCards: JSON.stringify(content.serviceCards),
    processEyebrow: content.processEyebrow,
    processTitle: content.processTitle,
    processSteps: JSON.stringify(content.processSteps),
    founderEyebrow: content.founderEyebrow,
    founderName: content.founderName,
    founderRole: content.founderRole,
    founderPhoto: content.founderPhoto,
    founderBio: content.founderBio,
    founderBullets: JSON.stringify(content.founderBullets),
    founderStats: JSON.stringify(content.founderStats),
    teamEyebrow: content.teamEyebrow,
    teamTitle: content.teamTitle,
    metricsTitle: content.metricsTitle,
    metrics: JSON.stringify(content.metrics),
    reasonsTitle: content.reasonsTitle,
    reasons: JSON.stringify(content.reasons),
    termsTitle: content.termsTitle,
    termsText: content.termsText,
    termsButtonLabel: content.termsButtonLabel,
    termsItems: JSON.stringify(content.termsItems),
  };
}

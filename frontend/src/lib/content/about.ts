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
  heroEyebrow: "About STS",
  heroTitle: "We help brands",
  heroHighlight: "grow with clarity",
  heroSubtitle:
    "At STS, we combine data, creativity, and strategy to build marketing solutions that deliver real, measurable results without forcing every client into the same playbook.",
  heroStats: [
    { value: "+250", label: "Successful campaigns" },
    { value: "+5M", label: "Total views" },
    { value: "+18%", label: "Average client growth" },
    { value: "5", label: "Years of experience" },
  ],
  serviceCards: [
    { title: "Data-led direction", description: "Decisions shaped by clear analysis and performance signals." },
    { title: "Specialized team", description: "Strategy, content, ads, and continuous optimization in one flow." },
    { title: "Ideas that scale", description: "Flexible solutions built around your brand's current stage." },
    { title: "Long-term partner", description: "We focus on sustainable growth, not temporary wins." },
  ],
  processEyebrow: "How We Work",
  processTitle: "From strategy to growth",
  processSteps: [
    { title: "Listen and understand", description: "We study your goals, challenges, audience, and market." },
    { title: "Research and analyze", description: "We review performance, competitors, and growth opportunities." },
    { title: "Plan and target", description: "We build a tailored strategy with a clear action plan." },
    { title: "Launch and monitor", description: "We run campaigns and track the metrics that matter." },
    { title: "Optimize and improve", description: "We analyze results and refine performance continuously." },
    { title: "Scale with you", description: "We expand what works with confidence and discipline." },
  ],
  founderEyebrow: "General Manager",
  founderName: "Ahmed Mohamed",
  founderRole: "Digital Marketing and Strategy Expert",
  founderPhoto: defaultFounderPhoto,
  founderBio:
    "A digital marketing and strategy expert who has worked with dozens of brands and business sectors to achieve sustainable, measurable results.",
  founderBullets: [
    "Specialized in data analysis and strategic decision-making.",
    "Experienced in managing professional ad campaigns locally and globally.",
    "Builds strong, organized teams around sustainable growth.",
    "Believes data creates the difference and creativity multiplies the impact.",
  ],
  founderStats: [
    { value: "+10", label: "Years of experience" },
    { value: "+250", label: "Successful campaigns" },
    { value: "+50", label: "Brands served" },
    { value: "+5M", label: "Total views" },
  ],
  teamEyebrow: "Our Team",
  teamTitle: "Creative minds that move the needle",
  metricsTitle: "Numbers we are proud of",
  metrics: [
    { value: "+250", label: "Successful campaigns" },
    { value: "+5M", label: "Managed views" },
    { value: "+18%", label: "Average client growth" },
    { value: "50+", label: "Trusted brands" },
    { value: "5", label: "Years of excellence" },
  ],
  reasonsTitle: "Why choose STS?",
  reasons: [
    { title: "Integrated team", description: "We cover every stage of growth from idea to optimization." },
    { title: "Advanced tools", description: "We use modern platforms and methods to sharpen performance." },
    { title: "Ongoing support", description: "We stay close through every step of the journey." },
    { title: "Custom strategies", description: "Solutions designed around your goals, market, and audience." },
    { title: "Full transparency", description: "Clear reporting and direct visibility into performance." },
    { title: "Tangible results", description: "We focus on measurable indicators and real business outcomes." },
  ],
  termsTitle: "Terms and Conditions",
  termsText: "Please read these terms and conditions carefully before using STS Agency services.",
  termsButtonLabel: "Read Terms and Conditions",
  termsItems: [
    { title: "Use of services", description: "STS services must be used lawfully and transparently, with accurate information that helps the team execute work properly." },
    { title: "Commitments and responsibilities", description: "The client is responsible for providing content and approvals on time, while STS delivers the agreed services within the defined scope of work." },
    { title: "Payment and refund policy", description: "Payments are made according to the selected plan or agreed proposal. Refund requests depend on service progress and the agreed commercial terms." },
    { title: "Data protection and privacy", description: "We protect client data and do not share it with third parties unless required to deliver the service or approved by the client." },
    { title: "Disclaimer", description: "STS works to improve results through data and experience, but outcomes may be affected by market conditions, budget, and audience behavior." },
    { title: "Changes to terms", description: "These terms may be updated as services or working methods evolve. The latest published version applies once released." },
    { title: "Governing law", description: "The relationship between the client and STS is governed by the applicable laws within the service and commercial agreement scope." },
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
      return { title: item, description: "This item description will be added from the admin dashboard." };
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

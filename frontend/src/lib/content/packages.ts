import { PackageAddOn, PackagePlan } from "@/types/content";

export const packagePlans: PackagePlan[] = [
  {
    name: "Starter",
    tagline: "For brands testing the waters",
    price: "$499",
    period: "/mo",
    description: "The essentials to get consistent, professional marketing off the ground.",
    features: [
      "Social media management (2 platforms)",
      "12 posts per month",
      "Monthly content calendar",
      "Basic performance report",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Growth",
    tagline: "Our most popular package",
    price: "$999",
    period: "/mo",
    description: "A full marketing engine for brands ready to scale paid and organic together.",
    features: [
      "Social media management (4 platforms)",
      "24 posts per month",
      "Paid ads management ($2k ad spend included)",
      "SEO & content strategy",
      "Bi-weekly performance reports",
      "Dedicated account manager",
    ],
    cta: "Get Started",
    featured: true,
  },
  {
    name: "Premium",
    tagline: "Complete growth system",
    price: "$1,999",
    period: "/mo",
    description: "End-to-end strategy, execution, and reporting run by a senior growth team.",
    features: [
      "Unlimited platform management",
      "Daily content production",
      "Paid ads management ($5k ad spend included)",
      "SEO, branding & automation",
      "Weekly strategy calls",
      "Dedicated growth team",
      "Real-time analytics dashboard",
    ],
    cta: "Get Started",
  },
];

export const packageAddOns: PackageAddOn[] = [
  { id: "social", label: "Social Media Management", description: "Content, scheduling & community management", price: 350 },
  { id: "ads", label: "Paid Ads Management", description: "Meta, Google & TikTok campaigns", price: 450 },
  { id: "seo", label: "SEO & Content", description: "On-page SEO and blog content production", price: 300 },
  { id: "branding", label: "Branding & Design", description: "Visual identity and creative assets", price: 400 },
  { id: "email", label: "Email Marketing", description: "Newsletters and lifecycle automation", price: 200 },
  { id: "influencer", label: "Influencer Marketing", description: "Creator sourcing & campaign management", price: 350 },
  { id: "automation", label: "Marketing Automation", description: "CRM workflows & lead nurturing", price: 300 },
  { id: "reporting", label: "Analytics & Reporting", description: "Custom dashboards & monthly insights", price: 150 },
];

export const customPackageBaseFee = 199;
export const customPackageMeta = {
  tagline: "Tailored to your unique goals",
  description: "Pick exactly the services you need. Nothing you don't.",
  cta: "Build My Package",
  period: "/mo",
};

export async function getPackagePlans() {
  try {
    const { db } = await import("@/lib/db");
    const storedPlans = await db.packagePlan.findMany({
      where: { name: { not: "Custom Package Base Fee" } },
      orderBy: { order: "asc" },
    });

    if (storedPlans.length === 0) return packagePlans;

    return storedPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      tagline: plan.tagline,
      price: plan.price,
      period: plan.period,
      description: plan.description,
      features: jsonToStringArray(plan.features),
      cta: plan.cta,
      featured: plan.featured,
      order: plan.order,
    }));
  } catch {
    return packagePlans;
  }
}

export async function getPackageAddOns() {
  try {
    const { db } = await import("@/lib/db");
    const storedAddOns = await db.packageAddOn.findMany({ orderBy: { order: "asc" } });

    return storedAddOns.length > 0 ? storedAddOns : packageAddOns;
  } catch {
    return packageAddOns;
  }
}

export async function getCustomPackageBaseFee() {
  try {
    const { db } = await import("@/lib/db");
    const customPlan = await db.packagePlan.findFirst({
      where: { name: "Custom Package Base Fee" },
      select: { price: true },
    });

    const parsedPrice = Number(customPlan?.price.replace(/[^0-9]/g, ""));
    return Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : customPackageBaseFee;
  } catch {
    return customPackageBaseFee;
  }
}

export async function getCustomPackageMeta() {
  try {
    const { db } = await import("@/lib/db");
    const customPlan = await db.packagePlan.findFirst({
      where: { name: "Custom Package Base Fee" },
      select: { tagline: true, description: true, cta: true, period: true },
    });

    if (!customPlan) return customPackageMeta;

    return {
      tagline: customPlan.tagline || customPackageMeta.tagline,
      description: customPlan.description || customPackageMeta.description,
      cta: customPlan.cta || customPackageMeta.cta,
      period: customPlan.period || customPackageMeta.period,
    };
  } catch {
    return customPackageMeta;
  }
}

function jsonToStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}

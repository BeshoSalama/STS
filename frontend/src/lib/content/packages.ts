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

function parseFeatures(features: string) {
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function getPackagePlans() {
  const { db } = await import("@/lib/db");
  const rows = await db.packagePlan.findMany({
    where: { name: { not: "Custom Package Base Fee" } },
    orderBy: { order: "asc" },
  });
  return rows.map((plan) => ({
    name: plan.name,
    tagline: plan.tagline,
    price: plan.price,
    period: plan.period,
    description: plan.description,
    features: parseFeatures(plan.features),
    cta: plan.cta,
    featured: plan.featured,
  }));
}

export async function getPackageAddOns() {
  const { db } = await import("@/lib/db");
  const rows = await db.packageAddOn.findMany({ orderBy: { order: "asc" } });
  return rows.map(({ id, label, description, price }) => ({ id, label, description, price }));
}

import { CustomPackageSettings, PackageAddOn, PackagePlan } from "@/types/content";
import { defaultCustomPackageSettings } from "@/lib/customPackagePricing";

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
    order: 0,
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
    order: 1,
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
    order: 2,
  },
];

export const packageAddOns: PackageAddOn[] = [
  {
    id: "social",
    label: "Social Media Management",
    description: "Content, scheduling & community management",
    price: 350,
  },
  {
    id: "ads",
    label: "Paid Ads Management",
    description: "Meta, Google & TikTok campaigns",
    price: 450,
  },
  {
    id: "seo",
    label: "SEO & Content",
    description: "On-page SEO and blog content production",
    price: 300,
  },
  {
    id: "branding",
    label: "Branding & Design",
    description: "Visual identity and creative assets",
    price: 400,
  },
  {
    id: "email",
    label: "Email Marketing",
    description: "Newsletters and lifecycle automation",
    price: 200,
  },
  {
    id: "influencer",
    label: "Influencer Marketing",
    description: "Creator sourcing & campaign management",
    price: 350,
  },
  {
    id: "automation",
    label: "Marketing Automation",
    description: "CRM workflows & lead nurturing",
    price: 300,
  },
  {
    id: "reporting",
    label: "Analytics & Reporting",
    description: "Custom dashboards & monthly insights",
    price: 150,
  },
];

export const customPackageBaseFee = 199;

export const customPackageMeta = {
  tagline: "Tailored to your unique goals",
  description: "Pick exactly the services you need. Nothing you don't.",
  cta: "Build My Package",
  period: "/mo",
};

export const customPackageSettings: CustomPackageSettings = defaultCustomPackageSettings;

export async function getPackagePlans(): Promise<PackagePlan[]> {
  const { db } = await import("@/lib/db");

  try {
    let storedPlans = await db.packagePlan.findMany({
      where: {
        name: {
          not: "Custom Package Base Fee",
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    /*
     * لو قاعدة البيانات لسه فاضية:
     * ننشئ Starter / Growth / Premium فيها فعليًا
     * عشان كل خطة يبقى ليها ID حقيقي.
     */
    if (storedPlans.length === 0) {
      await db.packagePlan.createMany({
        data: packagePlans.map((plan, index) => ({
          name: plan.name,
          tagline: plan.tagline,
          price: plan.price,
          period: plan.period,
          description: plan.description,
          features: JSON.stringify(plan.features),
          cta: plan.cta,
          featured: plan.featured ?? false,
          order: plan.order ?? index,
        })),
      });

      storedPlans = await db.packagePlan.findMany({
        where: {
          name: {
            not: "Custom Package Base Fee",
          },
        },
        orderBy: {
          order: "asc",
        },
      });
    }

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
  } catch (error) {
    console.error("getPackagePlans failed:", error);
    throw error;
  }
}

export async function getPackageAddOns(): Promise<PackageAddOn[]> {
  const { db } = await import("@/lib/db");

  try {
    const storedAddOns = await db.packageAddOn.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return storedAddOns.length > 0 ? storedAddOns : packageAddOns;
  } catch (error) {
    console.error("getPackageAddOns failed:", error);
    return packageAddOns;
  }
}

export async function getCustomPackageBaseFee() {
  const { db } = await import("@/lib/db");

  try {
    const customPlan = await db.packagePlan.findFirst({
      where: {
        name: "Custom Package Base Fee",
      },
      select: {
        price: true,
      },
    });

    const parsedPrice = Number(
      customPlan?.price.replace(/[^0-9]/g, "")
    );

    return Number.isFinite(parsedPrice) && parsedPrice > 0
      ? parsedPrice
      : customPackageBaseFee;
  } catch (error) {
    console.error("getCustomPackageBaseFee failed:", error);
    return customPackageBaseFee;
  }
}

export async function getCustomPackageMeta() {
  const { db } = await import("@/lib/db");

  try {
    const customPlan = await db.packagePlan.findFirst({
      where: {
        name: "Custom Package Base Fee",
      },
      select: {
        tagline: true,
        description: true,
        cta: true,
        period: true,
      },
    });

    if (!customPlan) {
      return customPackageMeta;
    }

    return {
      tagline: customPlan.tagline || customPackageMeta.tagline,
      description:
        customPlan.description || customPackageMeta.description,
      cta: customPlan.cta || customPackageMeta.cta,
      period: customPlan.period || customPackageMeta.period,
    };
  } catch (error) {
    console.error("getCustomPackageMeta failed:", error);
    return customPackageMeta;
  }
}

export async function getCustomPackageSettings(): Promise<CustomPackageSettings> {
  const { db } = await import("@/lib/db");

  try {
    const storedSettings = await db.customPackageSettings.upsert({
      where: {
        id: 1,
      },
      update: {},
      create: customPackageSettings,
    });

    return {
      quantityDiscountStart: storedSettings.quantityDiscountStart,
      quantityDiscountPercent: storedSettings.quantityDiscountPercent,
      maxQuantityDiscount: storedSettings.maxQuantityDiscount,
      annualDiscountPercent: storedSettings.annualDiscountPercent,
    };
  } catch (error) {
    console.error("getCustomPackageSettings failed:", error);
    return customPackageSettings;
  }
}

function jsonToStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.map(String)
      : [];
  } catch {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
}

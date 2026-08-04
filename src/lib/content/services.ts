import { ServiceItem } from "@/types/content";

export const services: ServiceItem[] = [
  {
    icon: "consulting",
    eyebrow: "Business Consulting",
    title: "Strategic partner for smarter operations",
    description:
      "Strategic consulting focused on solving business problems, optimizing operations, and unlocking scalable growth opportunities.",
    cta: "Free Consultation",
  },
  {
    icon: "management",
    eyebrow: "Marketing Management",
    title: "A marketing department, fully loaded",
    description:
      "Data-driven strategy, team management, and performance-focused execution — led by senior growth marketers.",
    cta: "Marketing Manager",
  },
  {
    icon: "strategy",
    eyebrow: "Complete Business Strategy",
    title: "End-to-end growth, engineered",
    description:
      "Market analysis, branding, advertising, automation, and scalable financial strategy built for profitable growth.",
    cta: "Business Strategy",
  },
];

export async function getServices() {
  const { db } = await import("@/lib/db");
  const rows = await db.serviceItem.findMany({ orderBy: { order: "asc" } });
  return rows.map((service) => ({
    icon: service.icon as ServiceItem["icon"],
    eyebrow: service.eyebrow,
    title: service.title,
    description: service.description,
    cta: service.cta,
  }));
}

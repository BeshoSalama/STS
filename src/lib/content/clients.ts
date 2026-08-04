import { ClientLogo, ValueProp } from "@/types/content";

export const clients: ClientLogo[] = [
  { name: "Blvnk Fashion", size: "sm" },
  { name: "Cupful Coffee", size: "sm" },
  { name: "Luxora Cosmetics", size: "sm" },
  { name: "Fitline Equipment", size: "sm" },
  { name: "Homez Homedecor", size: "md" },
  { name: "Nutrify Health", size: "md" },
  { name: "AutoCare Service", size: "md" },
  { name: "Skinova Skincare", size: "md" },
  { name: "EduPlus Education", size: "lg" },
  { name: "Techwave Solutions", size: "lg" },
  { name: "Royal Perfumes", size: "lg" },
];

export const valueProps: ValueProp[] = [
  {
    icon: "target",
    title: "Data Driven",
    description: "We analyze, we strategize, we deliver results.",
  },
  {
    icon: "bulb",
    title: "Creative First",
    description: "Creativity that connects and converts.",
  },
  {
    icon: "chart",
    title: "Performance Focused",
    description: "Built for growth. Optimized for ROI.",
  },
  {
    icon: "headset",
    title: "Long Term Partner",
    description: "We grow when you grow.",
  },
];

export async function getValueProps() {
  const { db } = await import("@/lib/db");
  const rows = await db.valueProp.findMany({ orderBy: { order: "asc" } });
  return rows.map((item) => ({
    icon: item.icon as ValueProp["icon"],
    title: item.title,
    description: item.description,
  }));
}

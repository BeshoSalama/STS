import { Industry } from "@/types/content";

export const industries: Industry[] = [
  {
    slug: "ecommerce",
    name: "E-commerce",
    icon: "ecommerce",
    headline: "Higher ROAS for online stores",
    description:
      "We build data-driven campaigns for e-commerce brands, bringing more sales, smarter targeting, and profitable performance.",
    clients: [
      { name: "Cupful Coffee", result: "+30% ROAS" },
      { name: "Blvnk Fashion", result: "+42% ROAS" },
      { name: "Fitline Equipment", result: "+27% ROAS" },
      { name: "CartNest Store", result: "+36% ROAS" },
      { name: "TrendCart", result: "+31% ROAS" },
    ],
  },
  {
    slug: "branding",
    name: "Beauty & Branding",
    icon: "branding",
    headline: "Brand growth for beauty & cosmetics",
    description:
      "We create branding & visual identity that makes your business stand out and grow faster, from packaging to paid social.",
    clients: [
      { name: "Luxora Cosmetics", result: "+180% Brand Growth" },
      { name: "Skinova Skincare", result: "+96% Brand Growth" },
      { name: "Royal Perfumes", result: "+64% Brand Growth" },
      { name: "GlowLab Studio", result: "+82% Brand Growth" },
      { name: "Velora Beauty", result: "+74% Brand Growth" },
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "realestate",
    headline: "Higher ROAS for property brands",
    description:
      "We build data-driven campaigns for real estate developers and agencies, bringing more qualified leads and profitable performance.",
    clients: [
      { name: "Homez Homedecor", result: "+30% ROAS" },
      { name: "Skyline Properties", result: "+38% ROAS" },
      { name: "Marbella Estates", result: "+22% ROAS" },
      { name: "Prime Estates", result: "+34% ROAS" },
      { name: "Haven Properties", result: "+29% ROAS" },
    ],
  },
];

export function getIndustry(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

import { ResultCard } from "@/types/content";

export const heroStats = {
  growth: 127,
  revenue: 250,
  roi: 5.2,
};

export const resultCards: ResultCard[] = [
  {
    stat: "30%",
    title: "Higher ROAS",
    description:
      "We build data-driven campaigns for e-commerce brands, bringing more sales, better results, and profitable performance.",
    tone: "dark",
    industrySlug: "ecommerce",
    image: "/home/result-ecommerce.png",
    imageAlt: "Premium e-commerce campaign visual with a shopping cart and checkout phone",
  },
  {
    stat: "180%",
    title: "Brand Growth",
    description:
      "We create branding & visual identity that makes your business stand out and grow faster.",
    tone: "light",
    industrySlug: "branding",
    image: "/home/result-cosmetics.png",
    imageAlt: "Premium cosmetics product campaign visual",
  },
  {
    stat: "30%",
    title: "Higher ROAS",
    description:
      "We build data-driven campaigns for real estate brands, bringing more leads, smarter targeting, and profitable performance.",
    tone: "dark",
    industrySlug: "real-estate",
    image: "/home/result-real-estate.png",
    imageAlt: "Luxury real estate marketing visual with growth light trails",
  },
];

export const clientStats = {
  happyClients: 50,
  successfulProjects: 200,
};

export const platforms = ["Meta", "Google Ads", "TikTok", "Shopify", "YouTube"];

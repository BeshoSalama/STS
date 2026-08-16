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
  {
    stat: "92%",
    title: "More Bookings",
    description:
      "We help clinics and healthcare brands turn digital attention into trusted appointments and stronger patient pipelines.",
    tone: "light",
    industrySlug: "medical",
    image: "/home/result-cosmetics.png",
    imageAlt: "Premium healthcare and clinic growth visual",
  },
  {
    stat: "64%",
    title: "Order Growth",
    description:
      "We build restaurant campaigns that bring more orders, stronger local reach, and repeat customers across delivery channels.",
    tone: "dark",
    industrySlug: "restaurants",
    image: "/home/result-ecommerce.png",
    imageAlt: "Premium restaurant ordering campaign visual",
  },
  {
    stat: "48%",
    title: "Lead Quality",
    description:
      "We create education campaigns that attract better-fit students, parents, and qualified inquiries for growth-focused teams.",
    tone: "dark",
    industrySlug: "education",
    image: "/home/result-real-estate.png",
    imageAlt: "Premium education marketing growth visual",
  },
  {
    stat: "55%",
    title: "More Leads",
    description:
      "We launch automotive campaigns for dealerships, showrooms, and service centers with smarter targeting and faster follow-up.",
    tone: "dark",
    industrySlug: "automotive",
    image: "/home/result-real-estate.png",
    imageAlt: "Premium automotive marketing campaign visual",
  },
  {
    stat: "73%",
    title: "Pipeline Growth",
    description:
      "We help technology brands explain complex offers clearly and convert the right prospects into qualified sales conversations.",
    tone: "light",
    industrySlug: "technology",
    image: "/home/result-cosmetics.png",
    imageAlt: "Premium technology brand growth visual",
  },
  {
    stat: "41%",
    title: "Member Growth",
    description:
      "We grow gyms, studios, and wellness brands with campaigns built around intent, community, and consistent acquisition.",
    tone: "dark",
    industrySlug: "fitness",
    image: "/home/result-ecommerce.png",
    imageAlt: "Premium fitness and wellness growth campaign visual",
  },
];

export const clientStats = {
  happyClients: 50,
  successfulProjects: 200,
};

export const platforms = ["Meta", "Google Ads", "TikTok", "Shopify", "YouTube"];

export async function getHeroStats() {
  return heroStats;
}

export async function getClientStats() {
  return clientStats;
}

export async function getResultCards() {
  return resultCards;
}

export async function getPlatforms() {
  return platforms;
}

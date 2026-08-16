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
  {
    slug: "medical",
    name: "Medical",
    icon: "branding",
    headline: "More bookings for healthcare brands",
    description:
      "We help clinics and healthcare brands turn digital attention into trusted appointments and stronger patient pipelines.",
    clients: [
      { name: "Nancy Clinic", result: "+92% Bookings" },
      { name: "Smile Art", result: "+61% Leads" },
      { name: "Dental Lounge", result: "+74% Appointments" },
      { name: "Waleed Mahran Clinic", result: "+45% Leads" },
      { name: "Skin Care Hub", result: "+58% Bookings" },
    ],
  },
  {
    slug: "restaurants",
    name: "Restaurants",
    icon: "ecommerce",
    headline: "Order growth for restaurants",
    description:
      "We build restaurant campaigns that bring more orders, stronger local reach, and repeat customers across delivery channels.",
    clients: [
      { name: "Lasera", result: "+64% Orders" },
      { name: "Urban Bites", result: "+38% Orders" },
      { name: "Grill House", result: "+44% Revenue" },
      { name: "Fresh Bowl", result: "+29% Repeat Sales" },
      { name: "Cafe Nova", result: "+36% Reach" },
    ],
  },
  {
    slug: "education",
    name: "Education",
    icon: "realestate",
    headline: "Better inquiries for education brands",
    description:
      "We create education campaigns that attract better-fit students, parents, and qualified inquiries for growth-focused teams.",
    clients: [
      { name: "EELU Programs", result: "+48% Lead Quality" },
      { name: "Future Academy", result: "+37% Inquiries" },
      { name: "Learn Hub", result: "+42% Applications" },
      { name: "Skill Path", result: "+31% Leads" },
      { name: "Bright Course", result: "+39% Conversion" },
    ],
  },
  {
    slug: "automotive",
    name: "Automotive",
    icon: "realestate",
    headline: "More leads for automotive brands",
    description:
      "We launch automotive campaigns for dealerships, showrooms, and service centers with smarter targeting and faster follow-up.",
    clients: [
      { name: "Camaro Car", result: "+55% Leads" },
      { name: "Auto Line", result: "+33% Calls" },
      { name: "Prime Motors", result: "+47% Test Drives" },
      { name: "Shift Garage", result: "+28% Bookings" },
      { name: "Road Max", result: "+35% Reach" },
    ],
  },
  {
    slug: "technology",
    name: "Technology",
    icon: "branding",
    headline: "Pipeline growth for technology brands",
    description:
      "We help technology brands explain complex offers clearly and convert the right prospects into qualified sales conversations.",
    clients: [
      { name: "Sama Technology", result: "+73% Pipeline" },
      { name: "ITC", result: "+46% Qualified Leads" },
      { name: "Cloud Stack", result: "+34% Demos" },
      { name: "Data Gate", result: "+51% Conversion" },
      { name: "Smart Ops", result: "+27% Revenue" },
    ],
  },
  {
    slug: "fitness",
    name: "Fitness",
    icon: "ecommerce",
    headline: "Member growth for fitness brands",
    description:
      "We grow gyms, studios, and wellness brands with campaigns built around intent, community, and consistent acquisition.",
    clients: [
      { name: "Fitline Equipment", result: "+41% Members" },
      { name: "Pulse Studio", result: "+34% Trials" },
      { name: "Core Lab", result: "+29% Signups" },
      { name: "Move Club", result: "+36% Leads" },
      { name: "Wellness Pro", result: "+25% Retention" },
    ],
  },
];

export function getIndustry(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

export async function getIndustries() {
  return industries;
}

export async function getIndustryBySlug(slug: string) {
  return getIndustry(slug) ?? null;
}

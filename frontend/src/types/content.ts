export interface NavLink {
  label: string;
  href: string;
  variant?: "pill" | "default";
}

export interface TeamMember {
  name: string;
  role: string;
}

export interface ClientLogo {
  name: string;
  size: "sm" | "md" | "lg";
}

export interface ProjectItem {
  name: string;
  category: string;
  image: string;
  imageAlt: string;
  slug?: string;
  details?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  published?: boolean;
  order?: number;
}

export interface ResultCard {
  stat: string;
  title: string;
  description: string;
  tone: "dark" | "light";
  industrySlug: string;
  image: string;
  imageAlt: string;
}

export interface IndustryClient {
  name: string;
  result: string;
}

export interface Industry {
  slug: string;
  name: string;
  icon: "ecommerce" | "branding" | "realestate";
  headline: string;
  description: string;
  clients: IndustryClient[];
}

export interface ValueProp {
  title: string;
  description: string;
  icon: "target" | "bulb" | "chart" | "headset";
}

export interface PackagePlan {
  id?: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
  order?: number;
}

export interface PackageAddOn {
  id: string;
  label: string;
  description: string;
  price: number;
  order?: number;
}

export interface CustomPackageSettings {
  quantityDiscountStart: number;
  quantityDiscountPercent: number;
  maxQuantityDiscount: number;
  annualDiscountPercent: number;
}

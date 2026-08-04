export interface NavLink {
  label: string;
  href: string;
  variant?: "pill" | "default";
}

export interface ServiceItem {
  title: string;
  eyebrow: string;
  description: string;
  cta: string;
  icon: "consulting" | "management" | "strategy";
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
  name: string;
  tagline: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export interface PackageAddOn {
  id: string;
  label: string;
  description: string;
  price: number;
}

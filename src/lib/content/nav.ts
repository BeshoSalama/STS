import { NavLink } from "@/types/content";

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Projects", href: "/projects" },
  { label: "Brief", href: "/brief" },
  { label: "Our Clients", href: "/clients" },
  { label: "Free Consultation", href: "/contact", variant: "pill" },
];

export const siteConfig = {
  name: "STS Agency",
  tagline: "Step to Success",
  phone: "+1 (415) 555-0148",
  location: "6th of October City, Giza",
  address: "Building 10, Neighborhood 2, First District, 6th of October City, Giza 12568, Egypt",
  mapUrl: "https://www.google.com/maps/dir/?api=1&destination=29.983000%2C30.966843",
  socials: [
    { label: "Facebook", href: "#" },
    { label: "WhatsApp", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "Snapchat", href: "#" },
    { label: "TikTok", href: "#" },
  ],
};

import { ProjectItem } from "@/types/content";

export function getProjectSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const projects: ProjectItem[] = [
  {
    name: "Abo Al Banna",
    category: "Food & Restaurant",
    image: "/clients/587917719_122145599504907166_5404782049498547962_n.jpg.jpeg",
    imageAlt: "Abo Al Banna restaurant logo",
  },
  {
    name: "Camaro Car",
    category: "Automotive",
    image: "/clients/608628163_1479167980883163_4797387432430925488_n.jpg.jpeg",
    imageAlt: "Camaro Car automotive logo",
  },
  {
    name: "Awlad El Ghoneim",
    category: "Butchery & Grill",
    image: "/clients/633999552_122285894870227639_5346079306777523712_n (1).jpg.jpeg",
    imageAlt: "Awlad El Ghoneim butchery and grill logo",
  },
  {
    name: "IDS Courses",
    category: "Dental Education",
    image: "/clients/650830646_122162923394939763_9142788872308181834_n.jpg.jpeg",
    imageAlt: "IDS Courses dental education logo",
  },
  {
    name: "Done Deal Investment",
    category: "Real Estate Investment",
    image: "/clients/691071217_122324661524030254_4751269666792681232_n.jpg.jpeg",
    imageAlt: "Done Deal Investment real estate logo",
  },
  {
    name: "Smile Art",
    category: "Dental Clinic",
    image: "/clients/ChatGPT Image May 19, 2026, 01_31_06 AM.png",
    imageAlt: "Smile Art dental and maxillofacial center logo",
  },
  {
    name: "Nancy Clinic",
    category: "Medical Clinic",
    image: "/clients/ChatGPT Image May 19, 2026, 01_31_12 AM.png",
    imageAlt: "Nancy Clinic medical logo",
  },
  {
    name: "Dental Lounge",
    category: "Dental Clinic",
    image: "/clients/ChatGPT Image May 19, 2026, 01_33_38 AM.png",
    imageAlt: "Dental Lounge logo",
  },
  {
    name: "Dr. Amr Bahaa",
    category: "Plastic Surgery",
    image: "/clients/ChatGPT Image May 19, 2026, 01_34_38 AM.png",
    imageAlt: "Dr. Amr Bahaa plastic surgeon logo",
  },
  {
    name: "Dr. Ahmed AbdRabou",
    category: "Dental Clinic",
    image: "/clients/ChatGPT Image May 19, 2026, 01_36_00 AM.png",
    imageAlt: "Dr. Ahmed AbdRabou dental clinic logo",
  },
  {
    name: "Dr. Emad Farag",
    category: "Cosmetology & Dermatology",
    image: "/clients/ChatGPT Image May 19, 2026, 01_36_45 AM.png",
    imageAlt: "Dr. Emad Farag cosmetology and dermatology logo",
  },
  {
    name: "Dr. Ahmed Kamal",
    category: "Neurosurgery & Spine",
    image: "/clients/ChatGPT Image May 19, 2026, 01_37_58 AM.png",
    imageAlt: "Dr. Ahmed Kamal neurosurgery and spine logo",
  },
  {
    name: "Dr. Shereen Hassanen",
    category: "Dermatology & Aesthetics",
    image: "/clients/ChatGPT Image May 19, 2026, 01_39_56 AM.png",
    imageAlt: "Dr. Shereen Hassanen dermatology and aesthetics logo",
  },
  {
    name: "Guarantee Dental Center",
    category: "Dental Clinic",
    image: "/clients/ChatGPT Image May 19, 2026, 01_40_31 AM.png",
    imageAlt: "Guarantee Dental Center logo",
  },
  {
    name: "Murooj Perfume",
    category: "Perfume & Fragrance",
    image: "/clients/ChatGPT Image May 19, 2026, 01_44_00 AM.png",
    imageAlt: "Murooj Perfume logo",
  },
  {
    name: "Waleed Mahran",
    category: "Eye Clinic",
    image: "/clients/ChatGPT Image May 19, 2026, 01_45_13 AM.png",
    imageAlt: "Waleed Mahran eye clinic logo",
  },
  {
    name: "ITC",
    category: "Technology & IT",
    image: "/clients/ChatGPT Image May 19, 2026, 01_55_24 AM.png",
    imageAlt: "ITC technology logo",
  },
  {
    name: "S Brand",
    category: "Brand Identity",
    image: "/clients/ChatGPT Image May 19, 2026, 01_57_13 AM.png",
    imageAlt: "S Brand logo",
  },
  {
    name: "Laserra",
    category: "Pizza & Restaurant",
    image: "/clients/ChatGPT Image May 19, 2026, 02_01_03 AM.png",
    imageAlt: "Laserra pizza and restaurant logo",
  },
  {
    name: "New City",
    category: "Real Estate Marketing",
    image: "/clients/ChatGPT Image May 19, 2026, 02_01_52 AM.png",
    imageAlt: "New City realty marketing logo",
  },
  {
    name: "Sold Hub",
    category: "Real Estate Solutions",
    image: "/clients/ChatGPT Image May 19, 2026, 02_03_11 AM.png",
    imageAlt: "Sold Hub real estate solutions logo",
  },
  {
    name: "Sama Technology",
    category: "Technology",
    image: "/clients/ChatGPT Image May 19, 2026, 02_04_52 AM.png",
    imageAlt: "Sama Technology logo",
  },
  {
    name: "Evelen",
    category: "Real Estate Company",
    image: "/clients/ChatGPT Image May 19, 2026, 02_07_36 AM.png",
    imageAlt: "Evelen real estate company logo",
  },
];

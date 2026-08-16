import { TeamMember } from "@/types/content";

export const team: TeamMember[] = [
  { name: "Karim Hassan", role: "Media Buyer & Data Analyst" },
  { name: "Nour Ibrahim", role: "Brand Strategist" },
  { name: "Youssef Adel", role: "Performance Marketing Lead" },
  { name: "Salma Tarek", role: "Creative Director" },
  { name: "Omar Farouk", role: "Growth Marketer" },
  { name: "Laila Mostafa", role: "Client Success Manager" },
  { name: "Ahmed Nabil", role: "Media Buyer & Data Analyst" },
  { name: "Rana Samir", role: "Content Strategist" },
  { name: "Tarek Younes", role: "UI/UX Designer" },
  { name: "Dina Sherif", role: "SEO Specialist" },
  { name: "Mostafa Kamal", role: "Automation Engineer" },
];

export async function getTeam() {
  return team;
}

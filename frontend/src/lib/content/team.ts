import { TeamMember } from "@/types/content";
import { defaultAvatar } from "@/lib/content/about";
import { db } from "@/lib/db";

export const team: TeamMember[] = [
  { name: "Karim Hassan", role: "Media Buyer & Data Analyst", photo: defaultAvatar },
  { name: "Nour Ibrahim", role: "Brand Strategist", photo: defaultAvatar },
  { name: "Youssef Adel", role: "Performance Marketing Lead", photo: defaultAvatar },
  { name: "Salma Tarek", role: "Creative Director", photo: defaultAvatar },
  { name: "Omar Farouk", role: "Growth Marketer", photo: defaultAvatar },
  { name: "Laila Mostafa", role: "Client Success Manager", photo: defaultAvatar },
  { name: "Ahmed Nabil", role: "Media Buyer & Data Analyst", photo: defaultAvatar },
  { name: "Rana Samir", role: "Content Strategist", photo: defaultAvatar },
  { name: "Tarek Younes", role: "UI/UX Designer", photo: defaultAvatar },
  { name: "Dina Sherif", role: "SEO Specialist", photo: defaultAvatar },
  { name: "Mostafa Kamal", role: "Automation Engineer", photo: defaultAvatar },
];

export async function getTeam() {
  const members = await db.teamMember.findMany({ orderBy: { order: "asc" } });
  if (!members.length) return team;
  return members.map((member) => ({ ...member, photo: member.photo || defaultAvatar }));
}

import { ClientsHero } from "@/components/sections/ClientsHero";
import { getClientLogoImages } from "@/lib/content/clientLogos";
import { getValueProps } from "@/lib/content/clients";
import { getProjects } from "@/lib/content/projects";
import { getClientStats, getHeroStats } from "@/lib/content/stats";

export const revalidate = 3600;

export default async function ClientsPage() {
  const [clientLogoImages, valueProps, projects, heroStats, clientStats] = await Promise.all([
    getClientLogoImages(),
    getValueProps(),
    getProjects(),
    getHeroStats(),
    getClientStats(),
  ]);

  return (
    <ClientsHero
      clientLogoImages={clientLogoImages}
      valueProps={valueProps}
      projects={projects}
      heroStats={heroStats}
      clientStats={clientStats}
    />
  );
}

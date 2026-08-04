import { Hero } from "@/components/sections/Hero";
import { ResultCards } from "@/components/sections/ResultCards";
import { ClientLogoMarquee } from "@/components/sections/ClientLogoMarquee";
import { getPlatforms, getResultCards } from "@/lib/content/stats";

export const revalidate = 3600;

export default async function HomePage() {
  const [resultCards, platforms] = await Promise.all([getResultCards(), getPlatforms()]);

  return (
    <div className="home-page-dark">
      <Hero />
      <div className="home-page-dark__content">
        <ResultCards resultCards={resultCards} />
        <ClientLogoMarquee platforms={platforms} />
      </div>
    </div>
  );
}

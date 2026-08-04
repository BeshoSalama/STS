import { Hero } from "@/components/sections/Hero";
import { ResultCards } from "@/components/sections/ResultCards";
import { ClientLogoMarquee } from "@/components/sections/ClientLogoMarquee";

export default function HomePage() {
  return (
    <div className="home-page-dark">
      <Hero />
      <div className="home-page-dark__content">
        <ResultCards />
        <ClientLogoMarquee />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowUpRight, Building2, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { getIndustries, getIndustryBySlug } from "@/lib/content/industries";
import { getHeroStats, getResultCards } from "@/lib/content/stats";
import { cn } from "@/lib/cn";

const icons = { ecommerce: ShoppingBag, branding: Sparkles, realestate: Building2 };

export const revalidate = 3600;

export async function generateStaticParams() {
  const industries = await getIndustries();
  return industries.map((industry) => ({ slug: industry.slug }));
}

export default async function IndustryPage({ params }: { params: { slug: string } }) {
  const [industry, heroStats, resultCards] = await Promise.all([
    getIndustryBySlug(params.slug),
    getHeroStats(),
    getResultCards(),
  ]);
  if (!industry) notFound();

  const Icon = icons[industry.icon];
  const resultCard = resultCards.find((card) => card.industrySlug === industry.slug) ?? resultCards[0];

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32 sm:pt-40">
        <div className="container grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-violet-950 shadow-card-lg sm:min-h-[420px]">
            <Image
              src={resultCard.image}
              alt={resultCard.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 92vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-violet-950/60 via-transparent to-violet-300/5" />
            <span className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/30 bg-surface-card/90 text-violet-700 shadow-card backdrop-blur-md">
              <Icon size={22} />
            </span>
          </div>

          <div className="rounded-[2rem] border border-violet-400/25 bg-surface-card/80 p-5 shadow-card-lg backdrop-blur-xl sm:p-7">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_13rem] xl:items-start">
              <div className="min-w-0">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">{industry.name}</p>
                <h1 className="max-w-md font-display text-5xl font-extrabold leading-[0.95] tracking-normal text-ink lg:text-[3.25rem] xl:text-[3.65rem]">
                  <span className="block">STS Company</span>
                  <span className="block bg-violet-gradient-text bg-clip-text text-transparent">Projects</span>
                </h1>
                <p className="mt-7 max-w-xl rounded-[1.55rem] border border-violet-300/45 bg-violet-50/80 px-6 py-4 text-base font-medium leading-7 text-muted shadow-card backdrop-blur-xl">
                  {industry.description}
                </p>
                <div className="mt-7">
                  <Button href="/contact">Get a Free Consultation</Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <StatCard
                  label="Growth"
                  value={heroStats.growth}
                  prefix="+"
                  suffix="%"
                  variant="line"
                  className="h-32"
                />
                <StatCard
                  label="Revenue"
                  value={heroStats.revenue}
                  prefix="+"
                  suffix="K"
                  variant="bars"
                  className="h-32"
                />
                <StatCard
                  label="ROI"
                  value={heroStats.roi}
                  decimals={1}
                  suffix="X"
                  variant="ring"
                  className="h-32"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-28">
        <div className="container rounded-[2rem] border border-violet-400/25 bg-surface-card/95 p-3 shadow-card-lg backdrop-blur-xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {industry.clients.map((client) => (
              <div
                key={client.name}
                className="industry-project-card grid min-h-[132px] transform-gpu grid-cols-[92px_1fr] items-center gap-3 rounded-[1.35rem] border border-violet-300/45 bg-violet-50/75 p-3 shadow-card lg:grid-cols-1"
              >
                <div
                  className={cn(
                    "relative h-24 overflow-hidden rounded-[1.1rem] bg-violet-950 lg:h-28",
                    resultCard.tone === "light" && "bg-violet-gradient-soft"
                  )}
                >
                  <Image
                    src={resultCard.image}
                    alt={resultCard.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 160px, 92px"
                    className="industry-project-card__image object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="industry-project-card__arrow mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-violet-gradient text-white">
                    <ArrowUpRight size={15} />
                  </div>
                  <p className="font-display text-sm font-extrabold leading-tight text-ink">{client.name}</p>
                  <p className="mt-1 text-xs font-semibold text-violet-600">{client.result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

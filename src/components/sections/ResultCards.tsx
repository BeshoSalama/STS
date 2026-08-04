"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/animations";
import type { ResultCard } from "@/types/content";

function CountUpStat({ stat }: { stat: string }) {
  const match = stat.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  const numericText = match?.[2] ?? "0";
  const value = Number(numericText);
  const prefix = match?.[1] ?? "";
  const suffix = match?.[3] ?? "";
  const decimals = numericText.includes(".") ? numericText.split(".")[1].length : 0;
  const countRef = useCountUp({ end: value, decimals, prefix, suffix, duration: 0.95 });

  return <span ref={countRef}>{`${prefix}${(0).toFixed(decimals)}${suffix}`}</span>;
}

export function ResultCards({ resultCards }: { resultCards: ResultCard[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-result-card]"));
    let frameId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          cards.forEach((card) => {
            card.classList.toggle("result-card-visible", entry.isIntersecting);
          });
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -4% 0px" }
    );

    observer.observe(container);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="relative pb-24">
      <div ref={ref} className="container grid gap-5 lg:grid-cols-3">
        {resultCards.map((card, i) => (
          <Link
            key={`${card.title}-${i}`}
            href={`/industries/${card.industrySlug}`}
            data-result-card
            style={{ "--result-card-index": i } as CSSProperties}
            className="result-showcase-card result-motion group relative grid min-h-[192px] overflow-hidden rounded-[1.75rem] border border-violet-400/20 bg-surface-card p-3 shadow-card sm:grid-cols-[0.98fr_1fr] lg:min-h-[212px] lg:grid-cols-1 xl:grid-cols-[0.92fr_1fr]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-ink/5 transition duration-500 group-hover:ring-violet-300/70" />

            <div
              className={cn(
                "result-card-media result-motion relative min-h-[176px] overflow-hidden rounded-[1.25rem] bg-violet-950",
                card.tone === "light" && "bg-violet-gradient-soft"
              )}
            >
              <Image
                src={card.image}
                alt={card.imageAlt}
                fill
                sizes="(min-width: 1280px) 185px, (min-width: 1024px) 29vw, (min-width: 640px) 44vw, 90vw"
                className="result-card-image result-motion object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-violet-950/70 via-transparent to-violet-300/5 opacity-70 transition-opacity duration-500 group-hover:opacity-30" />
              <div className="result-card-scan result-motion" />
              <div className="result-card-neural" aria-hidden="true">
                <span className="result-motion" />
                <span className="result-motion" />
                <span className="result-motion" />
                <span className="result-motion" />
              </div>
              <span className="absolute left-4 top-4 z-[3] font-display text-xs font-extrabold uppercase tracking-widest text-white/70">
                0{i + 1}
              </span>
            </div>

            <div className="relative flex min-w-0 flex-col justify-center px-2 py-4 sm:px-5 lg:min-h-[176px] xl:px-5">
              <span className="result-card-arrow result-motion absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-violet-950 text-white shadow-card sm:right-0 sm:top-0">
                <ArrowUpRight size={17} />
              </span>
              <p className="result-card-stat font-display text-[2.45rem] font-extrabold leading-none tracking-normal text-ink sm:text-[2.7rem] lg:text-[2.45rem] xl:text-[2.55rem]">
                <CountUpStat stat={card.stat} />
              </p>
              <p className="mt-2 font-display text-xl font-extrabold leading-tight tracking-normal text-ink">
                {card.title}
              </p>
              <p className="mt-3 max-w-[28rem] text-sm font-medium leading-relaxed text-muted">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useTextReveal } from "@/lib/animations";
import { EnergyCTA } from "@/components/sections/EnergyCTA";
import { HeroBackground } from "@/components/effects/HeroBackground";

export function Hero() {
  const headlineRef = useTextReveal(0.15);

  return (
    <section className="hero-dark relative flex min-h-[100svh] overflow-hidden pb-20 pt-36 text-white sm:pt-40 lg:items-center lg:pb-24 lg:pt-44">
      <HeroBackground />
      <div className="container relative z-10 grid w-full gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-8">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
            Marketing Growth Agency
          </p>
          <h1 ref={headlineRef as React.RefObject<HTMLHeadingElement>} className="font-display text-6xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-[5.5rem]">
            <span className="block overflow-hidden">
              <span data-word className="inline-block">
                GROWING
              </span>
            </span>
            <span className="block overflow-hidden">
              <span
                data-word
                className="inline-block bg-violet-gradient-text bg-clip-text text-transparent"
              >
                BRANDS
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/82 sm:text-lg">
            We build scalable marketing systems powered by data, creativity, and performance.
          </p>
          <div className="mt-10">
            <EnergyCTA />
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-2xl sm:h-[420px] lg:h-[500px]">
          <p className="hero-visual-tagline absolute right-0 top-2 hidden text-right font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-white/62 sm:block">
            Idea <span className="mx-2 text-violet-300/80">/</span> Strategy <span className="mx-2 text-violet-300/80">/</span> Growth
          </p>
        </div>
      </div>
    </section>
  );
}

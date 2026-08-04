"use client";

import { Target, Lightbulb, TrendingUp, Headset } from "lucide-react";
import { useScrollReveal } from "@/lib/animations";
import type { ValueProp } from "@/types/content";

const icons = { target: Target, bulb: Lightbulb, chart: TrendingUp, headset: Headset };

export function ClientsShowcase({ valueProps }: { valueProps: ValueProp[] }) {
  const valueRef = useScrollReveal<HTMLDivElement>({ selector: "[data-reveal]", stagger: 0.1 });

  return (
    <section className="pb-28">
      <div ref={valueRef} className="container grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((item) => {
          const Icon = icons[item.icon];
          return (
            <div key={item.title} data-reveal className="text-center sm:text-left">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-50 text-violet-700 sm:mx-0">
                <Icon size={22} />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-ink">{item.title}</p>
              <p className="mt-1 text-sm text-muted">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

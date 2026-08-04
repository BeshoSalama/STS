"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { PackageAddOn, PackagePlan } from "@/types/content";

const customPackageBaseFee = 199;

function PlanCard({ index, plan }: { index: number; plan: PackagePlan }) {
  return (
    <article
      data-package-card
      style={{ "--package-card-index": index } as CSSProperties}
      className={cn(
        "package-card package-motion group flex h-full flex-col rounded-4xl border bg-surface-card p-7 shadow-card",
        plan.featured ? "border-violet-500/60 shadow-card-lg" : "border-violet-400/20"
      )}
    >
      {plan.featured && (
        <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-violet-gradient !border-transparent text-white shadow-card">
          <Sparkles size={12} />
          Most Popular
        </Badge>
      )}

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">{plan.tagline}</p>
      <h3 className="mt-3 font-display text-2xl font-extrabold text-ink">{plan.name}</h3>
      <div className="mt-4 flex items-end gap-1">
        <span className="font-display text-4xl font-extrabold text-ink">{plan.price}</span>
        <span className="pb-1 text-sm font-semibold text-muted">{plan.period}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{plan.description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-ink/80">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <Check size={12} strokeWidth={3} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Button
        href="/contact"
        variant={plan.featured ? "primary" : "outline"}
        className="mt-8 w-full justify-center py-3.5"
      >
        {plan.cta}
      </Button>
    </article>
  );
}

function CustomPackageCard({ index, packageAddOns }: { index: number; packageAddOns: PackageAddOn[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const total = useMemo(() => {
    return packageAddOns.reduce((sum, addOn) => (selected[addOn.id] ? sum + addOn.price : sum), 0) + customPackageBaseFee;
  }, [packageAddOns, selected]);

  const selectedCount = Object.values(selected).filter(Boolean).length;

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function requestQuote() {
    setStatus("loading");
    const addOnIds = Object.entries(selected)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    try {
      const response = await fetch("/api/leads/package-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName: "Custom Package", addOnIds }),
      });

      if (!response.ok) throw new Error("Could not save quote");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <article
      data-package-card
      style={{ "--package-card-index": index } as CSSProperties}
      className="package-card package-motion relative flex h-full flex-col rounded-4xl border border-dashed border-violet-400/40 bg-violet-50/40 p-7 shadow-card"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Build it yourself</p>
      <h3 className="mt-3 font-display text-2xl font-extrabold text-ink">Custom Package</h3>
      <div className="mt-4 flex items-end gap-1">
        <span className="font-display text-4xl font-extrabold text-ink">${total.toLocaleString()}</span>
        <span className="pb-1 text-sm font-semibold text-muted">/mo</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        Pick exactly the services you need. {selectedCount > 0 ? `${selectedCount} selected.` : "Nothing selected yet."}
      </p>

      <div className="mt-6 flex-1 space-y-2">
        {packageAddOns.map((addOn) => {
          const isSelected = Boolean(selected[addOn.id]);
          return (
            <button
              key={addOn.id}
              type="button"
              onClick={() => toggle(addOn.id)}
              aria-pressed={isSelected}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors duration-200",
                isSelected
                  ? "border-violet-500/60 bg-white shadow-card"
                  : "border-violet-400/15 bg-white/50 hover:border-violet-400/40"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
                  isSelected ? "border-violet-600 bg-violet-gradient text-white" : "border-violet-300 bg-white text-transparent"
                )}
              >
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold text-ink">{addOn.label}</span>
                <span className="block text-xs text-muted">{addOn.description}</span>
              </span>
              <span className="shrink-0 text-sm font-bold text-violet-600">+${addOn.price}</span>
            </button>
          );
        })}
      </div>

      {status === "done" && <p className="mt-4 text-sm font-semibold text-emerald-600">Quote saved. We will use it when you contact us.</p>}
      {status === "error" && <p className="mt-4 text-sm font-semibold text-red-600">Could not save quote. Please try again.</p>}

      <button
        type="button"
        onClick={requestQuote}
        disabled={status === "loading"}
        className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-violet-gradient px-5 py-3.5 text-sm font-bold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Saving..." : "Request This Package"}
      </button>
    </article>
  );
}

export function PackageCards({ packagePlans, packageAddOns }: { packagePlans: PackagePlan[]; packageAddOns: PackageAddOn[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-package-card]"));
    let frameId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          cards.forEach((card) => {
            card.classList.toggle("package-card-visible", entry.isIntersecting);
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
    <div ref={ref} className="package-showcase container grid gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
      {packagePlans.map((plan, index) => (
        <PlanCard key={plan.name} index={index} plan={plan} />
      ))}
      <CustomPackageCard index={packagePlans.length} packageAddOns={packageAddOns} />
    </div>
  );
}

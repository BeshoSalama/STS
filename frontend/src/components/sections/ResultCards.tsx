"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/animations";
import type { ResultCard } from "@/types/content";

const CARDS_PER_VIEW = 3;
const ROTATION_INTERVAL_MS = 4500;
const SWAP_DURATION_MS = 720;

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
  const swapTimeoutRef = useRef<number | null>(null);
  const [activeGroup, setActiveGroup] = useState(0);
  const [previousGroup, setPreviousGroup] = useState<number | null>(null);
  const [swapDirection, setSwapDirection] = useState(1);
  const totalCards = resultCards.length;
  const groups = useMemo(() => {
    const groupedCards: ResultCard[][] = [];

    for (let i = 0; i < resultCards.length; i += CARDS_PER_VIEW) {
      groupedCards.push(resultCards.slice(i, i + CARDS_PER_VIEW));
    }

    return groupedCards;
  }, [resultCards]);
  const visibleCards = useMemo(() => groups[activeGroup] ?? groups[0] ?? [], [activeGroup, groups]);
  const previousCards = previousGroup === null ? [] : groups[previousGroup] ?? [];

  const showGroup = useCallback(
    (nextGroup: number) => {
      if (groups.length <= 1 || nextGroup === activeGroup) return;

      if (swapTimeoutRef.current) {
        window.clearTimeout(swapTimeoutRef.current);
      }

      const isWrapForward = activeGroup === groups.length - 1 && nextGroup === 0;
      const isForward = nextGroup > activeGroup || isWrapForward;
      setSwapDirection(isForward ? 1 : -1);
      setPreviousGroup(activeGroup);
      setActiveGroup(nextGroup);

      swapTimeoutRef.current = window.setTimeout(() => {
        setPreviousGroup(null);
        swapTimeoutRef.current = null;
      }, SWAP_DURATION_MS);
    },
    [activeGroup, groups.length]
  );

  useEffect(() => {
    if (groups.length <= 1) return;

    const intervalId = window.setInterval(() => {
      showGroup((activeGroup + 1) % groups.length);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [activeGroup, groups.length, showGroup]);

  const showPreviousGroup = useCallback(() => {
    showGroup((activeGroup - 1 + groups.length) % groups.length);
  }, [activeGroup, groups.length, showGroup]);

  const showNextGroup = useCallback(() => {
    showGroup((activeGroup + 1) % groups.length);
  }, [activeGroup, groups.length, showGroup]);

  useEffect(() => {
    setActiveGroup(0);
    setPreviousGroup(null);
  }, [resultCards]);

  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current) {
        window.clearTimeout(swapTimeoutRef.current);
      }
    };
  }, []);

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
  }, [visibleCards]);

  return (
    <section className="relative pb-20">
      <div
        ref={ref}
        className="container result-card-swap-stage relative overflow-hidden"
        style={
          {
            "--swap-enter-offset": `${swapDirection * 76}px`,
            "--swap-exit-offset": `${swapDirection * -76}px`,
          } as CSSProperties
        }
      >
        {previousGroup !== null && (
          <div className="result-card-swap-grid result-card-swap-grid--outgoing pointer-events-none absolute inset-x-0 top-0 grid gap-5 lg:grid-cols-3">
            {previousCards.map((card, i) => (
              <ResultCardLink
                key={`previous-${previousGroup}-${card.industrySlug}-${i}`}
                card={card}
                cardNumber={previousGroup * CARDS_PER_VIEW + i + 1}
                index={i}
                priority={false}
              />
            ))}
          </div>
        )}

        <div
          key={`active-result-group-${activeGroup}`}
          className={cn(
            "result-card-swap-grid grid gap-5 lg:grid-cols-3",
            previousGroup !== null && "result-card-swap-grid--incoming"
          )}
        >
          {visibleCards.map((card, i) => (
            <ResultCardLink
              key={`${activeGroup}-${card.industrySlug}-${card.title}-${i}`}
              card={card}
              cardNumber={activeGroup * CARDS_PER_VIEW + i + 1}
              index={i}
              priority={activeGroup === 0 && i === 0}
            />
          ))}
        </div>
      </div>

      {groups.length > 1 && (
        <div className="container mt-8 flex justify-center">
          <div className="flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-surface-card/55 px-2 py-2 shadow-card backdrop-blur-xl sm:gap-2">
            <button
              type="button"
              aria-label="Show previous industries"
              onClick={showPreviousGroup}
              className="grid h-10 w-10 place-items-center rounded-full border border-violet-200/15 bg-violet-950/75 text-violet-100 transition duration-300 hover:border-violet-200/45 hover:bg-violet-800 hover:shadow-[0_0_18px_rgba(196,92,255,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200"
            >
              <ChevronLeft size={19} />
            </button>

            <div className="flex items-center gap-1">
              {groups.map((group, index) => {
                const firstCardNumber = index * CARDS_PER_VIEW + 1;
                const lastCardNumber = Math.min(firstCardNumber + group.length - 1, totalCards);
                const isActive = index === activeGroup;

                return (
                  <button
                    key={`result-group-${firstCardNumber}`}
                    type="button"
                    aria-label={`Show industries ${firstCardNumber} to ${lastCardNumber}`}
                    aria-current={isActive}
                    onClick={() => showGroup(index)}
                    className="group/result-dot grid h-10 min-w-10 place-items-center rounded-full transition duration-300 hover:bg-violet-200/10 hover:shadow-[0_0_18px_rgba(216,180,254,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200"
                  >
                    <span
                      className={cn(
                        "block h-2.5 rounded-full transition-all duration-300 group-hover/result-dot:bg-violet-100/80 group-hover/result-dot:shadow-[0_0_16px_rgba(216,180,254,0.46)]",
                        isActive ? "w-12 bg-violet-gradient shadow-[0_0_18px_rgba(196,92,255,0.48)]" : "w-2.5 bg-violet-200/35"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              aria-label="Show next industries"
              onClick={showNextGroup}
              className="grid h-10 w-10 place-items-center rounded-full border border-violet-200/15 bg-violet-950/75 text-violet-100 transition duration-300 hover:border-violet-200/45 hover:bg-violet-800 hover:shadow-[0_0_18px_rgba(196,92,255,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ResultCardLink({
  card,
  cardNumber,
  index,
  priority,
}: {
  card: ResultCard;
  cardNumber: number;
  index: number;
  priority: boolean;
}) {
  return (
    <Link
      href={`/industries/${card.industrySlug}`}
      data-result-card
      style={{ "--result-card-index": index } as CSSProperties}
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
          priority={priority}
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
          {String(cardNumber).padStart(2, "0")}
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
  );
}

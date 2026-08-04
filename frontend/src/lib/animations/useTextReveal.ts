"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsapConfig";

/**
 * Expects child elements marked with data-word inside overflow-hidden wrappers,
 * e.g. <span class="overflow-hidden inline-block"><span data-word>Word</span></span>
 */
export function useTextReveal(delay = 0) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const words = Array.from(ref.current.querySelectorAll<HTMLElement>("[data-word]"));
    if (!words.length) return;

    if (prefersReducedMotion()) {
      gsap.set(words, { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: "power4.out",
          stagger: 0.06,
        }
      );
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

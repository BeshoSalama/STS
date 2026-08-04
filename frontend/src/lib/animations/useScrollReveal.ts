"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered, prefersReducedMotion } from "./gsapConfig";

interface RevealOptions {
  y?: number;
  stagger?: number;
  duration?: number;
  delay?: number;
  start?: string;
  selector?: string;
}

export function useScrollReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReducedMotion()) return;

    ensureGsapRegistered();

    const targets = options.selector
      ? Array.from(ref.current.querySelectorAll<HTMLElement>(options.selector))
      : [ref.current];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: options.y ?? 32 },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.9,
          delay: options.delay ?? 0,
          ease: "power3.out",
          stagger: options.stagger ?? 0.12,
          scrollTrigger: {
            trigger: ref.current,
            start: options.start ?? "top 82%",
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

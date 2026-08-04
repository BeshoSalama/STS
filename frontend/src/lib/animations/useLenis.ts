"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsapConfig";

export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if ((navigator.hardwareConcurrency || 8) <= 4) return;

    const lenis = new Lenis({
      duration: 0.82,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}

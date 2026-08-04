"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./gsapConfig";

export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let active = false;
    const influence = 56;

    function reset() {
      if (!active || !el) return;
      active = false;
      el.removeAttribute("data-magnetic-active");
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.42)", overwrite: true });
    }

    function handleMove(e: PointerEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const insideField =
        Math.abs(x) <= rect.width / 2 + influence &&
        Math.abs(y) <= rect.height / 2 + influence;

      if (!insideField) {
        reset();
        return;
      }

      active = true;
      el.setAttribute("data-magnetic-active", "true");
      const horizontalPull = 1 - Math.min(1, Math.abs(x) / (rect.width / 2 + influence));
      const verticalPull = 1 - Math.min(1, Math.abs(y) / (rect.height / 2 + influence));
      const proximity = Math.max(0.18, Math.min(horizontalPull, verticalPull));
      gsap.to(el, {
        x: x * strength * proximity,
        y: y * strength * proximity,
        duration: 0.32,
        ease: "power3.out",
        overwrite: true,
      });
    }

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("blur", reset);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("blur", reset);
    };
  }, [strength]);

  return ref;
}

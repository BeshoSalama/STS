"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

const ENERGY_EVENT = "sts:energy-cta";
const INFLUENCE_RADIUS = 360;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function EnergyCTA() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(pointer: coarse)").matches) return;

    let lastStrength = -1;
    let lastX = -1;
    let lastY = -1;

    const publish = (strength: number, x: number, y: number) => {
      const roundedStrength = Math.round(strength * 1000) / 1000;
      root.style.setProperty("--energy-strength", String(roundedStrength));
      root.toggleAttribute("data-energy-active", roundedStrength > 0.06);
      if (
        Math.abs(roundedStrength - lastStrength) < 0.008 &&
        Math.abs(x - lastX) < 1 &&
        Math.abs(y - lastY) < 1
      ) {
        return;
      }
      lastStrength = roundedStrength;
      lastX = x;
      lastY = y;
      window.dispatchEvent(
        new CustomEvent(ENERGY_EVENT, {
          detail: { strength: roundedStrength, x, y },
        })
      );
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      const strength = clamp(1 - (distance - 28) / INFLUENCE_RADIUS);
      publish(strength * strength, centerX, centerY);
    };

    const reset = () => {
      const rect = root.getBoundingClientRect();
      publish(0, rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    const initialFrame = requestAnimationFrame(reset);

    return () => {
      cancelAnimationFrame(initialFrame);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", reset);
      window.dispatchEvent(new CustomEvent(ENERGY_EVENT, { detail: { strength: 0, x: 0, y: 0 } }));
    };
  }, []);

  return (
    <div ref={rootRef} className="energy-cta">
      <span className="energy-cta__aura" aria-hidden="true" />
      <Button
        href="/contact"
        className="energy-cta__button min-w-[240px] justify-between px-8 py-4 text-base sm:min-w-[280px] sm:px-9 sm:py-5 sm:text-lg"
      >
        <span className="energy-cta__inner-network" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className="energy-cta__label">Get Started</span>
      </Button>
    </div>
  );
}

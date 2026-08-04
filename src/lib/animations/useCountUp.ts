"use client";

import { useEffect, useRef } from "react";
import { gsap, ensureGsapRegistered } from "./gsapConfig";

interface CountUpOptions {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function useCountUp({ end, decimals = 0, prefix = "", suffix = "", duration = 1.05 }: CountUpOptions) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = (value: number) => `${prefix}${value.toFixed(decimals)}${suffix}`;

    ensureGsapRegistered();
    const counter = { value: 0 };
    const initialValue = format(0);
    let tween: gsap.core.Tween | null = null;

    const reset = () => {
      tween?.kill();
      tween = null;
      counter.value = 0;
      el.textContent = initialValue;
    };

    const play = () => {
      reset();
      tween = gsap.to(counter, {
        value: end,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(counter.value);
        },
      });
    };

    reset();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          return;
        }

        reset();
      },
      { threshold: 0 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end, decimals, prefix, suffix, duration]);

  return ref;
}

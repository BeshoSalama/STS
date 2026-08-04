"use client";

import { useEffect } from "react";

const RIPPLE_SELECTOR = "button, [data-ripple], a[aria-label]";

export function MouseRipple() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      const host = element?.closest<HTMLElement>(RIPPLE_SELECTOR);
      if (!host || host.matches("input, textarea, select") || host.hasAttribute("data-no-ripple")) return;

      const rect = host.getBoundingClientRect();
      const diameter = Math.ceil(Math.hypot(rect.width, rect.height) * 2);
      const ripple = document.createElement("span");
      ripple.className = "site-ripple";
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${event.clientX - rect.left - diameter / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - diameter / 2}px`;
      host.classList.add("site-ripple-host");
      host.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return null;
}

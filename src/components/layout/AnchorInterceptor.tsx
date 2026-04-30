"use client";

import { useEffect } from "react";
import { lenisStore } from "@/lib/lenis-store";

// How long to wait before starting the scroll (ms).
// Hero clicks: enough time to see the burst ring expand.
// Nav clicks: just a breath before the scroll begins.
const HERO_DELAY = 440;
const NAV_DELAY  = 80;

const SCROLL_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/** Intercepts same-page anchor clicks to route through Lenis instead of the native browser jump. */
export default function AnchorInterceptor() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      // Prevent native instant jump AND Lenis's own handler
      // (Lenis v1 checks event.defaultPrevented before calling scrollTo)
      e.preventDefault();

      const delay = anchor.closest("#hero") ? HERO_DELAY : NAV_DELAY;

      setTimeout(() => {
        const lenis = lenisStore.get();
        if (lenis) {
          lenis.scrollTo(target as HTMLElement, {
            duration: 1.9,
            easing:   SCROLL_EASING,
          });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, delay);
    }

    // Capture phase: fires before Lenis's bubble-phase handler,
    // so our preventDefault() reaches Lenis in time.
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return null;
}

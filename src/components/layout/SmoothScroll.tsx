"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { lenisStore } from "@/lib/lenis-store";

/** Wraps the app in Lenis smooth scroll and publishes the instance to lenisStore. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Skip Lenis on touch / small viewports — native momentum scroll is smoother on mobile,
    // and Lenis fights iOS Safari's address-bar behavior, causing jank.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isNarrow = window.innerWidth < 1024;
    if (isTouch || isNarrow) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    lenisStore.set(lenis);

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisStore.clear();
    };
  }, []);

  return <>{children}</>;
}

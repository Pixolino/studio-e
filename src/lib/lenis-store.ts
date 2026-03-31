import type Lenis from "lenis";

// Module-level singleton — set by SmoothScroll on mount, read by AnchorInterceptor
let instance: Lenis | null = null;

export const lenisStore = {
  set:   (l: Lenis)  => { instance = l; },
  get:   ()          => instance,
  clear: ()          => { instance = null; },
};

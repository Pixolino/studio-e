"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { siteConfig } from "@/lib/site";
import MagnoliaScroll, { MagnoliaScrollHandle } from "@/components/ui/HeroMagnoliaScroll";

const GLITCH_ANIMATION_CHARS = "01<>{}[]|/\\!#@%*+=~^?";

/** Scramble-decodes text on hover (25 ms interval, 1.2 chars/tick). */
function DecodeText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    let iteration = 0;
    clearInterval(timerRef.current!);
    timerRef.current = setInterval(() => {
      setDisplay(
        text.split("").map((ch, i) => {
          if (ch === " ") return " ";
          if (i < iteration) return ch;
          return GLITCH_ANIMATION_CHARS[Math.floor(Math.random() * GLITCH_ANIMATION_CHARS.length)];
        }).join("")
      );
      iteration += 1.2;
      if (iteration > text.length) {
        clearInterval(timerRef.current!);
        setDisplay(text);
      }
    }, 25);
  }, [text]);

  const reset = useCallback(() => {
    clearInterval(timerRef.current!);
    setDisplay(text);
  }, [text]);

  return <span onMouseEnter={start} onMouseLeave={reset}>{display}</span>;
}

const lines = ["WE BUILD", "BRANDS THAT", "OUTLAST THE", "MARKET."];

function LineReveal({ text, delay }: { text: string; delay: number }) {
  return (
    <div className="overflow-hidden">
      <motion.span
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        className="block"
      >
        {text}
      </motion.span>
    </div>
  );
}

export default function Hero() {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const magnoliaRef  = useRef<MagnoliaScrollHandle>(null);

  // Single source of truth: 0→1 over the wrapper's scrollable range
  const { scrollY } = useScroll();
  const heroScrollProgress = useMotionValue(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const el = wrapperRef.current;
    if (!el) return;
    // Progress reaches 1 when the next section is halfway up the viewport
    const maxScroll = Math.max(1, el.offsetHeight);
    heroScrollProgress.set(Math.max(0, Math.min(1, y / maxScroll)));
  });

  // Ranges end at ~0.93 so all elements finish just as the next section's top reaches the viewport.
  const headlineY        = useTransform(heroScrollProgress, [0.55, 0.93], [0, -70]);
  const headlineOpacity  = useTransform(heroScrollProgress, [0.60, 0.93], [1, 0]);
  const bottomBarOpacity = useTransform(heroScrollProgress, [0.52, 0.88], [1, 0]);
  const pulseOpacity     = useTransform(heroScrollProgress, [0, 0.10], [1, 0]);
  const magnoliaProgress = useTransform(heroScrollProgress, [0, 0.50], [0, 1]);

  return (
    // Tall wrapper — gives scroll room so the animation completes before next section appears
    <div ref={wrapperRef} className="relative h-[150dvh]">
      <section
        id="hero"
        className="sticky top-0 flex h-[72dvh] flex-col overflow-hidden bg-ink grain-overlay px-8 pb-10 pt-20 md:h-[80dvh] md:px-16 md:pt-28 lg:h-[85dvh] lg:pb-14 xl:h-dvh"
        onClick={(e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          if (e.clientX > rect.left + rect.width * 0.56 && !(e.target as Element).closest("a, button")) {
            magnoliaRef.current?.triggerClick();
          }
        }}
      >
        {/* Right-half click zone — gives custom cursor the pointer state over the magnolia */}
        <div
          aria-hidden
          data-cursor="pointer"
          className="absolute top-0 right-0 bottom-0 w-[44%] z-20"
        />

        {/* Magnolia ASCII scroll art */}
        <MagnoliaScroll ref={magnoliaRef} progress={magnoliaProgress} />

        {/* Headline block */}
        <motion.div
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="relative z-10 mt-[6vh] xl:mt-auto"
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mb-6 font-mono text-[11px] md:text-xs uppercase tracking-[0.25em] text-periwinkle/80"
          >
            Multi-disciplinary Brand Studio&ensp;&mdash;&ensp;South Florida
          </motion.p>

          <h1 className="font-display text-[10vw] font-light leading-[0.88] tracking-tight text-cream md:text-[7.5vw] xl:text-[clamp(4rem,7.5vw,8.5rem)]">
            {lines.map((line, i) => (
              <LineReveal key={i} text={line} delay={0.35 + i * 0.11} />
            ))}
          </h1>
        </motion.div>

        {/* Bottom bar */}
        <motion.div style={{ opacity: bottomBarOpacity }} className="relative z-10 mt-8 flex flex-col gap-6 md:mt-14 md:flex-row md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05, ease: "easeOut" }}
            className="max-w-xs text-sm leading-relaxed text-muted md:text-base"
          >
            {siteConfig.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.2, ease: "easeOut" }}
            className="flex items-center gap-6"
          >
            <a
              href={siteConfig.cta.href}
              data-cursor="pointer"
              className="group inline-flex items-center gap-3 font-mono text-[11px] md:text-xs font-medium uppercase tracking-[0.08em] text-cream"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
                <span className="inline-block transition-transform duration-300 group-hover:rotate-45">↗</span>
              </span>
              {siteConfig.cta.label}
            </a>
            <a
              href="#work"
              data-cursor="pointer"
              className="font-mono text-[11px] md:text-xs uppercase tracking-[0.08em] text-muted underline decoration-gold underline-offset-4 transition-colors duration-300 hover:text-periwinkle"
            >
              <DecodeText text="See our work" />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll pulse */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ opacity: pulseOpacity }}
          transition={{ duration: 0.6, delay: 1.7 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ scaleY: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="h-10 w-px origin-top bg-gradient-to-b from-periwinkle/60 to-transparent"
          />
        </motion.div>
      </section>
    </div>
  );
}

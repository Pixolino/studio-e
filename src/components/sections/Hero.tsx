"use client";

import { useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { siteConfig } from "@/lib/site";
import AsciiGlitch from "@/components/ui/AsciiGlitch";

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
  const containerRef = useRef<HTMLElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const { scrollY } = useScroll();

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -9999, y: -9999 };
  }, []);

  const headlineY = useTransform(scrollY, [0, 900], [0, -60]);
  const headlineOpacity = useTransform(scrollY, [0, 700], [1, 0]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      id="hero"
      className="relative flex h-[72dvh] flex-col overflow-hidden bg-ink grain-overlay px-8 pb-10 pt-20 md:h-[80dvh] md:px-16 md:pt-28 lg:h-[85dvh] lg:pb-14 xl:h-dvh"
    >
      <AsciiGlitch mouseRef={mouseRef} />
      {/* Headline block */}
      <motion.div
        style={{ y: headlineY, opacity: headlineOpacity }}
        className="relative z-10 mt-[6vh] xl:mt-auto"
      >
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.25em] text-muted"
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
      <div className="relative z-10 mt-8 flex flex-col gap-6 md:mt-14 md:flex-row md:items-end md:justify-between">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: "easeOut" }}
          className="max-w-xs text-sm leading-relaxed text-muted"
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
            className="group inline-flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-cream"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
              ↗
            </span>
            {siteConfig.cta.label}
          </a>
          <a
            href="#work"
            data-cursor="pointer"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted underline decoration-gold underline-offset-4 transition-colors duration-300 hover:text-cream"
          >
            See our work
          </a>
        </motion.div>
      </div>

      {/* Scroll pulse */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.7 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ scaleY: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="h-10 w-px origin-top bg-gradient-to-b from-gold/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}

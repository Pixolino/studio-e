"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import PeriodicGlitch from "@/components/ui/PeriodicGlitch";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const reveal = (delay: number) => ({
    initial: { y: "105%" },
    animate: inView ? { y: 0 } : {},
    transition: { duration: 0.9, delay, ease },
  });

  return (
    <section
      ref={ref}
      id="contact"
      className="relative overflow-hidden bg-gold"
    >
      {/* ── Vertical grid lines — slide in from top / bottom ─────── */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "top" }}
        className="absolute inset-y-0 left-1/3 hidden w-0.5 bg-violet/30 md:block"
      />
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "bottom" }}
        className="absolute inset-y-0 left-2/3 hidden w-0.5 bg-violet/30 md:block"
      />

      {/* ── Header — no horizontal padding so h2 grid aligns to lines */}
      <div className="relative pt-14 pb-14 md:pt-20 md:pb-20">

        {/* Overline — mobile only; desktop version lives inside the h2 grid */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute right-8 top-14 font-mono text-sm uppercase tracking-[0.25em] text-violet md:hidden"
        >
          <PeriodicGlitch text="/Get in Touch/" inView={inView} />
        </motion.p>

        {/* ── Mobile headline (< md) ─────────────────────────────── */}
        <h2 className="px-8 font-display text-5xl font-medium uppercase leading-[0.88] tracking-tight text-ink md:hidden">
          <div className="overflow-hidden">
            <motion.span className="block" {...reveal(0.05)}>LET&rsquo;S BRING</motion.span>
          </div>
          <div className="overflow-hidden pl-[22%]">
            <motion.span className="block" {...reveal(0.15)}>YOUR VISION</motion.span>
          </div>
          <div className="overflow-hidden text-right">
            <motion.span className="block" {...reveal(0.25)}>TO LIFE.</motion.span>
          </div>
        </h2>

        {/* ── Desktop headline — 3-column grid aligned to vertical lines */}
        {/*    font-size kept viewport-relative so YOUR VISION fits in 1/3 col */}
        <h2
          className="hidden font-display font-medium uppercase leading-[0.9] tracking-tight text-ink md:grid md:grid-cols-3 md:gap-y-[0.30em]"
          style={{ fontSize: "clamp(2rem, 4.6vw, 5.5rem)" }}
        >
          {/* Row 1 — LET'S: right-aligned in col 1, flush against left line */}
          <div className="col-start-1 row-start-1 overflow-hidden pr-[0.28em] text-right">
            <motion.span className="block" {...reveal(0.05)}>LET&rsquo;S</motion.span>
          </div>

          {/* Row 1 — BRING + overline: share the center column */}
          <div className="col-start-2 row-start-1 flex items-center pl-[0.28em]">
            <div className="overflow-hidden shrink-0">
              <motion.span className="block" {...reveal(0.15)}>BRING</motion.span>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-1 text-center font-mono text-sm uppercase tracking-[0.25em] text-violet"
            >
              <PeriodicGlitch text="/Get in Touch/" inView={inView} />
            </motion.p>
          </div>

          {/* Row 2 — YOUR VISION: centered within middle column */}
          <div className="col-start-2 row-start-2 overflow-hidden text-center">
            <motion.span className="block" {...reveal(0.25)}>YOUR VISION</motion.span>
          </div>

          {/* Row 3 — TO: right-aligned within middle column */}
          <div className="col-start-2 row-start-3 overflow-hidden pr-[0.28em] text-right">
            <motion.span className="block" {...reveal(0.35)}>TO</motion.span>
          </div>
          <div className="col-start-3 row-start-3 overflow-hidden pl-[0.28em]">
            <motion.span className="block" {...reveal(0.4)}>LIFE.</motion.span>
          </div>
        </h2>
      </div>

      {/* ── Horizontal divider — below header, slides in from left ── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "left" }}
        className="h-0.5 bg-violet/30"
      />

      {/* ── Form ─────────────────────────────────────────────────── */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 2.5 }}
        onSubmit={(e) => e.preventDefault()}
        className="py-10 md:py-14"
      >
        <div className="mx-auto flex w-full flex-col gap-9 px-8 md:w-1/3 md:px-10">

          {/* NAME */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet md:text-xs">
              Name
            </label>
            <input
              type="text"
              className="border-b border-ink/35 bg-transparent pb-2 font-mono text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet md:text-xs">
              Email
            </label>
            <input
              type="email"
              className="border-b border-ink/35 bg-transparent pb-2 font-mono text-sm text-ink outline-none transition-colors focus:border-ink"
            />
          </div>

          {/* I'D LIKE TO WORK ON */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet md:text-xs">
              I&rsquo;d like to work on...
            </label>
            <input
              type="text"
              className="border border-ink/20 bg-periwinkle/30 px-3 py-2 font-mono text-sm text-ink outline-none transition-colors focus:border-ink/50"
            />
          </div>

          {/* TELL US MORE */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet md:text-xs">
              Tell us more...
            </label>
            <textarea
              rows={5}
              className="resize-none border border-ink/20 bg-transparent p-3 font-mono text-sm text-ink outline-none transition-colors focus:border-ink/50"
            />
          </div>

          {/* SUBMIT */}
          <div className="flex justify-end">
            <button
              type="submit"
              data-cursor="pointer"
              className="group/btn inline-flex items-center gap-2 rounded-full border border-violet px-7 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-violet transition-all duration-300 hover:border-ink hover:bg-ink hover:text-gold md:text-xs"
            >
              Talk dirty to me
              <img
                src="/hand-ascii.png"
                alt=""
                aria-hidden
                className="h-7 w-auto transition-transform duration-300 group-hover/btn:translate-x-1"
                style={{ filter: "brightness(0)", opacity: 0.6 }}
              />
            </button>
          </div>

        </div>
      </motion.form>

      {/* ── Horizontal divider — below form, slides in from right ─── */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 5, delay: 0.75, ease }}
        style={{ transformOrigin: "right" }}
        className="h-0.5 bg-violet/30"
      />

      {/* Bottom breathing room */}
      <div className="h-12 md:h-16" />

    </section>
  );
}
